import { describe, expect, it } from 'vitest';
import type { Answer } from '../../src/lib/contracts';
import { compileLocator } from '../../src/runners/locator-expression';

const expression = (source: string) => compileLocator({ by: 'expression', source });
const position = 'This locator depends on position.';

describe('locator compiler', () => {
  it.each([
    {
      source: "page.getByRole('button', { name: 'Refund order PP104', exact: true })",
      selector: 'internal:role=button[name="Refund order PP104"s]',
    },
    { source: 'page.getByRole("button", { name: "Refund" })', selector: 'internal:role=button[name="Refund"i]' },
    { source: "page.getByText('Refund', { exact: true })", selector: 'internal:text="Refund"s' },
    { source: "page.getByLabel('Email')", selector: 'internal:label="Email"i' },
    { source: "page.getByTestId('refund')", selector: 'internal:testid=[data-testid="refund"s]' },
    { source: "page.locator('section').filter({ hasText: 'PP104' })", selector: 'css=section >> internal:has-text="PP104"i' },
    { source: "  page . getByRole('button') ;", selector: 'internal:role=button' },
  ])('compiles $source', ({ source, selector }) => {
    expect(expression(source)).toEqual({ engine: 'ivya', selector, warnings: [] });
  });

  it('chains with nth and warns that the answer depends on position', () => {
    expect(expression("page.getByRole('button').nth(1)")).toEqual({
      engine: 'ivya', selector: 'internal:role=button >> nth=1', warnings: [position],
    });
  });

  it.each([
    { value: { by: 'css', selector: '.actions > button:nth-child(2)' }, warnings: [position] },
    { value: { by: 'css', selector: 'button.css-1x2y3z' }, warnings: ['A generated class name may change between builds.'] },
    { value: { by: 'css', selector: 'button[aria-label="Refund order PP104"]' }, warnings: [] },
    { value: { by: 'xpath', selector: '/html/body/section[1]/button' }, warnings: ['An absolute XPath depends on the full layout.', position] },
    { value: { by: 'xpath', selector: '//button[@aria-label="Refund order PP104"]' }, warnings: [] },
    { value: { by: 'expression', source: '//button[2]' }, warnings: [position] },
  ] as Array<{ value: Answer<'locator'>['value']; warnings: string[] }>)('warns about fragile selector $value.selector', ({ value, warnings }) => {
    expect(compileLocator(value).warnings).toEqual(warnings);
  });

  it('treats a bare selector typed into the expression box as CSS or XPath', () => {
    expect(expression('button.primary')).toMatchObject({ engine: 'css', selector: 'button.primary' });
    expect(expression('//button')).toMatchObject({ engine: 'xpath', selector: '//button' });
  });

  it('decodes string escapes in matchers', () => {
    expect(expression("page.getByText('It\\'s here')").selector).toBe('internal:text="It\'s here"i');
  });

  describe('expressions are parsed, never run', () => {
    it.each([
      { source: "page.getByRole('button').click()", message: 'Unsupported locator method click' },
      { source: 'page.evaluate(() => 1)', message: 'Unsupported locator method evaluate' },
      { source: "page.getByRole(name)", message: 'Use quoted strings' },
      { source: "page.getByRole('button', { name: /refund/i })", message: 'Unexpected character' },
      { source: "page.getByRole('Button')", message: 'lowercase role' },
      { source: "page.getByRole('button', { nme: 'Refund' })", message: 'Unexpected option nme' },
      { source: "page.getByRole('button', { exact: 'yes' })", message: 'exact must be a boolean' },
      { source: "page.filter({ hasText: 'x' })", message: 'Start with a locator' },
      { source: "page.getByRole('button').nth('1')", message: 'whole number' },
      { source: 'page.', message: 'Expected (' },
      { source: "page.getByRole('button'); alert(1)", message: 'Enter a locator' },
    ])('rejects $source', ({ source, message }) => {
      expect(() => expression(source)).toThrow(message);
    });

    it('rejects an empty selector', () => {
      expect(() => compileLocator({ by: 'css', selector: ' ' })).toThrow('Enter a locator');
    });
  });
});
