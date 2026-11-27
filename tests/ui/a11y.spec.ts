import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { discoverProblems, kinds, onePerKind } from '../support/problems';
import { discoverQuestions, questionExamples } from '../support/questions';
import { expandQuestion } from '../support/review';
import { openWorkspace, resultPanel, submitStructured } from '../support/workspace';

const workspaces = onePerKind();
const pages = [
  { name: 'practice list', url: '' },
  ...workspaces.map((problem) => ({ name: `${problem.kind} workspace`, url: problem.path })),
  { name: 'progress', url: 'progress/' },
  { name: 'questions list', url: 'questions/' },
  { name: 'question page', url: 'questions/playwright/independent-checkout-contexts/' },
  { name: 'tracks list', url: 'tracks/' },
  { name: 'track page', url: 'tracks/automation/' },
  { name: '404 page', url: 'this-page-does-not-exist/', status: 404 },
];

async function open(page: Page, url: string, status = 200) {
  const response = await page.goto(url);
  expect(response?.status(), `${url} status`).toBe(status);
  await expect(page.locator('main')).toBeVisible();
  // Astro removes the ssr attribute once an island hydrates.
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
}

/** Fails on serious or critical violations; lesser ones are recorded as annotations. `include` limits the scan to one part. */
async function expectNoSeriousViolations(page: Page, testInfo: TestInfo, state: string, include?: string) {
  // Contrast read during the 120 ms result fade would see partly transparent text.
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter(({ playState }) => playState === 'running').length))
    .toBe(0);
  const builder = new AxeBuilder({ page });
  if (include) builder.include(include);
  const { violations, passes } = await builder.analyze();
  expect(passes.length, 'axe ran no checks').toBeGreaterThan(0);
  for (const { id, impact, nodes } of violations.filter(({ impact }) => impact !== 'serious' && impact !== 'critical')) {
    testInfo.annotations.push({ type: `axe ${impact}`, description: `${state}: ${id} on ${nodes.length} nodes` });
  }
  expect(
    violations
      .filter(({ impact }) => impact === 'serious' || impact === 'critical')
      .map(({ id, impact, help, nodes }) => ({ id, impact, help, targets: nodes.map(({ target }) => target.join(' ')) })),
    state,
  ).toEqual([]);
}

// Light theme only (redesign plan, owner decision 2026-11-27).
for (const { name, url, status } of pages) {
  test(`${name} has no serious or critical axe violations`, async ({ page }, testInfo) => {
    await open(page, url, status);
    await expectNoSeriousViolations(page, testInfo, name);
  });
}

test('structured result states have no serious or critical axe violations', async ({ page }, testInfo) => {
  // An empty scenario submit leaves its single-choice item unanswered, which is an invalid answer.
  const problem = workspaces.find((candidate) => candidate.kind === 'scenario') as Parameters<typeof submitStructured>[1];
  expect(problem.data.items.some(({ type }) => type === 'single-choice'), 'the scenario sample has a single-choice item').toBe(true);
  await openWorkspace(page, problem);
  await page.getByRole('region', { name: 'Workspace' }).getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(resultPanel(page, 'Not graded')).toBeVisible();
  await expectNoSeriousViolations(page, testInfo, 'not graded');
  await submitStructured(page, problem, 'decoy');
  await expectNoSeriousViolations(page, testInfo, 'fail');
  await page.getByRole('region', { name: 'Workspace' }).getByRole('button', { name: 'Try again', exact: true }).click();
  await submitStructured(page, problem, 'reference');
  await expectNoSeriousViolations(page, testInfo, 'pass');
});

test('a revealed question answer has no serious or critical axe violations', async ({ page }, testInfo) => {
  await open(page, 'questions/playwright/independent-checkout-contexts/');
  await page.getByText('Show answer').click();
  await expect(page.getByRole('group', { name: 'Rate your answer' })).toBeVisible();
  await expectNoSeriousViolations(page, testInfo, 'revealed answer');
});

test('an expanded question card in the bank has no serious or critical axe violations', async ({ page }, testInfo) => {
  await open(page, 'questions/');
  const card = page.getByRole('list', { name: 'Questions' }).getByRole('listitem').first();
  await card.locator('summary').first().click();
  await expect(card.getByRole('group', { name: 'Rate your answer' })).toBeVisible();
  await expectNoSeriousViolations(page, testInfo, 'expanded card');
});

const withExample = discoverQuestions().find((question) => questionExamples(question).some(({ variants }) => variants.length > 1));

test('an expanded card with a code example has no serious or critical axe violations, before and after switching', async ({ page }, testInfo) => {
  expect(withExample, 'a question with a multi-language example').toBeDefined();
  await open(page, 'questions/');
  const card = await expandQuestion(page, withExample!);
  const languages = card.getByRole('group', { name: 'Example language' }).first();
  await expect(languages).toBeVisible();
  await expectNoSeriousViolations(page, testInfo, 'expanded card with an example');
  await languages.getByRole('button').nth(1).click();
  await expect(languages.getByRole('button').nth(1)).toHaveAttribute('aria-pressed', 'true');
  // Only the card changed; a whole-page scan took the test to 9.1 s of its 10 s budget (2026-11-27).
  await expectNoSeriousViolations(page, testInfo, 'switched example', `[data-question-id="${withExample!.id}"]`);
});

test('a revealed answer with a code example has no serious or critical axe violations', async ({ page }, testInfo) => {
  expect(withExample, 'a question with a multi-language example').toBeDefined();
  await open(page, withExample!.path);
  await page.getByText('Show answer').click();
  await expect(page.getByRole('group', { name: 'Example language' }).first()).toBeVisible();
  await expectNoSeriousViolations(page, testInfo, 'revealed answer with an example');
});

test('code run results have no serious or critical axe violations', async ({ page }, testInfo) => {
  const problem = workspaces.find((candidate) => candidate.kind === 'code')!;
  await openWorkspace(page, problem);
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(page.locator('.code-checks')).toBeVisible();
  await expectNoSeriousViolations(page, testInfo, 'code checks');
});

/**
 * Whether the focused element or a wrapper shows a ring. CodeMirror outlines
 * .cm-editor.cm-focused, not the focused .cm-content, and adds the class a moment after focus.
 */
function focusRingShown() {
  for (let element = document.activeElement; element && element !== document.body; element = element.parentElement) {
    const style = getComputedStyle(element);
    if ((style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0) || style.boxShadow !== 'none') return true;
  }
  return false;
}

/** The workspace's primary control: the one accent button inside the Workspace region. */
const primaryControl = (page: Page) =>
  page.getByRole('region', { name: 'Workspace' }).locator('button.primary').first();

test('keyboard: Tab from the locator input goes to Submit and never enters a fixture preview', async ({ page }) => {
  const problem = workspaces.find(({ kind }) => kind === 'locator')!;
  expect(problem.data.kind === 'locator' && problem.data.variants.length, 'the locator sample has variants').toBeGreaterThan(0);
  await open(page, problem.path);
  const workspace = page.getByRole('region', { name: 'Workspace' });
  const input = workspace.getByRole('textbox', { name: 'Locator expression' });
  const submit = workspace.getByRole('button', { name: 'Submit', exact: true });

  // Submit once so the variant previews render too.
  await input.fill("page.getByRole('button')");
  await submit.click();
  await expect(workspace.getByRole('heading', { name: 'Fixture variants' })).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(1 + (problem.data.kind === 'locator' ? problem.data.variants.length : 0));

  await input.focus();
  await page.keyboard.press('Tab');
  await expect(submit).toBeFocused();

  const stops = await page.locator('a[href], button, input, select, textarea, summary, iframe, [tabindex]').count();
  let reachedEnd = false;
  for (let step = 0; step <= stops && !reachedEnd; step += 1) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => ({
      tag: document.activeElement?.tagName ?? null,
      title: document.activeElement?.getAttribute('title') ?? '',
    }));
    expect(focused.tag, `Tab moved focus into the fixture preview "${focused.title}"`).not.toBe('IFRAME');
    reachedEnd = focused.tag === 'BODY' || focused.tag === null;
  }
  expect(reachedEnd, 'Tab never left the page after the workspace').toBe(true);
});

for (const problem of workspaces) {
  test(`keyboard: Tab reaches the ${problem.kind} primary control with a visible focus ring`, async ({ page }) => {
    await open(page, problem.path);
    const target = primaryControl(page);
    await expect(target, 'the workspace has no primary button').toBeVisible();
    const marker = await target.evaluate((element) => {
      element.setAttribute('data-primary-under-test', '');
      return document.querySelectorAll('a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]').length;
    });

    let reached = false;
    for (let step = 0; step <= marker && !reached; step += 1) {
      await page.keyboard.press('Tab');
      const focus = await page.evaluate(() => {
        const active = document.activeElement;
        if (!active || active === document.body) return null;
        return {
          primary: active.hasAttribute('data-primary-under-test'),
          label: `${active.tagName.toLowerCase()} "${(active.getAttribute('aria-label') ?? active.textContent ?? '').trim().slice(0, 40)}"`,
        };
      });
      if (focus === null) break;
      await expect.poll(() => page.evaluate(focusRingShown), { message: `${focus.label} has focus without a visible focus ring` })
        .toBe(true);
      reached = focus.primary;
    }
    expect(reached, 'Tab never reached the primary control').toBe(true);
    await expect(target).toBeFocused();
  });
}

// Content decides whether a code block or the editor overflows, so this one rule runs on every
// problem page rather than one per kind. Six pages per test keeps each test under the 10 s budget and spreads them over the workers.
const allProblems = discoverProblems();
const size = 6;
const batches = kinds.flatMap((kind) => {
  const list = allProblems.filter((problem) => problem.kind === kind);
  return Array.from({ length: Math.max(1, Math.ceil(list.length / size)) }, (_, index) => ({ kind, index, list: list.slice(index * size, index * size + size) }));
});

for (const { kind, index, list } of batches) {
  test(`scrollable regions are keyboard reachable on every ${kind} problem page (batch ${index + 1})`, async ({ page }) => {
    expect(list.length, `${kind} problems in this batch`).toBeGreaterThan(0);
    const found: string[] = [];
    for (const problem of list) {
      await open(page, problem.path);
      const { violations, passes, inapplicable } = await new AxeBuilder({ page }).withRules(['scrollable-region-focusable']).analyze();
      expect([...violations, ...passes, ...inapplicable].map(({ id }) => id), `${problem.id}: axe ran the rule`).toContain('scrollable-region-focusable');
      found.push(...violations.flatMap(({ nodes }) => nodes.map(({ target }) => `${problem.id}: ${target.join(' ')}`)));
    }
    expect(found, 'scrollable regions with no keyboard access').toEqual([]);
  });
}
