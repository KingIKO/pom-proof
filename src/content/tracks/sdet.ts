import type { Track } from '../types';

const track: Track = {
  id: 'sdet',
  role: 'sdet',
  title: 'SDET',
  summary: 'Practice testable code, API contracts, SQL checks and failure analysis.',
  sections: [
    { title: 'Week 1: Coding for test problems', note: 'State the input contract and choose edge cases before writing code.', items: ['stable-unique-test-ids', 'junit-status-counts', 'missing-build-ids', 'q-auto-014'] },
    { title: 'Week 2: API contracts and state', note: 'Verify what the system persisted, including when a retry or failure occurs.', items: ['q-api-001', 'q-api-004', 'q-api-007', 'idempotent-orders-api', 'order-line-price-mismatches'] },
    { title: 'Week 3: SQL and parallel tests', note: 'Check assumptions about missing data, duplicate rows and shared state.', items: ['duplicate-employee-emails', 'defects-without-test-case', 'parallel-shared-user', 'q-pw-008'] },
    { title: 'Week 4: Automation design review', note: 'Tie each proposed change to what it would catch or make easier to diagnose.', items: ['q-auto-009', 'uilab-repair-flaky-search', 'playwright-order-review', 'detect-flaky-tests', 'q-beh-008'] },
  ],
};

export default track;
