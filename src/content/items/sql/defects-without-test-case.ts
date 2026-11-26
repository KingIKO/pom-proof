import type { SqlItem } from '../../types';

const answer = `SELECT d.id AS defect_id, d.title AS defect_title
FROM defects AS d
LEFT JOIN test_cases AS t ON t.id = d.test_case_id
WHERE t.id IS NULL;`;

const item: SqlItem = {
  id: 'defects-without-test-case',
  kind: 'sql',
  title: 'Defects without a test case',
  difficulty: 'Easy',
  topics: ['SQL', 'Left joins', 'Coverage gaps'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Find defects that have no matching regression test case.',
  prompt: 'Find defects that have no matching test case. Include a defect if its link is unset or points to an ID missing from `test_cases`. Include defects of any status or severity.\n\nReturn `defect_id`, then `defect_title`. Row order does not matter.',
  dataset: 'testops',
  answer,
  orderMatters: false,
  hints: ['Keep the defect rows even when there is no match on the test case side.'],
  solutionNotes: `\`\`\`sql\n${answer}\n\`\`\`\n\n“Search ignores accents” has an unset link. A \`NOT IN\` check on the defect’s case ID excludes this row because NULL does not make the predicate true.`,
  interviewNotes: 'Checking only `defects.test_case_id IS NULL` would find the seeded gap. In an import audit, show that the chosen query also catches a non-NULL link to a missing case.',
};

export default item;
