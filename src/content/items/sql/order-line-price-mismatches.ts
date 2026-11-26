import type { SqlItem } from '../../types';

const answer = `SELECT oi.order_id, oi.product_id,
       oi.unit_price AS stored_unit_price, p.price AS current_product_price
FROM order_items AS oi
JOIN products AS p ON p.id = oi.product_id
WHERE oi.unit_price <> p.price;`;

const item: SqlItem = {
  id: 'order-line-price-mismatches',
  kind: 'sql',
  title: 'Order lines with a different price',
  difficulty: 'Easy',
  topics: ['SQL', 'Joins', 'Data checks'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Compare historical order-line unit prices with current product prices.',
  prompt: 'Find every order line whose stored unit price differs from the current price of its matching product. Include all order statuses. Compare per-unit prices, and return one row per qualifying order line.\n\nReturn `order_id`, `product_id`, `stored_unit_price`, `current_product_price`, in that column order. Row order does not matter.',
  dataset: 'shop',
  answer,
  orderMatters: false,
  hints: ['Both columns already represent one unit. The line quantity is irrelevant to the comparison.'],
  solutionNotes: `\`\`\`sql\n${answer}\n\`\`\`\n\nOrder 5 recorded the keyboard at 119.00 per unit; its current price is 129.00. Comparing total line price with current unit price also flags unchanged items ordered in multiple quantities.`,
  interviewNotes: 'A difference is an audit lead. Ask about discounts and historical prices before filing a defect. In a system using exact decimal or integer currency columns, compare values in the same unit and currency.',
};

export default item;
