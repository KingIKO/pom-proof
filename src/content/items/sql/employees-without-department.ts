import type { SqlItem } from '../../types';

const answer = `SELECT e.id AS employee_id, e.name AS employee_name
FROM employees AS e
LEFT JOIN departments AS d ON d.id = e.department_id
WHERE d.id IS NULL;`;

const item: SqlItem = {
  id: 'employees-without-department',
  kind: 'sql',
  title: 'Employees without a department',
  difficulty: 'Easy',
  topics: ['SQL', 'Left joins', 'Data checks'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Find employees whose department link is missing or invalid.',
  prompt: 'Find employees who do not have a matching row in `departments`. Include both unset department IDs and IDs that point to a department that does not exist.\n\nReturn `employee_id`, then `employee_name`. Row order does not matter.',
  dataset: 'company',
  answer,
  orderMatters: false,
  hints: ['Keep all employees in the join, then check a non-nullable column on the departments side.'],
  solutionNotes: `\`\`\`sql\n${answer}\n\`\`\`\n\nOmar’s row has a NULL department ID. A \`NOT IN\` check on that ID leaves him out because comparing NULL with a list yields unknown. Checking the joined department’s primary key covers a missing department in either form.`,
  interviewNotes: 'Explain why `e.department_id IS NULL` would find Omar in this snapshot but miss a stale non-NULL ID in an import. `NOT EXISTS` is another portable way to check for no matching row.',
};

export default item;
