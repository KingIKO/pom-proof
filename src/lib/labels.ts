import type { Kind, Role } from './contracts';

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
} satisfies Record<Role, string>;
