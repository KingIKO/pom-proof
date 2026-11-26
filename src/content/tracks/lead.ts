import type { Track } from '../types';

const track: Track = {
  id: 'lead',
  role: 'lead',
  title: 'Senior and lead QA',
  summary: 'Practice risk decisions, quality metrics, incident learning and team coaching.',
  sections: [
    { title: 'Week 1: Quality strategy', note: 'Name the top risks and the evidence you would need to make a release decision.', items: ['q-lead-001', 'q-lead-003', 'checkout-pairwise', 'test-checkout-form'] },
    { title: 'Week 2: Metrics and failure evidence', note: 'Explain how each metric could mislead and what other evidence you would check.', items: ['q-lead-002', 'pass-rate-by-release', 'flaky-tests-in-release', 'slowest-run-by-suite'] },
    { title: 'Week 3: Feedback and incident learning', note: 'Turn an observed failure into one change with an owner and a check.', items: ['q-lead-006', 'q-lead-007', 'playwright-order-review', 'parallel-shared-user'] },
    { title: 'Week 4: Change and influence', note: 'Use examples with a decision, your own actions and a result you can support.', items: ['q-lead-004', 'q-lead-005', 'q-lead-008', 'q-beh-012', 'test-search-autocomplete'] },
  ],
};

export default track;
