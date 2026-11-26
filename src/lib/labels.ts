import type { Kind, Problem, Role } from './contracts';

export const kindLabel = {
  scenario: 'Scenario',
  'test-design': 'Test design',
  diagnosis: 'Diagnosis',
  'bug-report': 'Bug report',
  locator: 'Locator',
  sql: 'SQL',
  code: 'Code',
} satisfies Record<Kind, string>;

export const roleLabel = {
  'manual-qa': 'Manual QA',
  automation: 'QA automation',
  sdet: 'SDET',
  senior: 'Senior and lead QA',
} satisfies Record<Role, string>;

export const difficultyLabel = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
} satisfies Record<Problem['difficulty'], string>;

export const statusLabel = {
  solved: 'Solved',
  attempted: 'Attempted',
  unattempted: 'Unattempted',
} as const;

export function problemStatus(score: number | undefined): keyof typeof statusLabel {
  if (score === 1) return 'solved';
  return score === undefined ? 'unattempted' : 'attempted';
}

export function topicLabel(topic: string) {
  if (topic === 'playwright') return 'Playwright';
  const text = topic.replaceAll('-', ' ');
  return text.slice(0, 1).toUpperCase() + text.slice(1);
}
