import type { SqlItem } from '../../types';

const answer = `WITH salary_ranks AS (
  SELECT id, name, salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS salary_rank
  FROM employees
  WHERE salary IS NOT NULL
)
SELECT id AS employee_id, name AS employee_name, salary
FROM salary_ranks
WHERE salary_rank = 2
ORDER BY employee_id ASC;`;

const item: SqlItem = {
  id: 'second-highest-salary',
  kind: 'sql',
  title: 'Second-highest salary',
  difficulty: 'Medium',
  topics: ['SQL', 'Window functions', 'Ties'],
  roles: ['automation', 'sdet'],
  summary: 'Find everyone tied at the second-highest distinct salary.',
  prompt: 'Find every employee earning the second-highest distinct known salary. Ignore NULL salaries. If there are fewer than two distinct known salaries, return no rows.\n\nReturn `employee_id`, `employee_name`, `salary`, in that column order. Sort by employee ID ascending.',
  dataset: 'company',
  answer,
  orderMatters: true,
  hints: ['Rank salary values as a group so employees with the same salary receive the same rank.'],
  solutionNotes: `\`\`\`sql\n${answer}\n\`\`\`\n\nLuis and Grace both earn 142000. Taking one row with \`LIMIT 1 OFFSET 1\` loses a person. \`DENSE_RANK\` also avoids the rank gap that \`RANK\` leaves if several people share first place.`,
  interviewNotes: 'Ask whether “second-highest” means a distinct amount or a row in a sorted list. PostgreSQL and MySQL 8+ support `DENSE_RANK`. A subquery selecting the second distinct amount with `LIMIT 1 OFFSET 1`, followed by a lookup of all matching employees, also works in both.',
};

export default item;
