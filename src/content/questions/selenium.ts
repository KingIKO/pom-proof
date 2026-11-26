import type { Question } from '../types';

const topic = "Selenium";

const questions: Question[] = [
  {
    id: "q-sel-001",
    topic,
    roles: ["manual", "automation", "sdet"],
    level: "Junior",
    type: "Concept",
    question: "What is the difference between implicit and explicit waits in Selenium, and can you use both?",
    answer:
      "An implicit wait is a session-wide setting. Every findElement call keeps looking for up to that duration before throwing, and the default is zero. An explicit wait, like WebDriverWait, polls for one specific condition at one point in the code, such as an element becoming visible or clickable, and fails with a timeout if it never happens. I prefer explicit waits because they say exactly what the test is waiting for. The Selenium docs warn not to mix the two, because combined they can produce unpredictable wait times, for example a timeout after twenty seconds when you expected fifteen.",
    lookFor: [
      "Implicit wait is global and applies to element lookup",
      "Explicit wait targets a specific condition",
      "Default implicit wait of zero",
      "The documented warning against mixing them",
    ],
    mistakes: [
      "Setting a large implicit wait and also using explicit waits",
      "Thinking implicit waits handle visibility or clickability",
    ],
    followUps: [
      "What is a FluentWait and when would you configure it?",
      "How would you wait for an element to disappear?",
    ],
    sources: [
      { label: "Selenium docs: Waiting strategies", url: "https://www.selenium.dev/documentation/webdriver/waits/" },
    ],
  },
  {
    id: "q-sel-002",
    topic,
    roles: ["automation", "sdet"],
    level: "Mid",
    type: "Scenario",
    question: "Your Selenium test throws StaleElementReferenceException after filtering a results list. What is happening and how do you fix it?",
    answer:
      "The WebElement I am holding points to a node that is no longer in the DOM. Filtering made the app re-render the list, so the old reference is stale even though an element that looks identical is now on screen. The fix is to look the element up again after the change, rather than storing elements long term. In page objects I keep the By locator and find the element at the moment I act on it. I also wait for a signal that the re-render finished, like the result count changing, so I do not grab the old list just before it is replaced.",
    lookFor: [
      "Reference to a node that was removed or replaced",
      "Re-rendering as the trigger",
      "Re-locating elements instead of caching them",
      "Waiting for the update to complete before re-finding",
    ],
    mistakes: [
      "Wrapping every call in a catch-and-retry loop",
      "Adding a sleep after filtering",
    ],
    followUps: [
      "Why does PageFactory make this more likely?",
      "How does Playwright avoid this class of error?",
    ],
    sources: [
      { label: "Selenium docs: Understanding common errors", url: "https://www.selenium.dev/documentation/webdriver/troubleshooting/errors/" },
    ],
  },
  {
    id: "q-sel-003",
    topic,
    roles: ["automation", "sdet"],
    level: "Mid",
    type: "Concept",
    question: "Describe how a Selenium command travels from your test code to the browser.",
    answer:
      "My test calls a method in a language binding, such as the Java or Python client. The binding turns it into an HTTP request defined by the W3C WebDriver specification and sends it to a driver executable, such as chromedriver or geckodriver. The driver translates that into the browser's own automation interface and returns the result. With a Grid, the request goes to the Grid first, which routes it to a node running the browser. Since version 4.6, Selenium Manager ships with Selenium and can find or download a matching driver when none is configured, which removes most version mismatch errors.",
    lookFor: [
      "Language binding to driver to browser",
      "W3C WebDriver protocol over HTTP",
      "Browser-specific driver executables",
      "Where Grid fits",
      "Selenium Manager for driver management",
    ],
    mistakes: [
      "Saying Selenium injects JavaScript to drive the browser in modern versions",
      "Not knowing what a driver executable is",
    ],
    followUps: [
      "What does WebDriver BiDi add to this model?",
      "What causes a session not created error?",
    ],
    sources: [
      { label: "Selenium docs: Components", url: "https://www.selenium.dev/documentation/overview/components/" },
      { label: "W3C WebDriver specification", url: "https://www.w3.org/TR/webdriver2/" },
      { label: "Selenium docs: Selenium Manager", url: "https://www.selenium.dev/documentation/selenium_manager/" },
    ],
  },
  {
    id: "q-sel-004",
    topic,
    roles: ["sdet", "lead"],
    level: "Senior",
    type: "Tooling",
    question: "When is Selenium Grid worth running, and what are its main parts?",
    answer:
      "Grid makes sense when you need to run in parallel across many machines, or across browser, version, and operating system combinations that one machine cannot provide. For a small suite on one browser, local parallel runs are simpler. Grid 4 is built from components: a router as the entry point, a new session queue, a distributor that matches session requests to capacity, a session map tracking where each session lives, nodes that host the browsers, and an event bus connecting them. You can run it all as one standalone process or split components out for scale. I would also compare the operational cost against a hosted cloud provider.",
    lookFor: [
      "Parallelism and browser matrix as the reasons",
      "Not over-engineering for small suites",
      "Router, distributor, session map, queue, node, event bus",
      "Standalone versus distributed deployment",
      "Considering operating cost",
    ],
    mistakes: [
      "Describing only the old hub and node model",
      "Assuming Grid fixes slow or flaky tests by itself",
    ],
    followUps: [
      "How would you run Grid in containers?",
      "How do you debug a session that failed on a remote node?",
    ],
    sources: [
      { label: "Selenium docs: When to use Grid", url: "https://www.selenium.dev/documentation/grid/applicability/" },
      { label: "Selenium docs: Grid components", url: "https://www.selenium.dev/documentation/grid/components/" },
    ],
  },
  {
    id: "q-sel-005",
    topic,
    roles: ["automation", "sdet"],
    level: "Mid",
    type: "Tooling",
    question: "How do you structure page objects in a Selenium project, and what do you think of PageFactory?",
    answer:
      "Each page object holds By locators and methods for what a user does on that page, and methods that navigate return the next page object, which makes flows readable. Following the Selenium docs, the only check inside a page object is that the page loaded; real assertions stay in tests. For repeated widgets like a header or date picker, I use smaller component objects. The Selenium docs now list PageFactory under legacy. I avoid it because it hides lookups behind annotated fields, which can surprise you with stale elements after re-renders, and it makes waits harder to see. Plain methods that find elements when called are clearer.",
    lookFor: [
      "Locators plus user-intent methods",
      "Navigation methods returning the next page object",
      "Assertions in tests, page loaded check excepted",
      "Component objects for shared widgets",
      "Informed view of PageFactory",
    ],
    mistakes: [
      "Base page classes with dozens of unrelated helpers",
      "Exposing raw WebElements to tests everywhere",
    ],
    followUps: [
      "How would you handle a page that loads in several stages?",
      "Where do waits belong in this structure?",
    ],
    sources: [
      { label: "Selenium docs: Page object models", url: "https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/" },
      { label: "Selenium docs (legacy): PageFactory", url: "https://www.selenium.dev/documentation/legacy/selenium_2/page_factory/" },
    ],
  },
  {
    id: "q-sel-006",
    topic,
    roles: ["sdet", "lead"],
    level: "Senior",
    type: "Scenario",
    question: "Leadership wants to migrate a large Selenium suite to Playwright. How do you decide and, if you go ahead, plan it?",
    answer:
      "I start with the problem the migration is meant to solve. If the pain is flakiness from hand-written waits and slow debugging, Playwright's auto-waiting, tracing, and built-in runner can help. If the pain is bad test design, a new tool will just copy the problems. I would port a representative slice, ten or so of the flakiest tests, and compare stability, runtime, and authoring effort over a couple of weeks. If it pays off, I migrate by feature area, writing new tests in Playwright immediately, and retire each Selenium area only when its replacement is green in CI. No big-bang rewrite.",
    lookFor: [
      "Tying the decision to a measured problem",
      "Recognizing tools do not fix poor design",
      "Time-boxed pilot on representative tests",
      "Incremental migration by area",
      "Clear retirement criteria for old tests",
    ],
    mistakes: [
      "Freezing all testing for a full rewrite",
      "Translating Selenium code line by line, including old sleeps",
    ],
    followUps: [
      "Which tests would you port first and why?",
      "How do you run both suites in CI during the transition?",
    ],
    sources: [
      { label: "Playwright docs: Auto-waiting", url: "https://playwright.dev/docs/actionability" },
      { label: "Playwright docs: Trace viewer", url: "https://playwright.dev/docs/trace-viewer" },
      { label: "Selenium docs: Waiting strategies", url: "https://www.selenium.dev/documentation/webdriver/waits/" },
    ],
  },
  {
    id: "q-sel-007",
    topic,
    roles: ["automation", "sdet"],
    level: "Mid",
    type: "Tooling",
    question: "What did Selenium 4 change that matters for everyday test code?",
    answer:
      "The biggest change underneath is that Selenium 4 uses the W3C WebDriver standard as its protocol, which made behavior more consistent across browsers. For daily code, relative locators let you find an element above, below, to the left or right of, or near another element, which helps with forms that lack good attributes. You can open a new tab or window directly. Selenium Manager handles drivers for you. And WebDriver BiDi support is growing, which enables things like listening to console logs and network events. I would still prefer a stable id or label over a relative locator when one exists.",
    lookFor: [
      "W3C WebDriver as the protocol",
      "Relative locators and their limits",
      "New window or tab support",
      "Selenium Manager",
      "Awareness of BiDi features",
    ],
    mistakes: [
      "Relying on relative locators as the default strategy",
      "Still using DesiredCapabilities patterns everywhere",
    ],
    followUps: [
      "How do relative locators decide what counts as above?",
      "What would you use BiDi for in a test suite?",
    ],
    sources: [
      { label: "Selenium docs: Relative locators", url: "https://www.selenium.dev/documentation/webdriver/elements/locators/" },
      { label: "Selenium docs: Upgrade to Selenium 4", url: "https://www.selenium.dev/documentation/webdriver/troubleshooting/upgrade_to_selenium_4/" },
      { label: "Selenium docs: WebDriver BiDi", url: "https://www.selenium.dev/documentation/webdriver/bidi/" },
    ],
  },
  {
    id: "q-sel-008",
    topic,
    roles: ["manual", "automation"],
    level: "Junior",
    type: "Tooling",
    question: "How do you handle a dropdown, a JavaScript alert, and an iframe in Selenium?",
    answer:
      "For a native select element, I wrap it in the Select support class and choose an option by visible text, value, or index; visible text reads best. For a JavaScript alert, I wait until the alert is present, switch to it, read its text if needed, then accept or dismiss it. For an iframe, I switch into the frame by element, name, or index, interact, then switch back to the default content. Custom dropdowns built from divs are not select elements, so there I click to open the list and then click the option like any other element.",
    lookFor: [
      "Select class for native select elements",
      "Waiting for and switching to alerts",
      "Switching into frames and back out",
      "Knowing custom dropdowns need normal clicks",
    ],
    mistakes: [
      "Using Select on a div-based dropdown",
      "Forgetting to switch back from the frame",
    ],
    followUps: [
      "How would you handle a new browser tab opened by a link?",
      "How would you verify the options a dropdown offers?",
    ],
    sources: [
      { label: "Selenium docs: Select lists", url: "https://www.selenium.dev/documentation/webdriver/support_features/select_lists/" },
      { label: "Selenium docs: Alerts", url: "https://www.selenium.dev/documentation/webdriver/interactions/alerts/" },
      { label: "Selenium docs: Frames", url: "https://www.selenium.dev/documentation/webdriver/interactions/frames/" },
    ],
  },
];

export default questions;
