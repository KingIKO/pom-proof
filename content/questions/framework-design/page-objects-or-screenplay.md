---
title: "The same account actions span five screens. Would you use page objects or Screenplay?"
topic: framework-design
roles: [sdet, senior]
level: senior
type: concept
oneLine: "I start with helpers for each page or control. I consider Screenplay tasks when tests keep repeating the same work across screens."
looksFor:
  - "Say which screen actions belong in a small page or control helper."
  - "Explain how a Screenplay actor combines smaller actions into a task."
  - "Find confirmation steps that renewal and upgrade tests rebuild on screens for different roles."
  - "Compare what new teammates must learn and how they find failures."
trap: "Replacing page helpers that work simply because another pattern has more layers."
followUps:
  - question: "What would you try before switching the whole suite to Screenplay?"
    answer: "I'd pull out one shared control or set of steps. I'd check whether it removes the repetition while keeping the failing step easy to find."
sources:
  - label: Selenium page and component objects
    url: https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/
  - label: Serenity documentation for the Screenplay pattern
    url: https://serenity-js.org/handbook/design/screenplay-pattern/
---

I'd use a page object, code for one screen, for stable pages. I'd use a component object, code for a part of a page, for controls that appear in several places. That gives a new teammate a direct link from the test to the page action. It gets harder to follow when the page code handles several roles. Callers may also repeat the same action across screens.

In Screenplay, an actor is a test user with abilities and tasks. A task combines smaller interactions, such as clicks. I can reuse a task across roles and starting points. That gives teammates more concepts to learn and another place to look when something fails. I'd try it in one busy flow and compare how easy it is to add and debug a test.

### Example

If renewal and plan upgrades both need billing confirmation, I'd share that component first. If several roles keep confirming plans across different screens, I'd try a named actor task to show the shared goal.
