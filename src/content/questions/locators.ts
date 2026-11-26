import type { Question } from '../types';

const topic = "Locators and waits";

const questions: Question[] = [
  {
    id: "q-locator-001",
    topic,
    roles: ["manual", "automation", "sdet"],
    level: "Junior",
    type: "Concept",
    question: "What makes one locator more reliable than another?",
    answer:
      "A reliable locator is tied to something that only changes when the behavior changes. The accessible role and name of a button, its label, or a dedicated test id are good anchors, because a developer changing styling will not touch them. Brittle locators depend on layout or generated values: long CSS paths through nested divs, nth-child positions, or class names produced by a CSS-in-JS build. A good locator should also match exactly one element. When I review a locator I ask, if a designer moved this button into a different panel, would the test still find it?",
    lookFor: [
      "Anchoring on role, label, text, or test id",
      "Avoiding DOM structure and position",
      "Avoiding generated class names or ids",
      "Uniqueness of the match",
    ],
    mistakes: [
      "Copying the full XPath from browser devtools",
      "Choosing the shortest selector regardless of stability",
    ],
    followUps: [
      "How would you locate an element that has no id, label, or test id?",
      "Who should own test ids in the codebase?",
    ],
    sources: [
      { label: "Playwright docs: Best practices, locators", url: "https://playwright.dev/docs/best-practices" },
      { label: "Selenium docs: Tips on working with locators", url: "https://www.selenium.dev/documentation/test_practices/encouraged/locators/" },
    ],
  },
  {
    id: "q-locator-002",
    topic,
    roles: ["automation", "sdet"],
    level: "Mid",
    type: "Tooling",
    question: "Which Playwright locators do you reach for first, and why?",
    answer:
      "I start with getByRole, passing the accessible name, for example getByRole('button', { name: 'Place order' }). It mirrors how a user and assistive technology see the page, so it survives markup refactors, and it fails if the element loses its accessible name, which is a useful accessibility signal. For form fields I use getByLabel, and getByText for non-interactive content. getByTestId is my fallback when there is no meaningful role or text, such as a chart container. CSS and XPath are a last resort because the Playwright docs warn they tie tests to DOM structure.",
    lookFor: [
      "getByRole with an accessible name as the default",
      "getByLabel and getByText for their natural cases",
      "getByTestId as an explicit contract fallback",
      "Awareness that CSS and XPath couple tests to DOM structure",
    ],
    mistakes: [
      "Using getByText on buttons whose copy changes often without considering role",
      "Defaulting to CSS selectors out of habit",
    ],
    followUps: [
      "What happens with getByRole when a page is localized?",
      "How do you find the right role and name for an element?",
    ],
    sources: [
      { label: "Playwright docs: Locators", url: "https://playwright.dev/docs/locators" },
      { label: "Testing Library: Query priority", url: "https://testing-library.com/docs/queries/about/#priority" },
    ],
  },
  {
    id: "q-locator-003",
    topic,
    roles: ["manual", "automation"],
    level: "Junior",
    type: "Concept",
    question: "When would you use XPath instead of a CSS selector?",
    answer:
      "CSS selectors are usually shorter, easier to read, and familiar to front-end developers, so I default to them when I need a raw selector. XPath is useful when I need to match on text content or move up the tree, for example finding a table row by the text in one cell and then going to its parent. CSS cannot select a parent by text in the same way. That said, in Playwright I would solve the same problem with getByRole and filter by hasText. One caution: Playwright locators work inside open shadow DOM, but XPath does not pierce shadow roots.",
    lookFor: [
      "CSS as a readable default",
      "XPath for text matching and walking up the tree",
      "Knowing modern locator APIs often remove the need for XPath",
      "Awareness of XPath and shadow DOM limits",
    ],
    mistakes: [
      "Claiming one is always faster without evidence",
      "Using absolute XPath paths from the root",
    ],
    followUps: [
      "Write a CSS selector for an input whose name attribute is email.",
      "How would you find a row by cell text in Playwright without XPath?",
    ],
    sources: [
      { label: "MDN: CSS selectors", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors" },
      { label: "Selenium docs: Locator strategies", url: "https://www.selenium.dev/documentation/webdriver/elements/locators/" },
      { label: "Playwright docs: Locate in Shadow DOM", url: "https://playwright.dev/docs/locators#locate-in-shadow-dom" },
    ],
  },
  {
    id: "q-locator-004",
    topic,
    roles: ["manual", "automation", "sdet"],
    level: "Mid",
    type: "Concept",
    question: "Why is a fixed sleep a poor way to wait in UI tests, and what do you use instead?",
    answer:
      "A sleep guesses how long the app needs. If the guess is too short, the test fails on a slow CI machine. If it is too long, every run pays the full delay even when the app was ready instantly, and across a suite that adds minutes. Instead I wait for the condition I actually care about. In Selenium that is an explicit wait with a condition like element visible or text present. In Playwright, actions already wait for the element to be actionable, and web-first assertions like toBeVisible retry until they pass or time out.",
    lookFor: [
      "Sleeps are both flaky and slow",
      "Waiting on a specific observable condition",
      "Selenium explicit waits with conditions",
      "Playwright auto-waiting and retrying assertions",
    ],
    mistakes: [
      "Increasing the sleep when the test fails",
      "Replacing sleeps with a huge global timeout",
    ],
    followUps: [
      "What condition would you wait for after submitting a form?",
      "Is there ever a valid reason for a sleep in a test?",
    ],
    sources: [
      { label: "Selenium docs: Waiting strategies", url: "https://www.selenium.dev/documentation/webdriver/waits/" },
      { label: "Playwright docs: Auto-waiting", url: "https://playwright.dev/docs/actionability" },
    ],
  },
  {
    id: "q-locator-005",
    topic,
    roles: ["automation", "sdet"],
    level: "Mid",
    type: "Scenario",
    question: "Playwright finds the Save button but the click times out because a loading overlay covers it. How do you fix the test?",
    answer:
      "Playwright is doing its job: before clicking it checks that the element receives events, and the overlay is intercepting them. I would not pass force: true, because that clicks through a state a real user could not click through, and the test would pass while the user is blocked. Instead I wait for the real precondition, for example expect the overlay to be hidden, or assert the data the overlay was loading has appeared. If the overlay never goes away, that is a product bug worth reporting, and the trace will show which element was on top at click time.",
    lookFor: [
      "Understanding the receives events actionability check",
      "Avoiding force as a workaround",
      "Waiting for the overlay to disappear or the data to load",
      "Using the trace to confirm which element intercepted the click",
    ],
    mistakes: [
      "Adding force: true to make it green",
      "Adding a fixed timeout before the click",
    ],
    followUps: [
      "When is force acceptable?",
      "How would you handle a cookie banner that appears randomly?",
    ],
    sources: [
      { label: "Playwright docs: Auto-waiting, receives events", url: "https://playwright.dev/docs/actionability" },
      { label: "Playwright docs: Trace viewer", url: "https://playwright.dev/docs/trace-viewer" },
    ],
  },
  {
    id: "q-locator-006",
    topic,
    roles: ["automation", "sdet", "lead"],
    level: "Mid",
    type: "Tooling",
    question: "What are the trade-offs of adding data-testid attributes for automation?",
    answer:
      "Test ids create an explicit contract between the app and the tests. They do not change when copy or styling changes, and they make intent obvious in code review. Playwright supports them through getByTestId, and you can configure a different attribute name. The downside is that they say nothing about what the user experiences. A button with a test id but no accessible name still passes, so you lose a free accessibility check. I use role and label locators by default and add test ids for elements with no good user-facing handle, agreeing on a naming convention with developers.",
    lookFor: [
      "Stability as the main benefit",
      "Loss of user-facing and accessibility signal",
      "Using them as a fallback, not the default",
      "Agreeing on conventions with developers",
    ],
    mistakes: [
      "Adding a test id to every element by default",
      "Using test ids that encode position, like row-3-button",
    ],
    followUps: [
      "Should test ids be stripped from production builds?",
      "How would you get developers to add them consistently?",
    ],
    sources: [
      { label: "Playwright docs: Locate by test id", url: "https://playwright.dev/docs/locators#locate-by-test-id" },
      { label: "Testing Library: Query priority", url: "https://testing-library.com/docs/queries/about/#priority" },
    ],
  },
  {
    id: "q-locator-007",
    topic,
    roles: ["automation", "sdet"],
    level: "Senior",
    type: "Scenario",
    question: "A table lists invoices. How would you click Delete for the row containing Invoice 1042, without relying on row position?",
    answer:
      "I narrow by meaning instead of index. In Playwright I would locate the rows with getByRole('row'), filter with hasText set to 'Invoice 1042', then chain getByRole('button', { name: 'Delete' }) inside that row. Because Playwright locators are strict, if two rows match the action fails instead of deleting the wrong invoice, which is the behavior I want. I would also make sure the test created invoice 1042 itself, so its presence is not an accident of shared data. After the click I assert the row has a count of zero rather than checking a toast alone.",
    lookFor: [
      "Filtering rows by text rather than nth index",
      "Chaining a locator inside the matched row",
      "Valuing strictness to prevent acting on the wrong element",
      "Owning the test data and asserting the outcome",
    ],
    mistakes: [
      "Using nth or a row index",
      "Asserting only on a success message",
    ],
    followUps: [
      "How would you do this with Selenium?",
      "What if the table is virtualized and the row is off screen?",
    ],
    sources: [
      { label: "Playwright docs: Filtering locators", url: "https://playwright.dev/docs/locators#filtering-locators" },
      { label: "Playwright docs: Strictness", url: "https://playwright.dev/docs/locators#strictness" },
    ],
  },
  {
    id: "q-locator-008",
    topic,
    roles: ["automation", "sdet"],
    level: "Mid",
    type: "Concept",
    question: "What does it mean that Playwright locators are strict?",
    answer:
      "When you perform an action like click or fill on a locator, Playwright requires it to resolve to exactly one element. If it matches several, the action throws an error listing the matches instead of quietly picking the first. That protects you from clicking the wrong Delete button when the page grows. If you really mean a collection, you use methods built for that, like count, all, or expect toHaveCount. If you deliberately want one of many, first, last, and nth exist, but I treat them as a smell because they depend on order rather than meaning.",
    lookFor: [
      "Exactly one match required for actions",
      "Error instead of silently choosing the first match",
      "Collection methods for multiple elements",
      "Treating first and nth as a last resort",
    ],
    mistakes: [
      "Fixing strictness errors by adding first everywhere",
      "Thinking strictness applies to count or toHaveCount",
    ],
    followUps: [
      "How would you rewrite a locator that matches two Save buttons?",
      "How is this different from Selenium findElement?",
    ],
    sources: [
      { label: "Playwright docs: Strictness", url: "https://playwright.dev/docs/locators#strictness" },
    ],
  },
  {
    id: "q-locator-009",
    topic,
    roles: ["automation", "sdet"],
    level: "Senior",
    type: "Concept",
    question: "Should a test wait for the network to go idle before asserting? What is a better signal?",
    answer:
      "Usually no. Network idle means no requests for a short window, but many apps poll, stream analytics, or keep sockets open, so it either never settles or settles before the UI has rendered the data. The Playwright API docs mark the networkidle option as discouraged and recommend web assertions instead. I wait for what the user would notice: the results heading shows the right count, or the spinner is hidden. When I truly need a specific response, I use waitForResponse with a predicate for that endpoint, started before the action that triggers it, then still assert on the UI.",
    lookFor: [
      "Why network idle is unreliable in modern apps",
      "Playwright guidance that networkidle is discouraged",
      "Asserting on user-visible state",
      "Targeted waitForResponse registered before the trigger",
    ],
    mistakes: [
      "Waiting for networkidle after every navigation",
      "Starting waitForResponse after the click, which can miss the response",
    ],
    followUps: [
      "How would you wait for a download to finish?",
      "How do you handle a page that polls every second?",
    ],
    sources: [
      { label: "Playwright API: page.waitForLoadState", url: "https://playwright.dev/docs/api/class-page#page-wait-for-load-state" },
      { label: "Playwright docs: Network", url: "https://playwright.dev/docs/network" },
    ],
  },
  {
    id: "q-locator-010",
    topic,
    roles: ["automation", "sdet"],
    level: "Mid",
    type: "Tooling",
    question: "How do you locate elements inside iframes and shadow DOM?",
    answer:
      "For iframes, the element lives in a separate document, so a normal page locator cannot see it. In Playwright I use frameLocator or locator.contentFrame to scope into the frame, then locate as usual. In Selenium I switch to the frame, do the work, and switch back to the default content. Shadow DOM is different. Playwright locators pierce open shadow roots by default, so getByRole just works, except XPath, which does not pierce, and closed shadow roots, which are not supported. In Selenium I call getShadowRoot on the host element and search from there.",
    lookFor: [
      "Iframes need explicit scoping or switching",
      "frameLocator in Playwright, switchTo frame in Selenium",
      "Playwright pierces open shadow DOM by default",
      "Exceptions: XPath and closed shadow roots",
    ],
    mistakes: [
      "Forgetting to switch back to default content in Selenium",
      "Assuming XPath works across shadow boundaries",
    ],
    followUps: [
      "How would you test a third-party payment iframe?",
      "What does a closed shadow root mean for testability?",
    ],
    sources: [
      { label: "Playwright docs: Frames", url: "https://playwright.dev/docs/frames" },
      { label: "Playwright docs: Locate in Shadow DOM", url: "https://playwright.dev/docs/locators#locate-in-shadow-dom" },
      { label: "Selenium docs: Frames", url: "https://www.selenium.dev/documentation/webdriver/interactions/frames/" },
      { label: "Selenium docs: Finders, evaluating the Shadow DOM", url: "https://www.selenium.dev/documentation/webdriver/elements/finders/" },
    ],
  },
];

export default questions;
