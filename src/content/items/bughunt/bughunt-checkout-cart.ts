import type { BugHuntItem } from '../../types';

const item: BugHuntItem = {
  id: 'bughunt-checkout-cart',
  kind: 'bughunt',
  app: 'checkout-cart',
  title: 'Investigate a checkout cart',
  difficulty: 'Medium',
  topics: ['Exploratory testing', 'Boundary values', 'Bug reports'],
  roles: ['manual', 'automation', 'lead'],
  summary: 'Check quantity changes, discounts, shipping, and removal against the checkout spec.',
  prompt: 'The store is about to release a checkout update. Explore the cart against the spec, reproduce discrepancies, and file a report for each one. Include the product, input, and amount where they affect the result.',
  spec: `- The cart starts with one desk mat at **$30.05** and one cable kit at **$19.95**. You can add one notebook at **$12.35**.
- Apply accepts whole quantities from 1 to 9. Invalid input shows an error and preserves the last applied quantity. A line total is unit price × quantity. The subtotal is the sum of the line totals.
- **SAVE10** takes 10% off the subtotal, rounded to the nearest cent with half cents rounded up. Applying it more than once still gives one 10% discount. An unknown code changes no prices.
- **Standard** shipping is $4.95 and becomes free at a merchandise subtotal of **$50.00 or more**, before any discount. **Express** is $9.95 for a nonempty cart. An empty cart has no shipping fee and no discount.
- Remove affects only the named product. The total is the subtotal minus discount plus shipping. All amounts are in US dollars.`,
  areas: ['Quantity', 'Pricing', 'Discounts', 'Shipping', 'Removal'],
  bugs: [
    { id: 'qty-zero', title: 'Quantity zero is applied to the line', area: 'Quantity', severity: 'Major', hint: 'Try the value immediately below the permitted range.' },
    { id: 'subtotal-qty', title: 'Subtotal ignores an applied quantity increase', area: 'Pricing', severity: 'Major', hint: 'Compare the line total and the subtotal after applying quantity 2.' },
    { id: 'coupon-double', title: 'Applying SAVE10 again doubles the discount', area: 'Discounts', severity: 'Major', hint: 'Repeat a successful coupon submission.' },
    { id: 'shipping-threshold', title: 'Standard shipping charges at exactly $50', area: 'Shipping', severity: 'Major', hint: 'Choose Standard without changing the initial basket.' },
    { id: 'remove-wrong', title: 'Removing the cable kit drops the desk mat', area: 'Removal', severity: 'Major', hint: 'Remove a line other than the first one.' },
    { id: 'round-discount', title: 'A half-cent discount rounds down', area: 'Discounts', severity: 'Minor', hint: 'Add the notebook before applying SAVE10.' },
  ],
  hints: [
    'Change one thing at a time. Record the initial subtotal before changing a quantity or a shipping method.',
    'Compare line totals against the subtotal, and compare the subtotal against the discount shown below it.',
    'Try an exact eligibility threshold and try submitting the same action twice.',
    'Some failures are easier to isolate in the initial cart. Remove the notebook or add back an item when needed.',
  ],
  solutionNotes: `On the initial basket, choosing Standard should charge $0.00. Applying quantity 0 should keep the old quantity and show an error. Applying quantity 2 to the desk mat should display a $60.10 desk mat line and an $80.05 subtotal; the subtotal stays $50.00.

Apply SAVE10 twice on the initial basket: the discount should stay at $5.00. Add the notebook for a $62.35 subtotal: a fresh application should give a $6.24 discount. Finally, click Remove on the cable kit and check which product is still listed.`,
  interviewNotes: 'Keep each report reproducible on a known cart and state exactly what you measured. In triage, explain whether the bug can charge the customer the wrong amount or only changes what the cart displays.',
};

export default item;
