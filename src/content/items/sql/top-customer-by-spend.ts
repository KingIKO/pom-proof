import type { SqlItem } from '../../types';

const answer = `SELECT c.id AS customer_id, c.name AS customer_name,
       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS spend
FROM customers AS c
JOIN orders AS o ON o.customer_id = c.id
JOIN order_items AS oi ON oi.order_id = o.id
WHERE o.status IN ('shipped', 'delivered')
GROUP BY c.id, c.name
ORDER BY spend DESC, customer_id ASC
LIMIT 1;`;

const item: SqlItem = {
  id: 'top-customer-by-spend',
  kind: 'sql',
  title: 'Top customer by spend',
  difficulty: 'Medium',
  topics: ['SQL', 'Grouping', 'Top results'],
  roles: ['automation', 'sdet'],
  summary: 'Find the highest-spending customer from shipped and delivered orders.',
  prompt: 'Find the single customer with the highest total spend from orders marked `shipped` or `delivered`. Total the quantity times the recorded unit price on those order lines and round the customer total to two decimal places. Rank by rounded spend descending, then choose the lowest customer ID in a tie. If there are no qualifying order lines, return no rows.\n\nReturn `customer_id`, `customer_name`, `spend`, in that column order.',
  dataset: 'shop',
  answer,
  orderMatters: false,
  hints: ['Aggregate by customer before ranking. The ranking uses the amount shown in the result.'],
  solutionNotes: `\`\`\`sql\n${answer}\n\`\`\`\n\nLinus’s two monitors put him at 659.98. Summing unit prices without quantities instead puts Ada first. The ID tie-break makes \`LIMIT 1\` choose the intended customer when two totals match.`,
  interviewNotes: 'SQLite, PostgreSQL, and MySQL support `ORDER BY ... LIMIT 1`. When working from a floating-point amount in PostgreSQL, cast to `numeric` before using the two-argument `ROUND`. A report that should show all co-leaders needs a different result rule.',
};

export default item;
