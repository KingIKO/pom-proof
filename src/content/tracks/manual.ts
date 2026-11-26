import type { Track } from '../types';

const track: Track = {
  id: 'manual',
  role: 'manual',
  title: 'QA analyst',
  summary: 'Work from requirements to test cases, clear bug reports and a release recommendation.',
  sections: [
    { title: 'Week 1: Test fundamentals', note: 'Explain what you tested, what you found and what remains uncertain.', items: ['q-fund-001', 'q-fund-002', 'q-fund-005', 'test-login-page'] },
    { title: 'Week 2: Test design', note: 'Use examples that expose different failures, then write the expected result for each.', items: ['q-design-001', 'q-design-002', 'age-boundaries', 'shipping-decision-table', 'checkout-pairwise'] },
    { title: 'Week 3: Reporting and triage', note: 'Separate the evidence, the impact and the decision about what to do next.', items: ['q-triage-001', 'q-triage-002', 'q-triage-003', 'bughunt-signup-form', 'open-critical-defects'] },
    { title: 'Week 4: Interview rounds', note: 'Talk through your priorities before you list detailed cases.', items: ['test-file-upload', 'test-checkout-form', 'q-api-009', 'q-beh-001'] },
  ],
};

export default track;
