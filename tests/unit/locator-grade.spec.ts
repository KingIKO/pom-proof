/**
 * Locator grading needs real frames with layout (ivya reads roles and visibility), so these
 * grader tests run in Chromium through the page's grade hook instead of in Vitest.
 * They use the refund sample: buttons for PP104 (the target) and PP105, plus "Print receipt".
 * The sample asks for Playwright syntax, so CSS and XPath go through page.locator().
 */
import { expect, test, type Page } from '@playwright/test';
import type { Answer, GradeResult } from '../../src/lib/contracts';
import { discoverProblems } from '../support/problems';

type Value = Answer<'locator'>['value'];
type Fixture = { name: string; matches: number; matchedTarget: boolean };

/** The answer crosses as JSON text; typing it through `page.evaluate` expands the Answer union too deeply. */
async function grade(page: Page, value: Value): Promise<GradeResult<'locator'>> {
  const answer: Answer<'locator'> = { kind: 'locator', value };
  return page.evaluate((json) => window.__pomproof!.grade(JSON.parse(json) as Answer), JSON.stringify(answer)) as Promise<GradeResult<'locator'>>;
}
const fixturesOf = (result: GradeResult<'locator'>) => (result as { details: { fixtures: Fixture[] } }).details.fixtures;
const names = ['original', 'reordered-actions', 'different-wrapper'];
const located = (selector: string): Value => ({ by: 'expression', source: `page.locator(${JSON.stringify(selector)})` });
const sample = discoverProblems().find(({ id }) => id === 'locator/refund-order-action');
const playwrightOnly = 'This problem asks for a Playwright-style locator.';

test.beforeEach(async ({ page }) => {
  await page.goto('practice/locator/refund-order-action/');
  await expect.poll(() => page.evaluate(() => typeof window.__pomproof?.grade), { message: 'no grade hook' }).toBe('function');
});

test('the sample asks for Playwright syntax', () => {
  expect(sample?.data.kind === 'locator' && sample.data.syntax).toBe('playwright');
});

test('an exact match on every fixture scores 1', async ({ page }) => {
  const result = await grade(page, located('[aria-label="Refund order PP104"]'));
  expect(result).toMatchObject({ status: 'graded', score: 1 });
  expect(fixturesOf(result)).toEqual(names.map((name) => ({ name, matches: 1, matchedTarget: true })));
});

test.describe('anything other than exactly the target set fails', () => {
  const cases: Array<{ name: string; value: Value; matches: number[] }> = [
    { name: 'target plus the other order', value: { by: 'expression', source: "page.getByRole('button', { name: 'Refund' })" }, matches: [2, 2, 2] },
    { name: 'target plus every button', value: located('button'), matches: [3, 3, 2] },
    { name: 'exact visible text shared by both orders', value: { by: 'expression', source: "page.getByText('Refund', { exact: true })" }, matches: [2, 2, 2] },
    { name: 'one element that is not the target', value: located('section[aria-label="Order PP104"]'), matches: [1, 1, 1] },
    { name: 'the wrong single button', value: located('xpath=//button[@aria-label="Refund order PP105"]'), matches: [1, 1, 1] },
    { name: 'no element', value: { by: 'expression', source: "page.getByTestId('refund-pp104')" }, matches: [0, 0, 0] },
  ];
  for (const { name, value, matches } of cases) {
    test(`${name} scores 0`, async ({ page }) => {
      const result = await grade(page, value);
      expect(result).toMatchObject({ status: 'graded', score: 0 });
      expect(fixturesOf(result)).toEqual(names.map((fixture, index) => ({ name: fixture, matches: matches[index], matchedTarget: false })));
    });
  }
});

test('a position-based selector earns credit only where the layout still fits and is flagged', async ({ page }) => {
  const result = await grade(page, located('.actions > button:nth-child(2)'));
  expect(result).toMatchObject({ status: 'graded', score: 1 / 3, details: { warnings: ['This locator depends on position.'] } });
  expect(fixturesOf(result)).toEqual([
    { name: 'original', matches: 1, matchedTarget: true },
    { name: 'reordered-actions', matches: 1, matchedTarget: false },
    { name: 'different-wrapper', matches: 0, matchedTarget: false },
  ]);
});

test('a scoped chain that names the row passes every fixture', async ({ page }) => {
  const result = await grade(page, { by: 'expression', source: "page.getByRole('region', { name: 'Order PP104' }).getByRole('button', { name: 'Refund' })" });
  expect(result).toMatchObject({ status: 'graded', score: 1 });
});

test('a locator that does not parse is invalid, not scored', async ({ page }) => {
  expect(await grade(page, { by: 'expression', source: "page.getByRole('button').click()" }))
    .toMatchObject({ kind: 'locator', status: 'invalid-answer', message: 'Unsupported locator method click' });
  const broken = await grade(page, located('button['));
  expect(broken).toMatchObject({ kind: 'locator', status: 'invalid-answer' });
  expect((broken as { message: string }).message, 'a parse error, not the syntax rule').not.toBe(playwrightOnly);
});

test('raw CSS and XPath that match the target are refused because the sample asks for Playwright syntax', async ({ page }) => {
  // The same selectors score 1 through page.locator(), so only the syntax rule can refuse them.
  expect(await grade(page, located('[aria-label="Refund order PP104"]'))).toMatchObject({ status: 'graded', score: 1 });
  expect(await grade(page, located('xpath=//button[@aria-label="Refund order PP104"]'))).toMatchObject({ status: 'graded', score: 1 });
  for (const value of [
    { by: 'css', selector: '[aria-label="Refund order PP104"]' },
    { by: 'xpath', selector: '//button[@aria-label="Refund order PP104"]' },
    { by: 'expression', source: '[aria-label="Refund order PP104"]' },
    { by: 'expression', source: '//button[@aria-label="Refund order PP104"]' },
  ] satisfies Value[]) {
    expect(await grade(page, value), JSON.stringify(value))
      .toEqual({ kind: 'locator', status: 'invalid-answer', message: playwrightOnly });
  }
});
