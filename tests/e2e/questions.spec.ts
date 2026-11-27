import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  discoverQuestions, exampleCodeName, questionExamples, questionTitle, questionTopics, switchableLanguages,
  type DiscoveredQuestion, type ExampleVariant,
} from '../support/questions';
import { expandQuestion, openQuestion, questionRow, questionsInListOrder, rateByKeyboard, reviewState, storedCards } from '../support/review';

const questions = questionsInListOrder(discoverQuestions());
const start = new Date('2026-11-26T09:00:00.000Z');
const minute = 60_000;
const day = 24 * 60 * minute;
// A topic with at least three questions, so a review session has a due card, a seen card and a new one.
const topic = questionTopics.find((name) => questions.filter(({ folder }) => folder === name).length >= 3);
const inTopic = questions.filter(({ folder }) => folder === topic);

test('there are questions to review', () => {
  expect(questions.length, 'question files').toBeGreaterThan(1);
  expect(topic, 'a topic with three or more questions').toBeDefined();
});

test('Space reveals the answer, number keys rate it, and ratings survive a reload', async ({ page }) => {
  await page.clock.install({ time: start });
  const [solid, missed] = questions;

  await page.goto('questions/');
  await expect(questionRow(page, solid)).toHaveCount(1);
  await expect(reviewState(page, solid)).toHaveText('New');
  await expect(reviewState(page, missed)).toHaveText('New');

  await openQuestion(page, solid);
  await rateByKeyboard(page, solid, 'solid');
  await expect(page).toHaveURL(/\/pom-proof\/questions\/$/);
  await expect(reviewState(page, solid)).toHaveText('Box 1');

  await openQuestion(page, missed);
  await rateByKeyboard(page, missed, 'missed');
  await expect(reviewState(page, missed)).toHaveText('Box 0');

  const cards = await storedCards(page);
  expect(cards[solid.id], 'a first solid goes to box 1, due a day later').toMatchObject({ box: 1, seen: 1, last: 'solid' });
  expect(Date.parse(cards[solid.id].due) - start.getTime()).toBeGreaterThanOrEqual(day);
  expect(Date.parse(cards[solid.id].due) - start.getTime()).toBeLessThan(day + 10 * minute);
  expect(cards[missed.id], 'a missed card goes to box 0').toMatchObject({ box: 0, seen: 1, last: 'missed' });

  await page.reload();
  await expect(reviewState(page, solid)).toHaveText('Box 1');
  await expect(reviewState(page, missed)).toHaveText('Box 0');
  await expect(reviewState(page, questions[2])).toHaveText('New');

  // The missed card comes back after ten minutes; the solid one waits a day.
  await page.clock.fastForward(11 * minute);
  await page.reload();
  await expect(reviewState(page, missed)).toHaveText('Due');
  await expect(reviewState(page, solid)).toHaveText('Box 1');
});

test('Review due questions shows due cards first, then new ones, and skips cards not yet due', async ({ page }) => {
  await page.clock.install({ time: start });
  // The list sorts by title, so the due card is the last one and the seen card is the first.
  const seen = inTopic[0];
  const due = inTopic.at(-1)!;
  const firstNew = inTopic[1];
  expect(new Set([seen.id, due.id, firstNew.id]).size, 'three different questions').toBe(3);

  await openQuestion(page, due);
  await rateByKeyboard(page, due, 'missed');
  await openQuestion(page, seen);
  await rateByKeyboard(page, seen, 'solid');
  await page.clock.fastForward(11 * minute);

  await page.goto(`questions/?topic=${topic}`);
  await expect(page.getByRole('list', { name: 'Questions' }).getByRole('listitem').filter({ visible: true })).toHaveCount(inTopic.length);
  await expect(reviewState(page, due)).toHaveText('Due');
  await expect(reviewState(page, seen)).toHaveText('Box 1');
  await expect(reviewState(page, firstNew)).toHaveText('New');

  await page.getByRole('button', { name: 'Review due questions' }).click();
  await expect(page).toHaveURL(new RegExp(`/questions/${due.id}/\\?(?:.*&)?review=1`));
  await openQuestionReady(page);
  await rateByKeyboard(page, due, 'solid');

  // Next is the first new question in list order; the seen card is not due, so it is skipped.
  await expect(page).toHaveURL(new RegExp(`/questions/${firstNew.id}/\\?`));
  await expect(page.getByRole('heading', { level: 1, name: String(firstNew.frontmatter.title) })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('topic'), 'the session keeps the topic filter').toBe(topic);
});

type FollowUp = { question: string; answer: string };
const followUps = (question: DiscoveredQuestion) => (question.frontmatter.followUps ?? []) as FollowUp[];
const sample = questions.find((question) => followUps(question).length > 0 && typeof question.frontmatter.trap === 'string');

test('expanding a bank card shows the answer inline, rates it there, and links to its page', async ({ page }) => {
  expect(sample, 'a question with follow-ups and a trap').toBeDefined();
  const question = sample!;
  await page.clock.install({ time: start });
  await page.goto('questions/');
  await expect(reviewState(page, question)).toHaveText('New');
  // The title is a heading in the card, not a link; the card's only page link is "Open page".
  await expect(questionRow(page, question).getByRole('link', { name: questionTitle(question), exact: true })).toHaveCount(0);

  const card = await expandQuestion(page, question);
  await expect(card.getByText('What they look for', { exact: true })).toBeVisible();
  for (const item of question.frontmatter.looksFor as string[]) await expect(card.getByText(item, { exact: true }).first()).toBeVisible();
  await expect(card.getByRole('complementary', { name: 'The trap' })).toContainText(String(question.frontmatter.trap));
  await expect(card.getByText("They'll ask next", { exact: true })).toBeVisible();

  const [followUp] = followUps(question);
  const followUpAnswer = card.getByText(followUp.answer, { exact: true });
  await expect(followUpAnswer).toBeHidden();
  await card.getByText(followUp.question, { exact: true }).click();
  await expect(followUpAnswer).toBeVisible();

  await card.getByRole('group', { name: 'Rate your answer' }).getByRole('button', { name: 'Solid', exact: true }).click();
  await expect(reviewState(page, question)).toHaveText('Box 1');
  await expect(card.getByRole('group', { name: 'Rate your answer' }).getByRole('button', { name: 'Solid', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect((await storedCards(page))[question.id], 'the inline rating is stored like a page rating').toMatchObject({ box: 1, seen: 1, last: 'solid' });
  await page.reload();
  await expect(reviewState(page, question)).toHaveText('Box 1');

  const card2 = await expandQuestion(page, question);
  await card2.getByRole('link', { name: 'Open page', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/pom-proof/${question.path}$`));
  await expect(page.getByRole('heading', { level: 1, name: questionTitle(question) })).toBeVisible();
  // The question page keeps its recall gate.
  await expect(page.getByText(String(question.frontmatter.oneLine), { exact: true })).toBeHidden();
  await expect(page.getByText('Show answer')).toBeVisible();
});

test('rapidly double-clicking Solid rates a bank card only once per visit', async ({ page }) => {
  const [question] = questions;
  await page.clock.install({ time: start });
  await page.goto(`questions/#${question.slug}`);
  const card = questionRow(page, question);
  const ratings = card.getByRole('group', { name: 'Rate your answer' });
  const solid = ratings.getByRole('button', { name: 'Solid', exact: true });
  // The rating's own status line; a code example in the card has a status line of its own.
  const feedback = card.getByRole('status').and(card.locator('[data-question-feedback]'));

  await solid.dblclick({ delay: 10 });
  expect((await storedCards(page))[question.id]).toMatchObject({ box: 1, seen: 1, last: 'solid' });
  await expect(reviewState(page, question)).toHaveText('Box 1');
  await expect(solid).toHaveAttribute('aria-pressed', 'true');
  for (const button of await ratings.getByRole('button').all()) await expect(button).toBeDisabled();
  await expect(feedback).toHaveText('Rated Solid. Next review in 1 day.');

  await page.clock.fastForward(day);
  await page.reload();
  await expect(solid).toBeEnabled();
  await solid.click();
  expect((await storedCards(page))[question.id]).toMatchObject({ box: 2, seen: 2, last: 'solid' });
  await expect(feedback).toHaveText('Rated Solid. Next review in 3 days.');
});

test('a deep link opens its card in the list', async ({ page }) => {
  const question = questions.at(-1)!;
  await page.goto(`questions/#${question.slug}`);
  const card = questionRow(page, question);
  await expect(card.locator('details').first()).toHaveAttribute('open', '');
  await expect(card.getByText(String(question.frontmatter.oneLine), { exact: true })).toBeVisible();
  await expect(card.getByRole('heading', { level: 2, name: questionTitle(question), exact: true })).toBeInViewport();
});

/** The text search can match: title, lead, looks-for, trap, follow-ups and body, but not example code. */
const searchFields = (question: DiscoveredQuestion) => {
  const { title, oneLine, looksFor, trap } = question.frontmatter;
  return {
    trap: String(trap ?? ''),
    body: question.body.replace(/\]\([^)]*\)|https?:\/\/\S+/g, ' '),
    rest: [title, oneLine, ...((looksFor ?? []) as string[]), ...followUps(question).flatMap(({ question: ask, answer }) => [ask, answer])].join(' '),
  };
};

/** Topic chip labels as the list renders them; they are searchable too. */
const topicLabels = (page: Page) => page.locator('[data-topic-filter] > span:first-child').allTextContents();

/**
 * A word of at least nine letters that appears in one question's chosen field and nowhere else: not in
 * its other fields, not in any other question and not in a topic label. Searching it can only match
 * through that field.
 */
function wordOnlyIn(field: 'trap' | 'body', labels: string[]) {
  const all = questions.map((question) => ({ question, text: searchFields(question) }));
  const chips = [...questionTopics.map((topic) => topic.replace(/-/g, ' ')), ...labels].join(' ').toLowerCase();
  for (const { question, text } of all) {
    const own = [text.rest, field === 'trap' ? text.body : text.trap].join(' ').toLowerCase();
    for (const word of new Set(text[field].match(/[A-Za-z]{9,}/g) ?? [])) {
      const term = word.toLowerCase();
      if (own.includes(term) || chips.includes(term)) continue;
      if (all.some((other) => other.question !== question
        && [other.text.trap, other.text.body, other.text.rest].join(' ').toLowerCase().includes(term))) continue;
      return { question, term };
    }
  }
  return undefined;
}

for (const field of ['trap', 'body'] as const) {
  test(`search finds a question by a word only its ${field} has`, async ({ page }) => {
    await page.goto('questions/');
    const labels = await topicLabels(page);
    expect(labels.length, 'topic chip labels').toBe(questionTopics.length);
    const match = wordOnlyIn(field, labels);
    expect(match, `a word unique to one question's ${field}`).toBeDefined();
    const search = page.getByRole('searchbox', { name: `Search ${questions.length} questions` });
    await search.fill(match!.term);
    await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe(match!.term);
    await expect(page.getByRole('list', { name: 'Questions' }).getByRole('listitem').filter({ visible: true })
      .filter({ has: page.getByRole('heading', { level: 2 }) })).toHaveCount(1);
    await expect(questionRow(page, match!.question)).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: /^\d+ shown$/ })).toHaveText('1 shown');
  });
}

// ----- code examples -----

const preferenceKey = 'pom-proof:example-lang';
const languageNames: Record<string, string> = { ts: 'TypeScript', js: 'JavaScript', python: 'Python', java: 'Java' };
const exampleCases = questions.flatMap((question) => questionExamples(question).map((example, index) => ({ question, example, index })));
const switchable = exampleCases.find(({ example }) => example.variants.length > 1);
const single = exampleCases.find(({ example }) => example.variants.length === 1);

/** One example's figure, its language buttons, its code regions and its Copy control. */
function exampleParts(scope: Locator | Page, index: number) {
  const figure = scope.getByRole('figure').nth(index);
  const languages = figure.getByRole('group', { name: 'Example language' });
  return {
    figure,
    languages,
    button: (variant: ExampleVariant) => languages.getByRole('button', { name: languageNames[variant.lang], exact: true }),
    code: (variant: ExampleVariant) => figure.getByRole('region', { name: exampleCodeName(variant) }),
    copy: figure.getByRole('button', { name: 'Copy', exact: true }),
    status: figure.getByRole('status'),
  };
}

/** A line long enough to tell one variant from another. */
const telltale = (variant: ExampleVariant) => variant.code.split('\n').map((line) => line.trim()).find((line) => line.length >= 12) ?? variant.code.trim();

/** The shown variant is `shown`: its code is in the page, its button pressed, every other variant absent. */
async function expectShown(parts: ReturnType<typeof exampleParts>, variants: ExampleVariant[], shown: ExampleVariant) {
  await expect(parts.code(shown)).toBeVisible();
  await expect(parts.code(shown)).toContainText(telltale(shown));
  await expect(parts.figure.locator('figcaption')).toContainText(shown.label);
  for (const variant of variants) {
    await expect(parts.button(variant)).toHaveAttribute('aria-pressed', String(variant === shown));
    if (variant !== shown) await expect(parts.code(variant)).toHaveCount(0);
  }
}

const savedLanguage = (page: Page) => page.evaluate((key) => localStorage.getItem(key), preferenceKey);

test('content has a switchable example and a single-language one', () => {
  expect(switchable, 'an example with two or more variants').toBeDefined();
  expect(single, 'an example with one variant').toBeDefined();
});

test('the example language persists across a reload and onto the question page', async ({ page }) => {
  const { question, example, index } = switchable!;
  const [first, second] = example.variants;
  await page.goto('questions/');
  const parts = exampleParts(await expandQuestion(page, question), index);
  await expect(parts.languages.getByRole('button')).toHaveText(example.variants.map(({ lang }) => languageNames[lang]));
  await expectShown(parts, example.variants, first);
  expect(await savedLanguage(page), 'nothing is saved before a choice').toBeNull();

  await parts.button(second).click();
  await expectShown(parts, example.variants, second);
  expect(await savedLanguage(page)).toBe(second.lang);

  await page.reload();
  const card = await expandQuestion(page, question);
  await expectShown(exampleParts(card, index), example.variants, second);

  await card.getByRole('link', { name: 'Open page', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: questionTitle(question) })).toBeVisible();
  await page.getByText('Show answer').click();
  await expectShown(exampleParts(page.locator('[data-answer]'), index), example.variants, second);

  await exampleParts(page.locator('[data-answer]'), index).button(first).click();
  await expectShown(exampleParts(page.locator('[data-answer]'), index), example.variants, first);
  expect(await savedLanguage(page)).toBe(first.lang);
});

test('a saved language an example lacks shows its first variant and keeps the saved choice', async ({ page }) => {
  const { question, example, index } = switchable!;
  const missing = switchableLanguages.find((lang) => !example.variants.some((variant) => variant.lang === lang));
  expect(missing, 'a switchable language the example lacks').toBeDefined();
  await page.goto('questions/');
  await page.evaluate(([key, value]) => localStorage.setItem(key, value), [preferenceKey, missing!]);
  await page.reload();

  const parts = exampleParts(await expandQuestion(page, question), index);
  await expectShown(parts, example.variants, example.variants[0]);
  await expect(parts.languages.getByRole('button', { name: languageNames[missing!], exact: true })).toHaveCount(0);
  expect(await savedLanguage(page), 'the fallback does not overwrite the saved language').toBe(missing);

  // A single-language example offers Copy and no language buttons.
  const other = exampleParts(await expandQuestion(page, single!.question), single!.index);
  await expect(other.code(single!.example.variants[0])).toBeVisible();
  await expect(other.languages).toHaveCount(0);
  await expect(other.copy).toBeVisible();
  expect(await savedLanguage(page)).toBe(missing);
});

test('when storage refuses writes, the chosen language holds for the page and is not kept', async ({ page }) => {
  const { question, example, index } = switchable!;
  const [first, second] = example.variants;
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
  });
  const errors: Error[] = [];
  page.on('pageerror', (error) => errors.push(error));
  await page.goto('questions/');
  const parts = exampleParts(await expandQuestion(page, question), index);
  await parts.button(second).click();
  await expectShown(parts, example.variants, second);
  expect(errors, 'page errors').toEqual([]);

  await page.reload();
  await expectShown(exampleParts(await expandQuestion(page, question), index), example.variants, first);
});

test('Copy puts the shown variant on the clipboard and announces Copied', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const { question, example, index } = switchable!;
  const [first, second] = example.variants;
  // The Windows clipboard stores CRLF line endings; compare the text line by line.
  const clipboard = async () => (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n').trimEnd();
  await page.goto('questions/');
  const parts = exampleParts(await expandQuestion(page, question), index);
  await expect(parts.status).toHaveText('');

  await parts.button(second).click();
  await parts.copy.click();
  await expect(parts.status).toHaveText('Copied');
  expect(await clipboard()).toBe(second.code.trimEnd());

  // Switching clears the announcement, and Copy then takes the new variant.
  await parts.button(first).click();
  await expect(parts.status).toHaveText('');
  await parts.copy.click();
  await expect(parts.status).toHaveText('Copied');
  expect(await clipboard()).toBe(first.code.trimEnd());
});

test('search does not match words that appear only in example code', async ({ page }) => {
  expect(switchable, 'a question with example code').toBeDefined();
  await page.goto('questions/');
  const labels = (await topicLabels(page)).join(' ').toLowerCase();
  const searchable = questions.map((question) => Object.values(searchFields(question)).join(' ')).join(' ').toLowerCase();
  const codeWords = exampleCases.flatMap(({ example }) => example.variants.flatMap(({ code }) => code.match(/[A-Za-z]{8,}/g) ?? []));
  const term = codeWords.map((word) => word.toLowerCase()).find((word) => !searchable.includes(word) && !labels.includes(word));
  expect(term, 'a word that appears only in example code').toBeDefined();

  const search = page.getByRole('searchbox', { name: `Search ${questions.length} questions` });
  const shown = page.getByRole('status').filter({ hasText: /^\d+ shown$/ });
  await search.fill(questionTitle(switchable!.question));
  await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe(questionTitle(switchable!.question));
  await expect(questionRow(page, switchable!.question)).toBeVisible();
  await search.fill(term!);
  await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe(term);
  await expect(shown).toHaveText('0 shown');
  await expect(questionRow(page, switchable!.question)).toBeHidden();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('an example shows its first variant, without language buttons or Copy', async ({ page }) => {
    const { question, example, index } = switchable!;
    await page.goto('questions/');
    const parts = exampleParts(await expandQuestion(page, question), index);
    await expect(parts.code(example.variants[0])).toBeVisible();
    await expect(parts.code(example.variants[0])).toContainText(telltale(example.variants[0]));
    for (const variant of example.variants.slice(1)) await expect(parts.code(variant)).toHaveCount(0);
    await expect(parts.languages).toBeHidden();
    await expect(parts.copy).toBeHidden();
  });

  test('a card and its first follow-up still expand', async ({ page }) => {
    expect(sample, 'a question with follow-ups').toBeDefined();
    await page.goto('questions/');
    const card = await expandQuestion(page, sample!);
    const [followUp] = followUps(sample!);
    await expect(card.getByText(followUp.answer, { exact: true })).toBeHidden();
    await card.getByText(followUp.question, { exact: true }).click();
    await expect(card.getByText(followUp.answer, { exact: true })).toBeVisible();
    await expect(card.getByRole('link', { name: 'Open page', exact: true })).toHaveAttribute('href', `/pom-proof/${sample!.path}`);
  });
});

/** After a session navigation, waits for the question page's key handler like openQuestion does. */
async function openQuestionReady(page: Page) {
  await expect(page.getByText('Space', { exact: true })).toBeVisible();
}
