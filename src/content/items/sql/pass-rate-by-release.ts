import type { SqlItem } from '../../types';

const answer = `SELECT r.id AS release_id, r.version,
       COUNT(t.id) AS executed_count,
       ROUND(100.0 * SUM(CASE WHEN t.status = 'passed' THEN 1 ELSE 0 END)
             / NULLIF(COUNT(t.id), 0), 2) AS pass_rate_pct
FROM releases AS r
LEFT JOIN test_runs AS t ON t.release_id = r.id AND t.status IN ('passed', 'failed')
GROUP BY r.id, r.version
ORDER BY release_id ASC;`;

const item: SqlItem = {
  id: 'pass-rate-by-release',
  kind: 'sql',
  title: 'Pass rate by release',
  difficulty: 'Medium',
  topics: ['SQL', 'Conditional aggregation', 'Test metrics'],
  roles: ['manual', 'automation', 'sdet', 'lead'],
  summary: 'Calculate pass percentage by attempt, including releases with no test runs.',
  prompt: 'For every release, calculate the percentage of executed test attempts that passed. An executed attempt has status `passed` or `failed`; ignore skipped and unknown statuses, and count retries as separate attempts. Give releases with no executed attempts an executed count of zero and a NULL percentage. Round the percentage to two decimal places.\n\nReturn `release_id`, `version`, `executed_count`, `pass_rate_pct`, in that column order. Sort by release ID ascending.',
  dataset: 'testops',
  answer,
  orderMatters: true,
  hints: ['Filter the statuses as part of the join so an empty release can still appear.'],
  solutionNotes: `\`\`\`sql\n${answer}\n\`\`\`\n\nRelease 4.1.0 has five passes in eight executed attempts, so its rate is 62.50%. Counting the skipped run in the denominator understates the rate. Counting a run ID and guarding the zero denominator keeps 4.3.0 in the report with the requested values.`,
  interviewNotes: 'Define the denominator before writing SQL: an attempt-level metric can look different from a latest-result metric. In PostgreSQL, use numeric division for a two-argument `ROUND`; the `100.0` literal also keeps the SQLite expression from doing integer division.',
};

export default item;
