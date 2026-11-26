import type { SqlItem } from '../../types';

const answer = `SELECT e.id AS employee_id, e.name AS employee_name,
       m.name AS manager_name
FROM employees AS e
LEFT JOIN employees AS m ON m.id = e.manager_id;`;

const item: SqlItem = {
  id: 'employee-manager-names',
  kind: 'sql',
  title: 'Employee and manager names',
  difficulty: 'Easy',
  topics: ['SQL', 'Self joins', 'Left joins'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Build a directory that includes each employee’s direct manager.',
  prompt: 'Return one row per employee with their direct manager’s name. Keep employees with no matching manager and return NULL for their manager name. Do not follow the chain beyond the direct manager.\n\nReturn `employee_id`, `employee_name`, `manager_name`, in that column order. Row order does not matter.',
  dataset: 'company',
  answer,
  orderMatters: false,
  hints: ['Give the employees table two aliases, one for the report and one for the manager.'],
  solutionNotes: `\`\`\`sql\n${answer}\n\`\`\`\n\nJoin the employee’s \`manager_id\` to the manager’s \`id\`. An inner join drops Maya and Jon, whose manager IDs are NULL.`,
  interviewNotes: 'Explain the direction using one person: Luis’s `manager_id` points at Maya’s `id`. A recursive CTE would answer a different question, such as finding everyone above Luis.',
};

export default item;
