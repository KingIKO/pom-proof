import type { SqlItem } from '../../types';

const answer = `SELECT d.id AS defect_id, d.title AS defect_title, t.title AS test_case_title
FROM defects AS d
LEFT JOIN test_cases AS t ON t.id = d.test_case_id
WHERE d.severity = 'critical' AND d.status IN ('open', 'in_progress');`;

const item: SqlItem = {
  id: 'open-critical-defects',
  kind: 'sql',
  title: 'Open critical defects',
  difficulty: 'Easy',
  topics: ['SQL', 'Left joins', 'Defect triage'],
  roles: ['manual', 'automation', 'sdet', 'lead'],
  summary: 'Build the critical-defect triage queue with linked test titles.',
  prompt: 'The triage queue treats `open` and `in_progress` defects as open work. List critical defects in that queue, with the linked test case title if one exists. Keep defects without a matching case and show NULL for their test case title.\n\nReturn `defect_id`, `defect_title`, `test_case_title`, in that column order. Row order does not matter.',
  dataset: 'testops',
  answer,
  orderMatters: false,
  hints: ['The queue has two eligible statuses. Preserve the defect even if the join finds no case.'],
  solutionNotes: `\`\`\`sql\n${answer}\n\`\`\`\n\nFiltering on \`status = 'open'\` hides the critical saved-card timeout because its owner is already working on it. The left join would also keep a critical defect awaiting a test case link.`,
  interviewNotes: 'Confirm the team’s workflow vocabulary. The column value `open` can be narrower than the set of defects that still block a release.',
};

export default item;
