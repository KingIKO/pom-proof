import type { SqlItem } from '../../types';

const answer = `SELECT d.id AS department_id, d.name AS department_name
FROM departments AS d
LEFT JOIN employees AS e ON e.department_id = d.id
WHERE e.id IS NULL;`;

const item: SqlItem = {
  id: 'departments-without-employees',
  kind: 'sql',
  title: 'Departments without employees',
  difficulty: 'Easy',
  topics: ['SQL', 'Left joins', 'NULL'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Find departments with nobody assigned.',
  prompt: 'List departments that have no employees assigned. An employee counts as assigned when their `department_id` matches the department’s ID, even if their salary is NULL.\n\nReturn `department_id`, then `department_name`. Row order does not matter.',
  dataset: 'company',
  answer,
  orderMatters: false,
  hints: ['Test for the absence of an employee row using a column that cannot be NULL on a real employee.'],
  solutionNotes: `\`\`\`sql\n${answer}\n\`\`\`\n\nLegal is empty. Filtering on \`e.salary IS NULL\` also returns Engineering because Ivy is an employee whose salary is unknown. Use the primary key to tell an absent row from a present row with missing details.`,
  interviewNotes: 'An outer join fills in NULLs for an unmatched row. Be ready to explain why `NOT EXISTS` also avoids the NULL pitfall and why `NOT IN` over the nullable `employees.department_id` does not.',
};

export default item;
