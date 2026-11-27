import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator } from '@playwright/test';

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
