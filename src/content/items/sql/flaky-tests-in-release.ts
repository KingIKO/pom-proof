import type { SqlItem } from '../../types';

const answer = `SELECT DISTINCT f.release_id, c.id AS test_case_id, c.title AS test_case_title
FROM test_runs AS f
JOIN test_cases AS c ON c.id = f.test_case_id
WHERE f.status = 'failed'
  AND EXISTS (
    SELECT 1
    FROM test_runs AS p
    WHERE p.test_case_id = f.test_case_id
      AND p.release_id = f.release_id
      AND p.status = 'passed'
      AND p.run_at > f.run_at
  );`;

const item: SqlItem = {
  id: 'flaky-tests-in-release',
  kind: 'sql',
  title: 'Tests that failed and later passed',
  difficulty: 'Hard',
  topics: ['SQL', 'Correlated subqueries', 'Test retries'],
  roles: ['automation', 'sdet', 'lead'],
  summary: 'Find fail-then-pass sequences within a single release.',
  prompt: 'Flag a test case in a release if at least one failed run has a passing run with a strictly later `run_at` for the same case and release. An equal or missing timestamp does not establish the sequence. Return one row per qualifying case and release, regardless of how many retries qualify.\n\nReturn `release_id`, `test_case_id`, `test_case_title`, in that column order. Row order does not matter.',
  dataset: 'testops',
  answer,
  orderMatters: false,
  hints: ['For each failure, look for a later pass that matches both parts of the case/release pair.'],
  solutionNotes: `\`\`\`sql\n${answer}\n\`\`\`\n\n\`EXISTS\` keeps a failure if a later pass is present. \`DISTINCT\` collapses several qualifying failures of the same test case in the same release. Omitting the release match makes the login lockout test look flaky because it passed in the next release.`,
  interviewNotes: 'A fail-then-pass sequence makes a test worth investigating. Ask whether the build, input, and environment stayed fixed before calling it flaky. The seed stores zero-padded dates in sortable text; native timestamp columns are preferable in PostgreSQL or MySQL.',
};

export default item;
