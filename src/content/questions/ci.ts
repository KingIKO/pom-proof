import type { Question, Source } from '../types';

const src = (label: string, url: string): Source => ({ label, url });
const GH = 'https://docs.github.com/en/';

const questions: Question[] = [
  {
    id: 'q-ci-001',
    topic: 'CI/CD and Git',
    roles: ['automation', 'sdet', 'lead'],
    level: 'Junior',
    type: 'Concept',
    question: 'Which tests should run on every pull request, and which can wait for a nightly or pre-release run?',
    answer:
      'On every pull request I want fast feedback that blocks real breakage: linting, type checks, unit tests, component and API tests, and a small smoke set of end-to-end journeys. The goal is a result in minutes, so developers wait for it instead of ignoring it.\n\nSlower or broader checks run on a schedule or before release: the full end-to-end suite, cross-browser and device runs, performance and long-running security scans. Anything that runs nightly needs an owner who reads the results, otherwise failures pile up and the suite stops meaning anything.',
    lookFor: [
      'Prioritizes fast, reliable checks on pull requests',
      'Moves slow or broad suites to scheduled runs',
      'Mentions keeping feedback time short',
      'Assigns ownership of scheduled results',
    ],
    mistakes: ['Running the entire slow suite on every commit until people bypass it'],
    followUps: ['How would you decide which end-to-end tests make the smoke set?'],
    sources: [src('GitHub Docs: Events that trigger workflows', GH + 'actions/reference/workflows-and-actions/events-that-trigger-workflows')],
  },
  {
    id: 'q-ci-002',
    topic: 'CI/CD and Git',
    roles: ['automation', 'sdet'],
    level: 'Mid',
    type: 'Scenario',
    question: 'A test passes on your machine but fails in CI. How do you investigate?',
    answer:
      'I start with evidence from the failing run: the full log, the error, and any screenshots, videos or traces the job saved as artifacts. Then I list what differs between my machine and CI, such as dependency versions, environment variables, timezone and locale, screen size, CPU speed, test order and parallelism.\n\nI try to reproduce CI conditions locally, for example running in the same container image, headless, with the same worker count and the same order. If it only fails alongside other tests, I suspect shared state. Once I find the cause, I fix it in the test or the product rather than adding a longer wait.',
    lookFor: [
      'Collects artifacts from the failed run first',
      'Lists concrete environment differences',
      'Reproduces CI conditions locally',
      'Considers test order and shared state',
      'Fixes the cause rather than adding sleeps',
    ],
    mistakes: ['Rerunning until it passes and closing the issue'],
    followUps: ['What would you configure so the next failure comes with a trace attached?'],
    sources: [
      src('GitHub Docs: Storing workflow data as artifacts', GH + 'actions/tutorials/store-and-share-data'),
      src('Playwright: Trace viewer', 'https://playwright.dev/docs/trace-viewer'),
    ],
  },
  {
    id: 'q-ci-003',
    topic: 'CI/CD and Git',
    roles: ['automation', 'sdet', 'lead'],
    level: 'Mid',
    type: 'Concept',
    question: 'Should CI automatically retry failed tests?',
    answer:
      'A small number of retries can be reasonable for end-to-end tests that touch real networks, as long as flakiness stays visible. Playwright, for example, reports a test that fails and then passes on retry as flaky rather than simply passing, and I want that status tracked.\n\nThe danger is retries hiding real problems, including race conditions in the product itself. So I keep retries low, record which tests needed them, and treat repeat offenders as bugs with an owner. Unit tests should not need retries at all; if they do, the test or code is wrong.',
    lookFor: [
      'Accepts limited retries with visible flaky reporting',
      'Recognizes flakiness can be a product bug',
      'Tracks and owns flaky tests',
      'Does not retry unit tests',
    ],
    mistakes: ['Setting high retry counts so the build always goes green'],
    followUps: ['How would you quarantine a flaky test without losing coverage?'],
    sources: [src('Playwright: Retries', 'https://playwright.dev/docs/test-retries')],
  },
  {
    id: 'q-ci-004',
    topic: 'CI/CD and Git',
    roles: ['automation', 'sdet'],
    level: 'Mid',
    type: 'Tooling',
    question: 'A regression appeared somewhere in the last 200 commits. How would you find the commit that caused it?',
    answer:
      'I would use git bisect. I mark a known bad commit and a known good one, and Git checks out a commit halfway between. I test it and mark it good or bad, and Git keeps halving the range, so 200 commits take about eight steps.\n\nIf I can write a script that reproduces the bug, git bisect run automates it: exit code 0 means good, 125 means skip this commit, and most other non-zero codes mean bad. When it finishes I get the first bad commit, which makes the bug report and the fix much more focused.',
    lookFor: [
      'Names git bisect and the good and bad markers',
      'Understands it is a binary search',
      'Knows git bisect run can automate it',
      'Knows how to skip untestable commits',
    ],
    mistakes: ['Checking out commits one by one from newest to oldest'],
    followUps: ['What would you do if some commits in the range do not build?'],
    sources: [src('Git documentation: git-bisect', 'https://git-scm.com/docs/git-bisect')],
  },
  {
    id: 'q-ci-005',
    topic: 'CI/CD and Git',
    roles: ['manual', 'automation', 'sdet'],
    level: 'Junior',
    type: 'Concept',
    question: 'What is the difference between merge, rebase and revert, and which is safe on a shared branch?',
    answer:
      'Merge joins two branches and records a merge commit, keeping history as it happened. Rebase replays your commits on top of another branch, which gives a straight line but rewrites those commits with new ids. Revert creates a new commit that undoes an earlier one.\n\nOn a shared branch like main, revert is the safe way to undo a change, because it does not rewrite history other people have pulled. Rebasing is fine on my own branch before sharing it, but rebasing a branch others use forces them to reconcile rewritten history.',
    lookFor: [
      'Explains each operation correctly',
      'Knows rebase rewrites commits',
      'Chooses revert for undoing changes on shared branches',
      'Limits rebase to unshared work',
    ],
    mistakes: ['Force-pushing a rebased main branch to remove a bad commit'],
    followUps: ['How would you get one bug fix from main onto a release branch?'],
    sources: [
      src('Git documentation: git-rebase', 'https://git-scm.com/docs/git-rebase'),
      src('Git documentation: git-revert', 'https://git-scm.com/docs/git-revert'),
      src('Git documentation: git-merge', 'https://git-scm.com/docs/git-merge'),
    ],
  },
  {
    id: 'q-ci-006',
    topic: 'CI/CD and Git',
    roles: ['automation', 'sdet', 'lead'],
    level: 'Mid',
    type: 'Scenario',
    question: 'The test pipeline takes 50 minutes and developers have started to ignore it. How would you speed it up?',
    answer:
      'I measure before changing anything: which jobs and tests take the longest, and how much time goes to installing dependencies or building. Common wins are caching dependencies between runs, running independent jobs in parallel, and splitting the end-to-end suite across machines with sharding.\n\nThen I look at the tests themselves. Slow UI tests that check business rules can often move to the API layer, and setup done through the UI can be done through an API call. I also look for fixed waits. After each change I compare timings so we know what actually helped.',
    lookFor: [
      'Measures where the time goes first',
      'Mentions caching, parallel jobs and sharding',
      'Improves the tests, not only the infrastructure',
      'Verifies improvements with timings',
    ],
    mistakes: ['Deleting slow tests without checking what coverage is lost'],
    followUps: ['How do you combine reports when a suite is split across shards?'],
    sources: [
      src('GitHub Docs: Caching dependencies to speed up workflows', GH + 'actions/reference/workflows-and-actions/dependency-caching'),
      src('Playwright: Sharding', 'https://playwright.dev/docs/test-sharding'),
    ],
  },
  {
    id: 'q-ci-007',
    topic: 'CI/CD and Git',
    roles: ['automation', 'sdet', 'lead'],
    level: 'Mid',
    type: 'Concept',
    question: 'Your tests need an API key and a test account password. How should they be handled in CI?',
    answer:
      'They belong in the CI system\'s secret store, not in the repository or the test code. In GitHub Actions they are stored as encrypted secrets, exposed to a job as environment variables, and redacted if they appear in logs. Even so, I avoid printing them, since redaction is not perfect when a value is transformed.\n\nI use credentials scoped to test environments with the least access needed, and rotate them. GitHub does not pass secrets, other than GITHUB_TOKEN, to workflows triggered from forks, so I make sure tests that need secrets handle that case clearly.',
    lookFor: [
      'Uses the CI secret store, never the repo',
      'Avoids printing secrets even with masking',
      'Uses least-privilege, test-only credentials and rotation',
      'Knows fork pull requests do not receive secrets',
    ],
    mistakes: ['Committing a .env file with real credentials "just for CI"'],
    followUps: ['What would you do if a secret was accidentally committed?'],
    sources: [
      src('GitHub Docs: Using secrets in GitHub Actions', GH + 'actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets'),
      src('OWASP Secrets Management Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html'),
    ],
  },
  {
    id: 'q-ci-008',
    topic: 'CI/CD and Git',
    roles: ['sdet', 'lead'],
    level: 'Senior',
    type: 'Scenario',
    question: 'You are asked to set up quality gates for merging to main. What would you require?',
    answer:
      'I would protect the main branch so changes arrive only through pull requests, and require the important checks to pass first: build, lint, unit and API tests, and the smoke end-to-end set. I would require at least one approving review and that the branch is up to date with main, so checks run against what will actually merge.\n\nI keep gates to checks that are fast and trustworthy. A flaky required check trains people to override it, so a check becomes required only after it has been stable. Coverage thresholds I treat as a trend to watch rather than a hard gate.',
    lookFor: [
      'Uses branch protection with required status checks',
      'Requires review and up-to-date branches',
      'Only gates on reliable, fast checks',
      'Treats coverage carefully rather than as a hard number',
    ],
    mistakes: ['Making every check required, including flaky ones'],
    followUps: ['How would you handle an urgent production fix when a required check is broken?'],
    sources: [src('GitHub Docs: About protected branches', GH + 'repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches')],
  },
];

export default questions;
