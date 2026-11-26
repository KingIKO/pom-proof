import type { Kind, Role } from './types';

export const KIND_INFO: Record<Kind, { label: string; plural: string; blurb: string; graded: string }> = {
  testdesign: {
    label: 'Test design',
    plural: 'Test design',
    blurb: 'Write test inputs for a spec. Graded on coverage of each class and boundary, correct expected results, and the planted bugs your rows catch.',
    graded: 'Partitions covered, expected results, bugs caught',
  },
  scenario: {
    label: 'How would you test',
    plural: 'How would you test',
    blurb: 'The classic open question on a real feature. Brainstorm on a timer, compare against a weighted key, then pick the tests that matter under a budget.',
    graded: 'Weighted checklist and prioritisation',
  },
  locator: {
    label: 'Locator',
    plural: 'Locators',
    blurb: 'Find the element with CSS, XPath or Playwright locators on a real page. Exact matches pass; brittle locators get flagged.',
    graded: 'Exact element match, robustness review',
  },
  uilab: {
    label: 'UI automation',
    plural: 'UI automation',
    blurb: 'Write a Playwright-style test against a small app. It must pass on the working build and fail on each broken build.',
    graded: 'Passes clean build, catches each broken build',
  },
  mutation: {
    label: 'Unit and API tests',
    plural: 'Unit and API tests',
    blurb: 'Write tests for a function or an API. Your suite must pass on the real code and catch every planted bug.',
    graded: 'Mutation score',
  },
  diagnose: {
    label: 'Failing test',
    plural: 'Failing tests',
    blurb: 'A test failed or flaked in CI. Read the code and the log, then find the root cause and the right fix.',
    graded: 'Root cause and fix',
  },
  review: {
    label: 'Test code review',
    plural: 'Test code review',
    blurb: 'Review a pull request of test code. Flag the lines that will hurt and say why.',
    graded: 'Issues found, false flags',
  },
  bughunt: {
    label: 'Bug hunt',
    plural: 'Bug hunts',
    blurb: 'Explore a small app against its spec, reproduce defects and file bug reports. Reports are checked against what you actually triggered.',
    graded: 'Bugs confirmed, report quality',
  },
  sql: {
    label: 'SQL',
    plural: 'SQL',
    blurb: 'Query realistic data the way a tester does: joins, aggregates, duplicates, NULL traps and data checks.',
    graded: 'Result set match',
  },
  coding: {
    label: 'Coding',
    plural: 'Coding',
    blurb: 'Tester-flavoured coding rounds in JavaScript, TypeScript or Python: parsing logs, checking data, retry helpers.',
    graded: 'Visible and hidden cases',
  },
};

export const KIND_ORDER: Kind[] = ['testdesign', 'scenario', 'locator', 'uilab', 'mutation', 'diagnose', 'review', 'bughunt', 'sql', 'coding'];

export const ROLE_INFO: Record<Role, { label: string; short: string }> = {
  manual: { label: 'QA Analyst', short: 'Manual' },
  automation: { label: 'QA Automation Engineer', short: 'Automation' },
  sdet: { label: 'SDET', short: 'SDET' },
  lead: { label: 'Senior and Lead QA', short: 'Lead' },
};
