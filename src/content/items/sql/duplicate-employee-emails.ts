import type { SqlItem } from '../../types';

const answer = `SELECT email, COUNT(*) AS employee_count
FROM employees
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;`;

const item: SqlItem = {
  id: 'duplicate-employee-emails',
  kind: 'sql',
  title: 'Duplicate employee emails',
  difficulty: 'Easy',
  topics: ['SQL', 'Grouping', 'Data checks'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Find shared email addresses in an employee import.',
  prompt: 'Audit the employee directory for duplicate email addresses. Count employees per email as stored, without trimming or changing case. Ignore NULL emails and return only addresses used by more than one employee.\n\nReturn `email`, then `employee_count`. Row order does not matter.',
  dataset: 'company',
  answer,
  orderMatters: false,
  hints: ['Filter individual rows before grouping, then filter complete groups.'],
  solutionNotes: `\`\`\`sql\n${answer}\n\`\`\`\n\nMaya and Grace share \`maya.chen@corp.test\`. Grouping counts each address; without \`HAVING\`, the result also includes every address that occurs only once.`,
  interviewNotes: 'Clarify the duplicate rule before normalizing an address. Text comparison can depend on collation; a MySQL database with a case-insensitive collation can group values that the SQLite seed keeps separate.',
};

export default item;
