import type { SqlItem } from '../../types';

const answer = `WITH timed_runs AS (
  SELECT c.suite, t.id AS run_id, c.title AS test_case_title, t.duration_ms,
         DENSE_RANK() OVER (PARTITION BY c.suite ORDER BY t.duration_ms DESC) AS duration_rank
  FROM test_runs AS t
  JOIN test_cases AS c ON c.id = t.test_case_id
  WHERE t.duration_ms IS NOT NULL
)
SELECT suite, run_id, test_case_title, duration_ms
FROM timed_runs
WHERE duration_rank = 1;`;

const item: SqlItem = {
  id: 'slowest-run-by-suite',
  kind: 'sql',
  title: 'Slowest run by suite',
  difficulty: 'Hard',
  topics: ['SQL', 'Window functions', 'Test metrics'],
  roles: ['automation', 'sdet', 'lead'],
  summary: 'Find the run with the longest recorded duration in every suite.',
  prompt: 'Across all releases, find the longest recorded test run in each suite. Consider every run with a known duration, regardless of status. Return all runs tied for longest within their suite and omit suites with no timed runs.\n\nReturn `suite`, `run_id`, `test_case_title`, `duration_ms`, in that column order. Row order does not matter.',
  dataset: 'testops',
  answer,
  orderMatters: false,
  hints: ['Partition the ranks by suite. Rank at run level so the answer can identify the run that consumed the time.'],
  solutionNotes: `\`\`\`sql\n${answer}\n\`\`\`\n\nCheckout’s slowest run is the failed 9100 ms payment run. Filtering to passing tests gives the wrong bottleneck. \`DENSE_RANK\` keeps every run at the maximum duration, even when two runs of the same case tie.`,
  interviewNotes: 'A top-by-group question needs the partition key and a tie rule. PostgreSQL and MySQL 8+ support the same window function; grouping by suite and joining back on the maximum duration is another option.',
};

export default item;
