import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { discoverQuestions, exampleCodeName, questionExamples, type DiscoveredQuestion } from '../support/questions';

const receipt = 'practice/diagnosis/receipt-recalculates-after-hard-wait/';
const review = 'practice/diagnosis/review-swallowed-permission-failure/';
const longestEditorial = 'editorials/reserve-live-training-slot/';

async function expectNoOverflow(box: Locator) {
  await expect(box).toBeVisible();
  await box.page().evaluate(() => document.fonts.ready);
  await expect.poll(() => box.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
}

test('desktop code samples use readable type and the receipt lines fit without wrapping', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(receipt);
  const readingPane = page.locator('#problem-statement');
  const sample = readingPane.getByRole('region', { name: 'Code sample 1', exact: true });
  await expect(sample).toHaveAttribute('tabindex', '0');
  await expect(sample.getByText('300', { exact: true })).toHaveCSS('color', 'rgb(8, 122, 80)');
  await expectNoOverflow(sample);
  expect(await sample.evaluate((el) => {
    const style = getComputedStyle(el.querySelector('code')!);
    const lineHeight = parseFloat(style.lineHeight);
    return parseFloat(style.fontSize) >= 12.5 && [...el.querySelectorAll('.line')].every((line) =>
      line.getBoundingClientRect().height <= lineHeight + 0.1);
  })).toBe(true);
});

test('numbered lines retain their text and toggle with the keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(review);
  const list = page.getByRole('list', { name: 'Numbered lines' });
  await expectNoOverflow(list);
  const line = list.getByRole('button').nth(4);
  await expect(line).toBeEnabled();
  await expect(line.locator('code').getByText("'Member details'", { exact: true }))
    .toHaveCSS('color', 'rgb(163, 21, 21)');
  expect(await line.locator('code').textContent()).toBe(
    "  await expect(analystPage.getByRole('heading', { name: 'Member details' })).toBeVisible();",
  );
  await line.press('Space');
  await expect(line).toHaveAttribute('aria-pressed', 'true');
  const { violations } = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
  expect(violations).toEqual([]);
});

test('long XPath wraps on mobile with an indented continuation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(longestEditorial);
  const sample = page.getByRole('region', { name: 'Code sample 1', exact: true });
  await expectNoOverflow(sample);
  await expect(sample.getByText('normalize-space', { exact: true }).first()).toHaveCSS('color', 'rgb(121, 94, 38)');
  const size = await sample.locator('.line').evaluate((line) => {
    const style = getComputedStyle(line);
    return { rows: line.getBoundingClientRect().height / parseFloat(style.lineHeight), indent: parseFloat(style.textIndent) };
  });
  expect(size.rows).toBeGreaterThan(1);
  expect(size.indent).toBeLessThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

// ----- question code examples -----

/** The authoring line cap from the phase 5 brief: unwrapped characters in a bank card at 1280px. */
const lineCap = 105;
const languageNames: Record<string, string> = { ts: 'TypeScript', js: 'JavaScript', python: 'Python', java: 'Java' };
const withExamples = discoverQuestions().filter((question) => questionExamples(question).length > 0);

/** Opens the bank with the question's card expanded by its deep link, or the question page with its answer shown. */
async function openExamples(page: Page, question: DiscoveredQuestion, where: 'card' | 'page') {
  if (where === 'card') {
    await page.goto(`questions/#${question.slug}`);
    const card = page.locator(`[data-question-id="${question.id}"]`);
    await expect(card.locator('details').first()).toHaveAttribute('open', '');
    return card;
  }
  await page.goto(question.path);
  await page.getByText('Show answer').click();
  return page.locator('[data-answer]');
}

/** Shows each variant of each example in turn and checks its code box does not scroll sideways. */
async function expectExamplesFit(scope: Locator, question: DiscoveredQuestion) {
  const examples = questionExamples(question);
  for (const [index, example] of examples.entries()) {
    const figure = scope.getByRole('figure').nth(index);
    for (const variant of example.variants) {
      if (example.variants.length > 1) {
        await figure.getByRole('group', { name: 'Example language' }).getByRole('button', { name: languageNames[variant.lang], exact: true }).click();
      }
      await expectNoOverflow(figure.getByRole('region', { name: exampleCodeName(variant) }));
    }
  }
}

/** Rows a line of `count` characters takes when appended to the code box, removed again afterwards. */
function rowsFor(box: Locator, count: number) {
  return box.evaluate(async (pre, length) => {
    await document.fonts.ready;
    const line = document.createElement('span');
    line.className = 'line';
    line.textContent = 'x'.repeat(length);
    pre.querySelector('code')!.append('\n', line);
    const rows = line.getBoundingClientRect().height / parseFloat(getComputedStyle(line).lineHeight);
    line.remove();
    return rows;
  }, count);
}

test('content has questions with code examples', () => {
  expect(withExamples.length, 'questions with examples').toBeGreaterThan(0);
});

for (const width of [1280, 1440]) {
  test(`example code boxes do not scroll sideways at ${width}px in the bank card and on the question page`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const question of withExamples) {
      for (const where of ['card', 'page'] as const) {
        await test.step(`${question.id} ${where}`, async () => expectExamplesFit(await openExamples(page, question, where), question));
      }
    }
  });
}

test(`a ${lineCap}-character line fits unwrapped in a bank card at 1280px, and a longer one wraps`, async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const card = await openExamples(page, withExamples[0], 'card');
  const box = card.getByRole('figure').first().locator('pre');
  await expect(box).toBeVisible();
  const font = await box.locator('code').evaluate((code) => getComputedStyle(code).fontFamily);
  expect(font, 'the code face').toMatch(/JetBrains Mono/);
  expect(await rowsFor(box, lineCap), `${lineCap} characters`).toBeLessThan(1.05);
  expect(await rowsFor(box, Math.round(lineCap * 1.3)), 'the plant: a line 30% past the cap').toBeGreaterThan(1.5);
});

test('example code wraps at 390px with an indented continuation, in the card and on the page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const question = withExamples[0];
  for (const where of ['card', 'page'] as const) {
    await test.step(where, async () => {
      const box = (await openExamples(page, question, where)).getByRole('figure').first().locator('pre');
      await expectNoOverflow(box);
      const longest = await box.evaluate((pre) => {
        const lines = [...pre.querySelectorAll<HTMLElement>('.line')];
        const line = lines.reduce((a, b) => ((b.textContent ?? '').length > (a.textContent ?? '').length ? b : a));
        const style = getComputedStyle(line);
        return { text: line.textContent, rows: line.getBoundingClientRect().height / parseFloat(style.lineHeight), indent: parseFloat(style.textIndent) };
      });
      expect(longest.rows, `"${longest.text}" wraps`).toBeGreaterThan(1);
      expect(longest.indent, 'continuation rows hang').toBeLessThan(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    });
  }
});

for (const [path, source] of [
  ['practice/code/balanced-log-brackets/', `const example = '${'a'.repeat(240)}';`],
  ['practice/sql/order-value-buckets/', `SELECT '${'a'.repeat(240)}';`],
  ['practice/test-design/delivery-fee-mutants/', `const example = '${'a'.repeat(240)}';`],
] as const) {
  test(`${path} wraps pasted code at 390px`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    if (path.includes('/test-design/')) await page.getByRole('radio', { name: 'Code', exact: true }).check();
    const editor = page.locator('.cm-content');
    await expect(editor).toBeEditable();
    await editor.press('ControlOrMeta+A');
    await page.keyboard.insertText(source);
    const line = editor.locator('.cm-line').filter({ hasText: source });
    await expect(line).toHaveCount(1);
    const string = line.locator('span').filter({ hasText: 'a'.repeat(240) });
    await expect(string).toHaveCSS('color', 'rgb(163, 21, 21)');
    await expectNoOverflow(page.locator('.cm-scroller'));
    const style = await line.evaluate((el) => {
      const computed = getComputedStyle(el);
      return { rows: el.clientHeight / parseFloat(computed.lineHeight), indent: parseFloat(computed.textIndent) };
    });
    expect(style.rows).toBeGreaterThan(1);
    expect(style.indent).toBeLessThan(0);
  });
}
