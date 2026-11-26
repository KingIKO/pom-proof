import type { SqlItem } from '../../types';

const answer = `SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM orders AS o
JOIN order_items AS oi ON oi.order_id = o.id
JOIN products AS p ON p.id = oi.product_id
WHERE o.status <> 'cancelled'
GROUP BY p.category
ORDER BY revenue DESC, p.category ASC;`;

const item: SqlItem = {
  id: 'revenue-by-product-category',
  kind: 'sql',
  title: 'Order value by product category',
  difficulty: 'Medium',
  topics: ['SQL', 'Grouping', 'Joins'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Total order value by category using the price recorded on each order line.',
  prompt: 'For the shop’s revenue report, total the value of order lines by product category. Include pending orders and exclude cancelled orders or orders with an unknown status. Value each line at its quantity times its recorded `unit_price`. Include only categories represented by qualifying lines, and round the totals to two decimal places.\n\nReturn `category`, then `revenue`. Sort by rounded revenue descending, then category ascending for ties.',
  dataset: 'shop',
  answer,
  orderMatters: true,
  hints: ['Get category from the product and price from the order line. The status belongs to the order.'],
  solutionNotes: `\`\`\`sql\n${answer}\n\`\`\`\n\nThe cancelled webcam order contributes nothing. A keyboard line used 119.00 at purchase, so using the current product price of 129.00 would also overstate the peripherals total.`,
  interviewNotes: 'Confirm what “revenue” means before using the report for finance. This exercise includes pending order value by definition. Production currency columns usually use exact decimal values (PostgreSQL `numeric` or MySQL `DECIMAL`) or integer minor units.',
};

export default item;
