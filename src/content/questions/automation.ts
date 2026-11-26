import type { Question } from '../types';

const topic = "Automation strategy and frameworks";

const questions: Question[] = [
  {
    id: "q-auto-001",
    topic,
    roles: ["manual", "automation", "sdet"],
    level: "Junior",
    type: "Concept",
    question: "How do you decide whether a test case is worth automating?",
    answer:
      "I look at how often the check runs and how stable the feature is. A login or checkout check that runs on every merge pays back quickly, while a screen that is being redesigned next sprint does not. I also ask whether the result is objective. If a machine can decide pass or fail from data, it is a good candidate. If it depends on judgment, like whether a layout feels cluttered, I keep it exploratory. Finally I weigh the cost to build and maintain it against the risk it covers, and I pick the lowest layer that can catch the bug.",
    lookFor: [
      "Frequency of execution as a driver of payback",
      "Feature stability and expected churn",
      "Objective, deterministic pass or fail criteria",
      "Maintenance cost weighed against risk covered",
      "Choosing the cheapest layer that can catch the defect",
    ],
    mistakes: [
      "Saying everything should be automated",
      "Ignoring maintenance cost after the first version",
    ],
    followUps: [
      "Give an example of a test you chose not to automate.",
      "How would you revisit that decision later?",
    ],
    sources: [
      { label: "Martin Fowler: The Practical Test Pyramid", url: "https://martinfowler.com/articles/practical-test-pyramid.html" },
      { label: "Selenium docs: Overview of test automation", url: "https://www.selenium.dev/documentation/test_practices/overview/" },
    ],
  },
  {
    id: "q-auto-002",
    topic,
    roles: ["automation", "sdet", "lead"],
    level: "Mid",
    type: "Concept",
    question: "Explain the test pyramid and how you apply it on a real project.",
    answer:
      "The pyramid says to have many fast, isolated tests at the bottom, fewer integration or service tests in the middle, and a small number of end-to-end UI tests at the top. The reason is cost and feedback speed: UI tests are slow, need a full environment, and break for reasons unrelated to the change. In practice I push each rule down to the lowest layer that can prove it. Validation logic gets unit tests, API contracts get service tests, and the UI layer keeps a handful of critical journeys like sign up and checkout. The exact shape matters less than avoiding an ice cream cone of UI tests.",
    lookFor: [
      "Layers named with relative quantities",
      "Rationale based on speed, cost, and isolation",
      "Pushing checks to the lowest layer that can catch the bug",
      "Keeping a small set of critical end-to-end journeys",
    ],
    mistakes: [
      "Treating the pyramid as a fixed ratio to hit",
      "Duplicating the same check at every layer",
    ],
    followUps: [
      "Where do contract tests fit?",
      "What would you do with a suite that is 80 percent UI tests?",
    ],
    sources: [
      { label: "Martin Fowler: Test Pyramid", url: "https://martinfowler.com/bliki/TestPyramid.html" },
      { label: "Martin Fowler: The Practical Test Pyramid", url: "https://martinfowler.com/articles/practical-test-pyramid.html" },
    ],
  },
  {
    id: "q-auto-003",
    topic,
    roles: ["automation", "sdet"],
    level: "Mid",
    type: "Tooling",
    question: "What belongs in a page object, and should page objects contain assertions?",
    answer:
      "A page object wraps the locators and the actions a user can take on one page or component, so tests read like intent: fill in the shipping form, place the order. When the markup changes, I fix one class instead of forty tests. The Selenium docs say page objects should not make assertions about the behavior under test, apart from checking that the page loaded. I follow that, because it keeps the verification visible in the test. In Playwright I expose locators as readonly properties, so a test can still call expect on them with web-first assertions.",
    lookFor: [
      "Encapsulating locators and user actions",
      "Single place to change when markup changes",
      "Assertions kept in tests, with the page loaded check as the exception",
      "Methods named by user intent rather than by clicks",
    ],
    mistakes: [
      "One giant page object for the whole app",
      "Hiding expect calls inside action methods",
    ],
    followUps: [
      "How do you model a component that appears on many pages?",
      "When do page objects become a burden?",
    ],
    sources: [
      { label: "Selenium docs: Page object models", url: "https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/" },
      { label: "Playwright docs: Page object models", url: "https://playwright.dev/docs/pom" },
    ],
  },
  {
    id: "q-auto-004",
    topic,
    roles: ["lead", "sdet"],
    level: "Senior",
    type: "Scenario",
    question: "You inherit a UI suite of 2,000 tests that takes three hours and fails on about one run in ten. What do you do in your first month?",
    answer:
      "First I measure. I pull a few weeks of results and rank tests by failure rate, duration, and the last time each caught a real bug. Flaky tests go into a quarantine job so the main pipeline becomes trustworthy again, with a ticket and owner for each. Then I look for duplication: many UI tests usually check rules that an API or unit test could cover in milliseconds, so I move or delete those. In parallel I enable sharding to cut wall clock time. By the end of the month I want a fast, green merge gate and a shared dashboard of flake rate.",
    lookFor: [
      "Measuring before changing anything",
      "Quarantine with owners instead of silent deletion",
      "Pushing checks down to faster layers",
      "Parallelism or sharding for wall clock time",
      "A visible metric the team can track",
    ],
    mistakes: [
      "Rewriting the whole suite in a new tool on day one",
      "Turning on retries and calling it fixed",
    ],
    followUps: [
      "How do you get developers to own the quarantined tests?",
      "What would make you delete a test outright?",
    ],
    sources: [
      { label: "Martin Fowler: Eradicating Non-Determinism in Tests", url: "https://martinfowler.com/articles/nonDeterminism.html" },
      { label: "Playwright docs: Sharding", url: "https://playwright.dev/docs/test-sharding" },
    ],
  },
  {
    id: "q-auto-005",
    topic,
    roles: ["sdet", "lead"],
    level: "Senior",
    type: "Tooling",
    question: "How would you choose a UI automation framework for a new web product?",
    answer:
      "I start from constraints, not preferences. Which browsers must we support, which language does the team already write, and does the app use multiple tabs, iframes, or several origins? Playwright supports TypeScript, Python, Java, and .NET, runs Chromium, Firefox, and WebKit, and its test runner includes auto-waiting, tracing, and parallelism. Selenium implements the W3C WebDriver standard, has bindings in many languages, and a Grid for large browser matrices. I would build the same two or three critical flows in the top candidates, run them in CI for a week, and compare stability, speed, and how easily the team debugged failures.",
    lookFor: [
      "Constraints first: browsers, language, app architecture",
      "Accurate capabilities of the candidates",
      "A time-boxed proof of concept on real flows",
      "Debuggability and team skills as criteria",
    ],
    mistakes: [
      "Choosing based on popularity alone",
      "Ignoring the skills of the people who will maintain it",
    ],
    followUps: [
      "What would make you pick Selenium over Playwright?",
      "How do you get buy-in from developers?",
    ],
    sources: [
      { label: "Playwright docs: Supported languages", url: "https://playwright.dev/docs/languages" },
      { label: "Playwright docs: Browsers", url: "https://playwright.dev/docs/browsers" },
      { label: "W3C WebDriver specification", url: "https://www.w3.org/TR/webdriver2/" },
    ],
  },
  {
    id: "q-auto-006",
    topic,
    roles: ["automation", "sdet"],
    level: "Mid",
    type: "Concept",
    question: "How do you manage test data for an automated end-to-end suite?",
    answer:
      "Each test creates the data it needs, ideally through an API or a seeding script rather than by clicking through the UI, which the Selenium docs also recommend for generating application state. I give records unique values, like an email with a random suffix, so parallel tests never collide. Tests should not depend on rows that another test left behind. For cleanup I prefer deleting what the test created, or resetting a disposable environment, over a shared nightly wipe. Secrets and real customer data stay out of the repository entirely.",
    lookFor: [
      "Per-test data creation through APIs or seeds",
      "Unique values to support parallel runs",
      "No reliance on data from other tests",
      "A clear cleanup strategy",
      "No real customer data or secrets in code",
    ],
    mistakes: [
      "One shared admin account mutated by every test",
      "Creating setup data through slow UI steps",
    ],
    followUps: [
      "What do you do when there is no API to create the data?",
      "How do you handle data that takes minutes to provision?",
    ],
    sources: [
      { label: "Selenium docs: Generating application state", url: "https://www.selenium.dev/documentation/test_practices/encouraged/generating_application_state/" },
      { label: "Playwright docs: Best practices", url: "https://playwright.dev/docs/best-practices" },
    ],
  },
  {
    id: "q-auto-007",
    topic,
    roles: ["automation", "sdet", "lead"],
    level: "Mid",
    type: "Scenario",
    question: "How would you wire automated tests into CI so developers get fast, useful feedback?",
    answer:
      "I split the suite by purpose. Every pull request runs unit tests, API tests, and a small UI smoke set, and the goal is results in roughly ten minutes. The full regression runs on merge to main or on a schedule, sharded across machines. Failures must be easy to act on, so CI uploads the HTML report, traces, and screenshots as artifacts. In Playwright, recording a trace on the first retry gives a full timeline without paying the cost on every run. I also track duration and failure rate per test, so slow or flaky tests show up before people start ignoring red builds.",
    lookFor: [
      "Tiered suites: pull request gate versus full regression",
      "Sharding or parallelism to control time",
      "Artifacts like traces and reports for debugging",
      "Monitoring duration and flake rate over time",
    ],
    mistakes: [
      "Running every test on every commit regardless of time",
      "Failures with no artifacts, forcing local reproduction",
    ],
    followUps: [
      "How do you pick which tests go into the smoke set?",
      "What do you do when the pipeline exceeds its time budget?",
    ],
    sources: [
      { label: "Playwright docs: Continuous integration", url: "https://playwright.dev/docs/ci" },
      { label: "Playwright docs: Trace viewer", url: "https://playwright.dev/docs/trace-viewer" },
    ],
  },
  {
    id: "q-auto-008",
    topic,
    roles: ["sdet", "lead"],
    level: "Senior",
    type: "Concept",
    question: "In a microservices system, when would you use contract tests instead of end-to-end tests?",
    answer:
      "End-to-end tests across many services are slow, need every service deployed together, and fail for reasons far from the change. Consumer-driven contract testing, which is the approach Pact uses, lets each consumer record the requests it makes and the responses it relies on. The provider then verifies those contracts in its own pipeline. That catches breaking API changes before deployment and points to the exact interaction that broke. I still keep a few end-to-end journeys to prove the system is wired together, but I stop using them as the main way to catch integration bugs between teams.",
    lookFor: [
      "Costs of cross-service end-to-end tests",
      "Consumer-driven contracts verified by the provider",
      "Earlier and more precise failure signal",
      "Keeping a thin end-to-end layer for wiring",
    ],
    mistakes: [
      "Confusing contract tests with schema validation only",
      "Claiming contract tests replace all end-to-end coverage",
    ],
    followUps: [
      "Who owns a contract when it breaks?",
      "How do contract tests fit into deployment gating?",
    ],
    sources: [
      { label: "Pact documentation: Introduction", url: "https://docs.pact.io/" },
      { label: "Martin Fowler: Contract Test", url: "https://martinfowler.com/bliki/ContractTest.html" },
    ],
  },
  {
    id: "q-auto-009",
    topic,
    roles: ["automation", "sdet"],
    level: "Mid",
    type: "Concept",
    question: "Why should automated tests be independent of each other, and how do you enforce it?",
    answer:
      "If test B relies on state left by test A, then B fails whenever A fails, is skipped, or runs later, and you cannot run tests in parallel or rerun one alone. That hides the real failure and wastes time. I enforce independence in a few ways. Each test gets a fresh browser context, so cookies and storage are not shared. Setup happens in hooks or fixtures rather than in an earlier test. I run the suite in random order or fully parallel in CI, which quickly exposes hidden ordering dependencies.",
    lookFor: [
      "Cascading failures and blocked parallelism as the cost",
      "Fresh context or session per test",
      "Setup in hooks or fixtures, not in earlier tests",
      "Running in parallel or shuffled order to expose coupling",
    ],
    mistakes: [
      "Chaining tests as steps of one long journey",
      "Relying on file order to make tests pass",
    ],
    followUps: [
      "When is a serial group acceptable?",
      "How do you detect an order dependency you suspect exists?",
    ],
    sources: [
      { label: "Selenium docs: Test independency", url: "https://www.selenium.dev/documentation/test_practices/encouraged/test_independency/" },
      { label: "Playwright docs: Isolation", url: "https://playwright.dev/docs/browser-contexts" },
    ],
  },
  {
    id: "q-auto-010",
    topic,
    roles: ["lead", "manual"],
    level: "Senior",
    type: "Scenario",
    question: "A product manager asks for 100 percent test automation. How do you respond?",
    answer:
      "I would ask what problem they want solved. Usually it is fear of regressions or slow releases, and coverage is a proxy. Then I explain that some testing is exploratory by nature: usability, new features still changing, and odd real-world combinations. Automating those is expensive and still misses what a curious person would find. I would offer a concrete plan instead: automate the critical revenue and compliance paths at the right layers, report escaped defects and release lead time, and keep a budget of exploratory sessions each sprint. That answers the real worry with numbers they can track.",
    lookFor: [
      "Uncovering the underlying goal behind the request",
      "Explaining limits of automation without being dismissive",
      "Risk-based scope for automation",
      "Outcome metrics like escaped defects or lead time",
    ],
    mistakes: [
      "Agreeing without discussing cost",
      "Refusing flatly without an alternative",
    ],
    followUps: [
      "How would you report progress to that manager?",
      "What would change your answer?",
    ],
    sources: [
      { label: "Martin Fowler: Test Coverage", url: "https://martinfowler.com/bliki/TestCoverage.html" },
      { label: "Martin Fowler: The Practical Test Pyramid", url: "https://martinfowler.com/articles/practical-test-pyramid.html" },
    ],
  },
  {
    id: "q-auto-011",
    topic,
    roles: ["automation", "sdet"],
    level: "Mid",
    type: "Tooling",
    question: "When would you test through the API instead of the UI, and how do you combine the two in Playwright?",
    answer:
      "If the rule lives on the server, like a discount calculation or a permission check, I test it through the API. It is faster and the failure message is precise. In Playwright the request fixture gives me an API client in the same test runner, sharing config like baseURL. A common pattern is to use the API for setup, such as creating a user and an order, then drive only the UI step that matters, and finally confirm the result through the API again. That keeps the UI test short and focused on what the user actually sees.",
    lookFor: [
      "Testing server rules at the API layer",
      "Using the request fixture or APIRequestContext",
      "API for setup and verification, UI for the user step",
      "Shorter, more focused UI tests",
    ],
    mistakes: [
      "Testing every validation rule through the browser",
      "Treating API and UI suites as separate worlds with duplicated helpers",
    ],
    followUps: [
      "How do you share authentication between API and browser calls?",
      "What does the API test not prove?",
    ],
    sources: [
      { label: "Playwright docs: API testing", url: "https://playwright.dev/docs/api-testing" },
    ],
  },
  {
    id: "q-auto-012",
    topic,
    roles: ["lead", "sdet"],
    level: "Senior",
    type: "Concept",
    question: "How do you measure whether a test automation effort is actually paying off?",
    answer:
      "Test counts and code coverage alone are weak signals. Coverage is useful for finding code that nothing exercises, but as a target it encourages tests that run lines without checking anything. I track outcomes instead. How long does a developer wait for a trustworthy result? What is the flake rate, and how many red builds were false alarms? How many defects escaped to production, and would an existing test layer have caught them? I also watch maintenance time per sprint. If the suite is fast, trusted, and catching regressions before release, it is paying off.",
    lookFor: [
      "Skepticism of raw counts and coverage targets",
      "Feedback time and flake rate",
      "Escaped defects mapped to test layers",
      "Maintenance cost as an explicit metric",
    ],
    mistakes: [
      "Reporting number of test cases as success",
      "Ignoring the cost of false alarms",
    ],
    followUps: [
      "How would you present these metrics to leadership?",
      "Which metric would you look at first in a new team?",
    ],
    sources: [
      { label: "Martin Fowler: Test Coverage", url: "https://martinfowler.com/bliki/TestCoverage.html" },
      { label: "Google Testing Blog: Flaky Tests at Google", url: "https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html" },
    ],
  },
  {
    id: "q-auto-013",
    topic,
    roles: ["automation", "sdet"],
    level: "Mid",
    type: "Concept",
    question: "Your checkout test calls a real third-party payment sandbox and fails whenever the sandbox is slow. What do you change?",
    answer:
      "I separate what we own from what we do not. Most checkout tests should mock the payment provider at the network boundary, so they can cover success, decline, and timeout responses on demand. Both the Selenium and Playwright docs advise against depending on external services you do not control. In Playwright I would use page.route to fulfill the provider call with a canned response. Then I keep one or two tests that hit the real sandbox, run them on a schedule rather than on every pull request, and alert on failure separately so sandbox outages do not block merges.",
    lookFor: [
      "Mocking at the network boundary for most tests",
      "Covering error paths that are hard to trigger for real",
      "A small, separate set of real integration checks",
      "Not letting third-party outages block the team",
    ],
    mistakes: [
      "Adding longer timeouts and moving on",
      "Mocking everything with no real integration check at all",
    ],
    followUps: [
      "How do you keep mocks in sync with the real provider?",
      "Which failures would you only catch with the real sandbox?",
    ],
    sources: [
      { label: "Selenium docs: Mock external services", url: "https://www.selenium.dev/documentation/test_practices/encouraged/mock_external_services/" },
      { label: "Playwright docs: Mock APIs", url: "https://playwright.dev/docs/mock" },
    ],
  },
  {
    id: "q-auto-014",
    topic,
    roles: ["automation", "manual"],
    level: "Junior",
    type: "Tooling",
    question: "How would you run the same test against several sets of input data without copying the test?",
    answer:
      "I would parameterize it. In Playwright Test you can loop over an array of cases and call test once per case, giving each a unique title that includes the input, so the report shows exactly which case failed. For example, one array might hold valid, too short, and missing password values with the expected error message for each. The data can live in the spec file or in a JSON file if testers outside the code want to add rows. The key is that each case stays a separate test, so one failure does not hide the others.",
    lookFor: [
      "Generating one test per data row",
      "Unique titles that identify the failing case",
      "Expected result stored alongside each input",
      "Each case reported independently",
    ],
    mistakes: [
      "Looping inside a single test so the first failure stops the rest",
      "Duplicate test titles that make reports confusing",
    ],
    followUps: [
      "How would you parameterize across projects or environments instead?",
      "When does data-driven testing become hard to read?",
    ],
    sources: [
      { label: "Playwright docs: Parameterize tests", url: "https://playwright.dev/docs/test-parameterize" },
    ],
  },
];

export default questions;
