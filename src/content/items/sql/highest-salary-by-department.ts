import type { SqlItem } from '../../types';

const answer = `WITH department_maxima AS (
  SELECT department_id, MAX(salary) AS top_salary
  FROM employees
  WHERE salary IS NOT NULL
  GROUP BY department_id
)
SELECT d.id AS department_id, d.name AS department_name,
       e.id AS employee_id, e.name AS employee_name, e.salary
FROM departments AS d
JOIN department_maxima AS m ON m.department_id = d.id
JOIN employees AS e ON e.department_id = d.id AND e.salary = m.top_salary;`;

const item: SqlItem = {
  id: 'highest-salary-by-department',
  kind: 'sql',
  title: 'Highest salary by department',
  difficulty: 'Medium',
  topics: ['SQL', 'Grouping', 'Joins'],
  roles: ['automation', 'sdet'],
  summary: 'Find the highest-paid employees in each department, including ties.',
  prompt: 'For each department with at least one known salary, return every employee who earns that department’s highest salary. Include all ties. Exclude employees without a matching department and departments with no known salaries.\n\nReturn `department_id`, `department_name`, `employee_id`, `employee_name`, `salary`, in that column order. Row order does not matter.',
  dataset: 'company',
  answer,
  orderMatters: false,
  hints: ['The maximum must be calculated separately for each department before finding the people who earn it.'],
  solutionNotes: `\`\`\`sql\n${answer}\n\`\`\`\n\nA company-wide \`MAX(salary)\` returns only the Engineering winner. Match on both department and salary so the correct people come back for every group.`,
  interviewNotes: 'Avoid selecting a bare employee name beside `MAX(salary)` in a grouped query. SQLite can pick a name from a max row, but it still drops other tied rows. PostgreSQL rejects an ungrouped employee name in this query, and so does MySQL with `ONLY_FULL_GROUP_BY` enabled.',
};

export default item;
