import type { SqlItem } from '../../types';

const answer = `SELECT d.id AS department_id, d.name AS department_name,
       COUNT(e.id) AS employee_count,
       COUNT(e.id) - COUNT(e.salary) AS missing_salary_count
FROM departments AS d
LEFT JOIN employees AS e ON e.department_id = d.id
GROUP BY d.id, d.name;`;

const item: SqlItem = {
  id: 'missing-salaries-by-department',
  kind: 'sql',
  title: 'Missing salaries by department',
  difficulty: 'Medium',
  topics: ['SQL', 'Counting', 'NULL'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Count missing salaries without inventing a missing employee in empty departments.',
  prompt: 'For every department, count its employees and how many of those employees have a NULL salary. Include empty departments with zero for both counts. Ignore employees who are not attached to a department.\n\nReturn `department_id`, `department_name`, `employee_count`, `missing_salary_count`, in that column order. Row order does not matter.',
  dataset: 'company',
  answer,
  orderMatters: false,
  hints: ['A left join produces one row for Legal even though it has zero employees. What can you count that excludes that row?'],
  solutionNotes: `\`\`\`sql\n${answer}\n\`\`\`\n\n\`COUNT(e.id)\` counts real employees; \`COUNT(e.salary)\` counts employees with a known salary. Using \`COUNT(*)\` in either occurrence of \`COUNT(e.id)\` incorrectly counts the NULL-filled join row for Legal.`,
  interviewNotes: 'In SQLite, PostgreSQL, and MySQL, `COUNT(*)` counts rows and `COUNT(column)` counts non-NULL values. Check the empty group and the group with one unknown salary separately.',
};

export default item;
