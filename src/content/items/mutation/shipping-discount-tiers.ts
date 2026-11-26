import type { MutationItem } from '../../types';

const implementation = `function shippingDiscount(subtotal, member) {
  if (subtotal < 5000) return 0;
  const rate = (subtotal >= 10000 ? 15 : 10) + (member ? 5 : 0);
  const savings = Math.floor(subtotal * rate / 100);
  return Math.min(savings, 2000);
}`;

const item: MutationItem = {
  id: 'shipping-discount-tiers',
  title: 'Test a tiered shipping promotion',
  kind: 'mutation',
  subject: 'function',
  difficulty: 'Easy',
  topics: ['Boundary values', 'Mutation testing', 'Decision tables'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Check spend thresholds, membership rates, rounding, and the savings cap.',
  prompt: 'Write tests for the promotion calculator. Every test must pass on the real code. Each planted bug must fail at least one test to earn a full mutation score.',
  contract: `
\`shippingDiscount(subtotal, member)\` returns a discount in cents. The subtotal is an integer number of cents from 0 through 1,000,000. Membership is a boolean.

- Subtotals below 5,000 cents get zero discount, even for members.
- Subtotals from 5,000 through 9,999 cents get 10%. The rate is 15% starting at 10,000 cents.
- For a qualifying subtotal, membership adds 5 percentage points to its rate.
- Multiply the subtotal by the final rate and round down to whole cents. Return at most 2,000 cents.
`,
  implementation,
  mutants: [
    { id: 'first-threshold', label: 'The first tier excludes orders at exactly 5,000 cents.', code: implementation.replace('subtotal < 5000', 'subtotal <= 5000') },
    { id: 'second-threshold', label: 'The higher tier starts one cent late.', code: implementation.replace('subtotal >= 10000', 'subtotal > 10000') },
    { id: 'member-rate', label: 'Members get the same rate as everyone else.', code: implementation.replace('(member ? 5 : 0)', '0') },
    { id: 'rounding', label: 'Fractional cents round to the nearest cent instead of down.', code: implementation.replace('Math.floor', 'Math.round') },
    { id: 'uncapped', label: 'The calculation returns savings above the 2,000-cent cap.', code: implementation.replace('Math.min(savings, 2000)', 'savings') },
  ],
  starter: `test('Regular order in the first tier earns ten percent', () => {
  expect(shippingDiscount(6000, false)).toBe(600);
});

// TODO: Add orders at the spend thresholds.
// TODO: Test interactions between pricing rules.`,
  referenceTests: `test('First tier begins at 5,000 cents for nonmembers', () => {
  expect(shippingDiscount(4999, false)).toBe(0);
  expect(shippingDiscount(5000, false)).toBe(500);
});

test('Second tier begins at 10,000 cents', () => {
  expect(shippingDiscount(10000, false)).toBe(1500);
});

test('Membership adds five points only to eligible orders', () => {
  expect(shippingDiscount(4999, true)).toBe(0);
  expect(shippingDiscount(5000, true)).toBe(750);
});

test('Fractional cents round down just below the second tier', () => {
  expect(shippingDiscount(9999, false)).toBe(999);
});

test('Savings are capped at 2,000 cents', () => {
  expect(shippingDiscount(20000, true)).toBe(2000);
});`,
  solutionNotes: 'Keep the tier and membership assertions below the cap so the cap cannot hide a wrong rate. Test rounding with a subtotal that produces more than half a fractional cent.',
  interviewNotes: 'Describe the spend partitions and the role of membership in each. Which assertions would stop catching their intended bugs if all the orders hit the cap?',
};

export default item;
