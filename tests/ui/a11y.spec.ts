import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { onePerKind } from '../support/problems';
import { openWorkspace, resultPanel, submitStructured } from '../support/workspace';

const workspaces = onePerKind();
const pages = [
  { name: 'practice list', url: '' },
  ...workspaces.map((problem) => ({ name: `${problem.kind} workspace`, url: problem.path })),
  { name: 'progress', url: 'progress/' },
];

async function open(page: Page, url: string) {
  const response = await page.goto(url);
  expect(response?.status(), `${url} status`).toBe(200);
  await expect(page.locator('main')).toBeVisible();
  // Astro removes the ssr attribute once an island hydrates.
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
}

/** Fails on serious or critical violations; lesser ones are recorded as annotations. */
async function expectNoSeriousViolations(page: Page, testInfo: TestInfo, state: string) {
  // Contrast read during the 120 ms result fade would see partly transparent text.
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter(({ playState }) => playState === 'running').length))
    .toBe(0);
  const { violations, passes } = await new AxeBuilder({ page }).analyze();
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

for (const scheme of ['light', 'dark'] as const) {
  for (const { name, url } of pages) {
    test(`${scheme}: ${name} has no serious or critical axe violations`, async ({ page }, testInfo) => {
      await page.emulateMedia({ colorScheme: scheme });
      await open(page, url);
      await expectNoSeriousViolations(page, testInfo, name);
    });
  }

  test(`${scheme}: structured result states have no serious or critical axe violations`, async ({ page }, testInfo) => {
    // An empty scenario submit leaves its single-choice item unanswered, which is an invalid answer.
    const problem = workspaces.find((candidate) => candidate.kind === 'scenario') as Parameters<typeof submitStructured>[1];
    expect(problem.data.items.some(({ type }) => type === 'single-choice'), 'the scenario sample has a single-choice item').toBe(true);
    await page.emulateMedia({ colorScheme: scheme });
    await openWorkspace(page, problem);
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(resultPanel(page, 'Not graded')).toBeVisible();
    await expectNoSeriousViolations(page, testInfo, 'not graded');
    await submitStructured(page, problem, 'decoy');
    await expectNoSeriousViolations(page, testInfo, 'fail');
    await page.getByRole('button', { name: 'Try again' }).click();
    await submitStructured(page, problem, 'reference');
    await expectNoSeriousViolations(page, testInfo, 'pass');
  });

  test(`${scheme}: code run results have no serious or critical axe violations`, async ({ page }, testInfo) => {
    const problem = workspaces.find((candidate) => candidate.kind === 'code')!;
    await page.emulateMedia({ colorScheme: scheme });
    await openWorkspace(page, problem);
    await page.getByRole('button', { name: 'Run', exact: true }).click();
    await expect(page.locator('.code-checks')).toBeVisible();
    await expectNoSeriousViolations(page, testInfo, 'code checks');
  });
}

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
