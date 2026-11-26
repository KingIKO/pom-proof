import type { Question } from '../types';

const topic = "Flaky tests";

const questions: Question[] = [
  {
    id: "q-flaky-001",
    topic,
    roles: ["manual", "automation", "sdet", "lead"],
    level: "Junior",
    type: "Concept",
    question: "What is a flaky test, and why is it a problem even if it usually passes?",
    answer:
      "A flaky test passes and fails against the same code without any change. The danger is trust. Once people see red builds that go green on rerun, they start rerunning by reflex, and eventually a real regression gets dismissed as just flaky. Martin Fowler argues that non-deterministic tests can destroy the value of a whole regression suite for exactly that reason. Google reported in 2016 that about 1.5 percent of their test runs showed a flaky result, and almost 16 percent of their tests had some flakiness. Flakes also waste time on investigation and slow every merge.",
    lookFor: [
      "Definition: different results with the same code",
      "Loss of trust and ignored failures as the main cost",
      "Wasted investigation time and slower merges",
      "Some awareness of how common the problem is",
    ],
    mistakes: [
      "Calling any failing test flaky",
      "Treating flakiness as harmless because a rerun passes",
    ],
    followUps: [
      "How would you tell a flaky test from a real intermittent product bug?",
      "Who should own fixing a flaky test?",
    ],
    sources: [
      { label: "Martin Fowler: Eradicating Non-Determinism in Tests", url: "https://martinfowler.com/articles/nonDeterminism.html" },
      { label: "Google Testing Blog: Flaky Tests at Google", url: "https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html" },
    ],
  },
  {
    id: "q-flaky-002",
    topic,
    roles: ["automation", "sdet"],
    level: "Mid",
    type: "Scenario",
    question: "A Playwright test passes locally every time but fails about one run in ten in CI. Walk me through how you investigate.",
    answer:
      "First I gather evidence rather than guess. I configure the trace to record on the first retry and download it from the failed CI job, so I can step through actions, DOM snapshots, console errors, and network calls at the moment of failure. Then I try to reproduce: run that test with repeat-each set to fifty, with several workers, and with CPU throttled or a CI-like container, since CI machines are slower and run more in parallel. Common findings are a missing wait for data, shared test data between workers, or a timing assumption. I fix the cause, then rerun the repeat to confirm.",
    lookFor: [
      "Collecting traces and artifacts from the failing environment",
      "Reproducing with repeated runs and parallel workers",
      "Considering CI differences like speed and concurrency",
      "Verifying the fix with repeated runs",
    ],
    mistakes: [
      "Adding retries or a sleep without finding the cause",
      "Only rerunning once locally and declaring it fixed",
    ],
    followUps: [
      "What if you cannot reproduce it at all?",
      "What would the trace show for a race between a click and data loading?",
    ],
    sources: [
      { label: "Playwright docs: Trace viewer", url: "https://playwright.dev/docs/trace-viewer" },
      { label: "Playwright docs: Command line, repeat-each", url: "https://playwright.dev/docs/test-cli" },
    ],
  },
  {
    id: "q-flaky-003",
    topic,
    roles: ["manual", "automation", "sdet"],
    level: "Junior",
    type: "Concept",
    question: "What are the most common causes of flaky UI tests?",
    answer:
      "Most flakiness falls into a few groups. Asynchronous timing is the biggest: the test acts or asserts before the app finished loading or animating. Then there is shared state, where tests reuse accounts or data and interfere when run in parallel or in a different order. Time and dates cause failures around midnight, month ends, or time zones. External services, like a third-party sandbox, add their own slowness and outages. Finally, resource limits on CI machines, such as memory or CPU, make everything slower. Fowler's article on non-determinism groups causes in a similar way, which helps me decide where to look first.",
    lookFor: [
      "Asynchronous timing and missing waits",
      "Shared state and order dependence",
      "Time and date sensitivity",
      "External services and environment resources",
    ],
    mistakes: [
      "Blaming the tool or the browser by default",
      "Only naming waits and nothing else",
    ],
    followUps: [
      "Which of these would you check first for a test that fails only in parallel?",
      "How would you make a date-dependent test deterministic?",
    ],
    sources: [
      { label: "Martin Fowler: Eradicating Non-Determinism in Tests", url: "https://martinfowler.com/articles/nonDeterminism.html" },
    ],
  },
  {
    id: "q-flaky-004",
    topic,
    roles: ["lead", "sdet"],
    level: "Senior",
    type: "Scenario",
    question: "A team proposes setting retries to three on every test to stop red builds. What is your position?",
    answer:
      "Retries are a reasonable safety net in CI, but they are a mitigation, not a fix. Playwright helps here because it labels a test that failed first and passed on retry as flaky rather than passed, so we can still see the problem. My policy would be modest retries in CI only, none locally, and a report of every flaky result each week with an owner. A test that keeps flaking goes into quarantine and gets fixed or deleted within an agreed time. I would also watch for real intermittent product bugs, like race conditions, since retries can hide those from users too.",
    lookFor: [
      "Retries as mitigation, not a cure",
      "Using the flaky status to keep visibility",
      "Ownership and time limits for flaky tests",
      "Awareness that retries can hide real product races",
    ],
    mistakes: [
      "Accepting high retries with no tracking",
      "Banning retries entirely without addressing the pain",
    ],
    followUps: [
      "How would you report flaky results to the team?",
      "When would you accept a test that is flaky one time in a thousand?",
    ],
    sources: [
      { label: "Playwright docs: Retries", url: "https://playwright.dev/docs/test-retries" },
      { label: "Google Testing Blog: Flaky Tests at Google", url: "https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html" },
    ],
  },
  {
    id: "q-flaky-005",
    topic,
    roles: ["sdet", "lead"],
    level: "Senior",
    type: "Tooling",
    question: "How would you set up a quarantine process for flaky tests?",
    answer:
      "Quarantine means moving a flaky test out of the blocking pipeline so it stops eroding trust in the healthy tests, while keeping it running somewhere visible. Fowler recommends exactly that, with the warning to fix quarantined tests quickly. Practically, I tag the test, for example with a quarantine tag in the title, and exclude that tag from the merge gate with grep invert, while a separate job still runs it. Each quarantined test gets a ticket, an owner, and a deadline. Google described automating this, quarantining tests whose flakiness passed a threshold and filing a bug. Without the deadline, quarantine quietly becomes deletion.",
    lookFor: [
      "Removing flaky tests from the blocking path",
      "Still running and tracking them separately",
      "Tagging and filtering mechanics",
      "Ticket, owner, and deadline for each test",
    ],
    mistakes: [
      "Commenting out or skipping the test with no record",
      "Letting quarantine grow forever",
    ],
    followUps: [
      "What risk does quarantine introduce?",
      "How do you decide a test should leave quarantine?",
    ],
    sources: [
      { label: "Martin Fowler: Eradicating Non-Determinism in Tests", url: "https://martinfowler.com/articles/nonDeterminism.html" },
      { label: "Google Testing Blog: Flaky Tests at Google", url: "https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html" },
      { label: "Playwright docs: Annotations and tags", url: "https://playwright.dev/docs/test-annotations" },
    ],
  },
  {
    id: "q-flaky-006",
    topic,
    roles: ["automation", "sdet"],
    level: "Mid",
    type: "Tooling",
    question: "A test that checks a subscription renewal date fails on the last day of each month. How do you make it deterministic?",
    answer:
      "The test depends on the real clock, so its result changes with the calendar. I would control time instead of reading it. In Playwright, the clock API lets me install a fake clock or set a fixed time before the page loads, so the app sees, say, January 31 every run. I would also pin the time zone through the timezoneId option, since a date near midnight can land on different days in different zones. Then I would add explicit cases for the edges that broke it, such as month end and leap day, instead of hoping the calendar covers them.",
    lookFor: [
      "Recognizing dependence on the real clock",
      "Controlling time with a fake or fixed clock",
      "Pinning time zone",
      "Adding explicit boundary dates as cases",
    ],
    mistakes: [
      "Skipping the test on certain days",
      "Computing the expected value with the same buggy date logic as the app",
    ],
    followUps: [
      "How would you control time on the server side too?",
      "Which other dates are worth testing explicitly?",
    ],
    sources: [
      { label: "Playwright docs: Clock", url: "https://playwright.dev/docs/clock" },
      { label: "Playwright docs: Emulation, locale and timezone", url: "https://playwright.dev/docs/emulation" },
    ],
  },
  {
    id: "q-flaky-007",
    topic,
    roles: ["automation", "sdet"],
    level: "Mid",
    type: "Scenario",
    question: "A test always passes when run alone but fails when the whole suite runs in parallel. What do you suspect and how do you confirm?",
    answer:
      "I suspect shared state. Playwright already gives each test its own browser context, so the collision is usually on the server: two workers using the same user account, the same cart, or a fixed record name, or a test that changes a global setting. To confirm, I run it with a few other tests at several workers and with repeat-each, and look at which tests touch the same data. The fix is to give each test or each worker its own data, using unique names or a worker-scoped fixture that creates a separate account per worker.",
    lookFor: [
      "Shared server-side state as the leading suspect",
      "Knowing browser contexts already isolate client state",
      "Reproducing with parallel workers",
      "Per-test or per-worker data as the fix",
    ],
    mistakes: [
      "Setting workers to one permanently",
      "Assuming the browser is leaking state between tests",
    ],
    followUps: [
      "How does testInfo.workerIndex help here?",
      "When would serial mode be justified?",
    ],
    sources: [
      { label: "Playwright docs: Parallelism", url: "https://playwright.dev/docs/test-parallel" },
      { label: "Playwright docs: Isolation", url: "https://playwright.dev/docs/browser-contexts" },
    ],
  },
  {
    id: "q-flaky-008",
    topic,
    roles: ["automation", "sdet", "lead"],
    level: "Mid",
    type: "Scenario",
    question: "You believe you fixed a flaky test. How do you prove it?",
    answer:
      "One green run proves almost nothing for a test that failed one time in twenty. I would run it many times under conditions similar to CI, for example repeat-each at a hundred with several workers, and compare against the failure rate before the fix. If the old version failed several times in a hundred runs and the new one fails zero, that is real evidence. I would also explain why the fix works, naming the race or shared state it removes, so it is not a coincidence. After merging I watch the flaky count for that test over the next couple of weeks.",
    lookFor: [
      "Statistical thinking about one green run",
      "Repeated runs under CI-like conditions",
      "Comparing before and after failure rates",
      "Explaining the mechanism and monitoring after merge",
    ],
    mistakes: [
      "Rerunning once or twice and closing the ticket",
      "Not knowing the original failure rate",
    ],
    followUps: [
      "How many runs would convince you, and why?",
      "What would you do if it still fails once in a thousand?",
    ],
    sources: [
      { label: "Playwright docs: Command line, repeat-each", url: "https://playwright.dev/docs/test-cli" },
      { label: "Playwright docs: Retries", url: "https://playwright.dev/docs/test-retries" },
    ],
  },
];

export default questions;
