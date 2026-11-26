import type { Track } from '../types';

const track: Track = {
  id: 'automation',
  role: 'automation',
  title: 'QA automation engineer',
  summary: 'Build Playwright checks that express user behavior and give useful failure evidence.',
  sections: [
    { title: 'Week 1: Coverage and locators', note: 'Choose which behaviors earn automation and how each target can be found by intent.', items: ['q-auto-001', 'q-auto-002', 'q-pw-001', 'weekly-digest-checkbox', 'save-release-not-draft'] },
    { title: 'Week 2: Waits and isolation', note: 'Wait for observable app behavior and give each test independent state.', items: ['q-pw-002', 'q-pw-005', 'uilab-delayed-login', 'uilab-todo-filters'] },
    { title: 'Week 3: Debugging CI', note: 'Explain what the first failure artifact shows and which change would remove the cause.', items: ['q-pw-007', 'q-auto-007', 'playwright-render-race', 'uilab-repair-flaky-search'] },
    { title: 'Week 4: API checks and code review', note: 'Explain which assertions belong in the API layer and which behavior still needs the UI.', items: ['q-api-003', 'q-auto-011', 'todo-pages-api', 'playwright-order-review', 'q-beh-006'] },
  ],
};

export default track;
