import type { SqlItem } from '../../types';

const answer = `SELECT c.id AS customer_id, c.name AS customer_name
FROM customers AS c
WHERE NOT EXISTS (
  SELECT 1 FROM orders AS o WHERE o.customer_id = c.id
);`;

const item: SqlItem = {
  id: 'customers-without-orders',
  kind: 'sql',
  title: 'Customers without orders',
  difficulty: 'Easy',
  topics: ['SQL', 'Anti-joins', 'Data checks'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Find customers with no order record, regardless of order status.',
  prompt: 'Find customers who have never placed an order. An order counts even if it was later cancelled or is still pending.\n\nReturn `customer_id`, then `customer_name`. Row order does not matter.',
  dataset: 'shop',
  answer,
  orderMatters: false,
  hints: ['Check for any order with the same customer ID.'],
  solutionNotes: `\`\`\`sql\n${answer}\n\`\`\`\n\nMargaret and Tim have no orders. Filtering the subquery to non-cancelled orders incorrectly includes Alan, whose only order was cancelled.`,
  interviewNotes: 'Clarify whether the report tracks “never ordered” or “never completed an order.” Matching on customer ID keeps different customers with the same email separate.',
};

export default item;
