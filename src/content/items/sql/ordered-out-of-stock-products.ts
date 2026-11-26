import type { SqlItem } from '../../types';

const answer = `SELECT p.id AS product_id, p.name AS product_name,
       SUM(oi.quantity) AS units_ordered
FROM products AS p
JOIN order_items AS oi ON oi.product_id = p.id
WHERE p.stock = 0
GROUP BY p.id, p.name;`;

const item: SqlItem = {
  id: 'ordered-out-of-stock-products',
  kind: 'sql',
  title: 'Out-of-stock products with order history',
  difficulty: 'Medium',
  topics: ['SQL', 'Joins', 'Inventory checks'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Find products with zero stock today and count the units ordered.',
  prompt: 'Find products with current stock of exactly zero that appear on at least one order line. Count units ordered across all their historical order lines, including cancelled orders. Return one row per product.\n\nReturn `product_id`, `product_name`, `units_ordered`, in that column order. Row order does not matter.',
  dataset: 'shop',
  answer,
  orderMatters: false,
  hints: ['A line can contain more than one unit. Decide which column represents units ordered.'],
  solutionNotes: `\`\`\`sql\n${answer}\n\`\`\`\n\nThe USB-C hub has one order line for three units. \`COUNT(*)\` answers how many lines reference the product; \`SUM(quantity)\` answers how many units were ordered.`,
  interviewNotes: 'Keep the time reference explicit. Today’s zero stock cannot establish that a checkout sold an unavailable item. A stock snapshot at order time would be needed for that check.',
};

export default item;
