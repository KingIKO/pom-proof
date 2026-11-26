import type { Question } from '../types';

const topic = "Playwright";

const questions: Question[] = [
  {
    id: "q-pw-001",
    topic,
    roles: ["manual", "automation", "sdet"],
    level: "Junior",
    type: "Concept",
    question: "What does Playwright check before it clicks an element?",
    answer:
      "Playwright runs actionability checks and waits until they pass or the action times out. For a click, the locator must resolve to exactly one element, and that element must be visible, stable, meaning not animating, enabled, not inert, and able to receive events, so it is not covered by an overlay at the click point. Different actions use different checks. Fill, for example, needs the element to be editable. This auto-waiting removes most manual waits. It also means a timeout usually tells you something real, like a spinner still covering the button.",
    lookFor: [
      "Exactly one matching element",
      "Visible, stable, enabled, and receives events",
      "Different actions use different checks",
      "Timeouts as meaningful signals",
    ],
    mistakes: [
      "Saying Playwright only waits for the element to exist",
      "Adding manual waits before every action",
    ],
    followUps: [
      "What does the force option skip?",
      "Is an element with opacity zero considered visible?",
    ],
    sources: [
      { label: "Playwright docs: Auto-waiting", url: "https://playwright.dev/docs/actionability" },
    ],
  },
  {
    id: "q-pw-002",
    topic,
    roles: ["automation", "sdet"],
    level: "Mid",
    type: "Tooling",
    question: "What is the difference between expect(locator).toHaveText(...) and expect(await locator.textContent()).toBe(...)?",
    answer:
      "The first is a web-first assertion. It retries, re-querying the element, until the text matches or the assertion timeout passes, which defaults to five seconds. The second reads the text once, right now, and compares a plain string. If the app updates the text a moment later, the second version fails even though the user would see the right value. So I default to the locator assertions like toHaveText, toBeVisible, and toHaveCount. I use plain value checks only for data I have already fully resolved, like a parsed API response body.",
    lookFor: [
      "Auto-retrying versus one-time evaluation",
      "Default assertion timeout of five seconds",
      "Why the one-shot version is flaky",
      "When non-retrying assertions are appropriate",
    ],
    mistakes: [
      "Thinking both forms behave the same",
      "Wrapping one-shot checks in manual polling loops",
    ],
    followUps: [
      "How would you assert a value that is not on a locator but changes over time?",
      "What does a soft assertion do?",
    ],
    sources: [
      { label: "Playwright docs: Assertions", url: "https://playwright.dev/docs/test-assertions" },
    ],
  },
  {
    id: "q-pw-003",
    topic,
    roles: ["automation", "sdet"],
    level: "Mid",
    type: "Tooling",
    question: "How do you avoid logging in through the UI in every Playwright test?",
    answer:
      "I authenticate once and reuse the browser state. The documented pattern is a setup project that logs in, then saves the context storage state, meaning cookies and local storage, to a file under playwright/.auth. Other projects declare a dependency on setup and set storageState to that file, so each test starts already signed in but still in its own fresh context. The Playwright docs recommend adding that folder to .gitignore because it holds session credentials. If tests change server-side state for the account, I use one account per worker instead of one shared account.",
    lookFor: [
      "Setup project plus storageState",
      "Project dependencies in config",
      "Fresh context per test even with shared login",
      "Keeping auth files out of version control",
      "Per-worker accounts when tests mutate server state",
    ],
    mistakes: [
      "Committing the auth state file",
      "Reusing one page across all tests to stay logged in",
    ],
    followUps: [
      "How would you test multiple roles, like admin and viewer, in one test?",
      "What happens when the saved session expires?",
    ],
    sources: [
      { label: "Playwright docs: Authentication", url: "https://playwright.dev/docs/auth" },
      { label: "Playwright docs: Projects", url: "https://playwright.dev/docs/test-projects" },
    ],
  },
  {
    id: "q-pw-004",
    topic,
    roles: ["sdet", "automation"],
    level: "Senior",
    type: "Tooling",
    question: "When would you write a custom Playwright fixture instead of using beforeEach hooks?",
    answer:
      "Fixtures are on demand and composable. A test only gets the setup it asks for in its arguments, and each fixture keeps its setup and teardown together around the use call, so cleanup runs even when the test fails. Hooks run for every test in a file whether they need it or not, and the setup and teardown drift apart. I use test.extend for things like a logged-in page object, a seeded account, or an API client. If something is expensive and safe to share, like a database connection, I give it worker scope so it is created once per worker rather than once per test.",
    lookFor: [
      "Fixtures are requested by name and created on demand",
      "Setup and teardown colocated around use",
      "test.extend for reusable setup",
      "Worker scope for expensive shared resources",
    ],
    mistakes: [
      "Putting all setup in a global beforeEach",
      "Sharing mutable state through worker fixtures without isolation",
    ],
    followUps: [
      "How do you make a fixture run automatically for every test?",
      "How would you combine fixtures from two modules?",
    ],
    sources: [
      { label: "Playwright docs: Fixtures", url: "https://playwright.dev/docs/test-fixtures" },
    ],
  },
  {
    id: "q-pw-005",
    topic,
    roles: ["automation", "sdet"],
    level: "Mid",
    type: "Concept",
    question: "What is a browser context in Playwright, and why does it matter for test isolation?",
    answer:
      "A browser context is like a fresh incognito profile inside one browser process. It has its own cookies, local storage, and cache, and creating one is cheap. Playwright Test gives every test a new context by default, so tests cannot leak a session or a cart into each other, yet you avoid the cost of launching a new browser every time. You can also open two contexts in one test to simulate two users, for example a buyer and a seller chatting, each with separate sessions. That is hard to do cleanly with a single shared browser profile.",
    lookFor: [
      "Context as an isolated profile within one browser",
      "Separate cookies, storage, and cache",
      "New context per test by default",
      "Multiple contexts for multi-user scenarios",
    ],
    mistakes: [
      "Confusing a context with a tab",
      "Reusing a page across tests for speed",
    ],
    followUps: [
      "How would you test a real-time chat between two users?",
      "What is shared between contexts in the same browser?",
    ],
    sources: [
      { label: "Playwright docs: Isolation", url: "https://playwright.dev/docs/browser-contexts" },
    ],
  },
  {
    id: "q-pw-006",
    topic,
    roles: ["automation", "sdet"],
    level: "Mid",
    type: "Scenario",
    question: "How would you test that the orders page shows a friendly error when the orders API returns a 500?",
    answer:
      "Getting the real backend to fail on demand is hard, so I intercept the request. Before navigating, I call page.route with a pattern matching the orders endpoint and fulfill it with status 500 and an error body. Then I visit the page and assert on what the user sees: the error message is visible, a retry button exists, and no broken table renders. I keep the mock narrow, matching only that endpoint, so everything else still hits the real app. I would also cover a slow response and an empty list, since those are just as easy to simulate.",
    lookFor: [
      "page.route registered before navigation",
      "route.fulfill with status and body",
      "Asserting on user-visible error handling",
      "Narrow mocks and related edge cases",
    ],
    mistakes: [
      "Registering the route after the request already fired",
      "Mocking every request so nothing real is tested",
    ],
    followUps: [
      "How would you modify a real response rather than replace it?",
      "How would you record responses for later replay?",
    ],
    sources: [
      { label: "Playwright docs: Mock APIs", url: "https://playwright.dev/docs/mock" },
      { label: "Playwright docs: Network", url: "https://playwright.dev/docs/network" },
    ],
  },
  {
    id: "q-pw-007",
    topic,
    roles: ["automation", "sdet", "manual"],
    level: "Mid",
    type: "Tooling",
    question: "A Playwright test failed in CI and you cannot reproduce it. How do you use the trace viewer?",
    answer:
      "I set the trace option, typically on-first-retry in CI, so a failing test that is retried records a trace without slowing every run. The trace zip is attached to the HTML report. Opening it with npx playwright show-trace, or at trace.playwright.dev, shows a timeline of every action with DOM snapshots before and after, plus console logs, network requests, and the source line. I look at what the page looked like at the moment the action or assertion failed. Often it shows an error toast, a spinner, or a request that returned an unexpected status, which points straight at the cause.",
    lookFor: [
      "Configuring trace capture, for example on-first-retry",
      "Finding the trace in the report or CI artifacts",
      "Using DOM snapshots, network, and console panels",
      "Reasoning from the page state at failure time",
    ],
    mistakes: [
      "Recording traces for every test on every run without reason",
      "Relying only on the error message text",
    ],
    followUps: [
      "What is the difference between a trace and a video?",
      "How would you share a trace with a developer?",
    ],
    sources: [
      { label: "Playwright docs: Trace viewer", url: "https://playwright.dev/docs/trace-viewer" },
    ],
  },
  {
    id: "q-pw-008",
    topic,
    roles: ["sdet", "lead"],
    level: "Senior",
    type: "Tooling",
    question: "How do workers, fullyParallel, and sharding differ in Playwright, and how would you use them together?",
    answer:
      "Workers are separate processes on one machine, each with its own browser. By default Playwright runs different files in parallel but tests within a file in order. Setting fullyParallel lets individual tests in the same file spread across workers too. Sharding splits the whole suite across several machines with the shard option, like one of four. In CI I usually combine them: several shards, each using multiple workers, with the blob reporter on each shard and merge-reports to produce one HTML report. All of this only works if tests are independent, so isolation comes first.",
    lookFor: [
      "Workers as processes on one machine",
      "Default file-level parallelism versus fullyParallel",
      "Sharding across machines with --shard",
      "Merging blob reports into one report",
      "Independence as a prerequisite",
    ],
    mistakes: [
      "Thinking sharding happens within one machine",
      "Enabling full parallelism on a suite with shared data",
    ],
    followUps: [
      "How would you balance shards with very uneven test durations?",
      "When would you limit workers on purpose?",
    ],
    sources: [
      { label: "Playwright docs: Parallelism", url: "https://playwright.dev/docs/test-parallel" },
      { label: "Playwright docs: Sharding", url: "https://playwright.dev/docs/test-sharding" },
    ],
  },
  {
    id: "q-pw-009",
    topic,
    roles: ["sdet", "automation"],
    level: "Senior",
    type: "Scenario",
    question: "Your team added toHaveScreenshot checks and they fail randomly between laptops and CI. How do you make visual tests trustworthy?",
    answer:
      "The Playwright docs warn that rendering varies with OS, browser version, hardware, and headless mode, and baseline files are named per browser and platform for that reason. So first I generate and compare baselines in one fixed environment, usually the same Docker image CI uses, never on individual laptops. Then I remove noise in the page: mask dynamic regions like timestamps and avatars, freeze time with the clock API, and make sure fonts are loaded. If small anti-aliasing differences remain, I set a small maxDiffPixels or threshold rather than loosening everything. Finally I keep visual checks for a few high-value screens.",
    lookFor: [
      "Rendering differs across environments",
      "One consistent environment for baselines",
      "Masking and freezing dynamic content",
      "Targeted tolerance settings",
      "Limiting visual checks to high-value screens",
    ],
    mistakes: [
      "Updating snapshots whenever they fail without review",
      "Setting a huge diff tolerance that hides real changes",
    ],
    followUps: [
      "Who reviews and approves snapshot updates?",
      "How do visual tests compare with aria snapshots?",
    ],
    sources: [
      { label: "Playwright docs: Visual comparisons", url: "https://playwright.dev/docs/test-snapshots" },
      { label: "Playwright docs: Clock", url: "https://playwright.dev/docs/clock" },
    ],
  },
  {
    id: "q-pw-010",
    topic,
    roles: ["manual", "automation"],
    level: "Junior",
    type: "Tooling",
    question: "How do you run the same Playwright tests in Chrome, Firefox, Safari's engine, and on a mobile viewport?",
    answer:
      "I define projects in playwright.config. Each project has a name and its own use settings, for example one using the Desktop Chrome device, one Desktop Firefox, one Desktop Safari, which runs on WebKit, and one using a phone preset like Pixel 7. Running npx playwright test runs every project, and the project option on the command line runs just one. Device presets set the viewport, user agent, and touch support together. Projects can also carry different base URLs or retries, so the same mechanism handles staging versus production runs.",
    lookFor: [
      "Projects in the config file",
      "Device presets for browsers and mobile",
      "WebKit as the engine behind Safari testing",
      "Running a single project from the command line",
    ],
    mistakes: [
      "Duplicating spec files per browser",
      "Claiming device emulation equals a real phone",
    ],
    followUps: [
      "What does mobile emulation not cover?",
      "How would you skip a test in one browser only?",
    ],
    sources: [
      { label: "Playwright docs: Projects", url: "https://playwright.dev/docs/test-projects" },
      { label: "Playwright docs: Emulation", url: "https://playwright.dev/docs/emulation" },
    ],
  },
];

export default questions;
