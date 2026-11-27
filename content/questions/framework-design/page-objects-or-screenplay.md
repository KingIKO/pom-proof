---
title: The same account actions span five screens. Would you keep page objects or use Screenplay?
topic: framework-design
roles: [sdet, senior]
level: senior
type: concept
oneLine: Start with page and component objects, then consider actor tasks when concrete cross-screen duplication earns another layer.
looksFor:
  - Explains what a small page or component object owns.
  - Describes how actors compose tasks from interactions.
  - Spots renewal and upgrade tests rebuilding the same confirmation steps across role-specific screens.
  - Weighs onboarding and debugging cost before changing the suite.
trap: Replacing a working set of page objects because another pattern has more abstractions.
followUps:
  - question: What would you try before adopting Screenplay across the suite?
    answer: I'd extract one shared component or flow and see if it removes the repetition while preserving clear failure locations.
sources:
  - label: Selenium page and component objects
    url: https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/
  - label: Serenity documentation for the Screenplay pattern
    url: https://serenity-js.org/handbook/design/screenplay-pattern/
---

I'd start with page objects for stable screens and component objects for controls that appear in several places. They give a new teammate a direct path from a test to the page action. They start to strain when a page class knows about several roles or callers keep rebuilding the same action across screens.

In Screenplay, an actor has abilities and performs tasks made from smaller interactions. That can make repeated business actions reusable across roles and entry points. It adds concepts that teammates must learn and another level to inspect when something fails. I'd try it on one busy flow and compare how easily someone can add and debug a case.

### Example

If renewal and plan upgrades both need the same billing confirmation, I'd try sharing that component first. If multiple roles repeatedly confirm plans across different screens, a named actor task might describe the shared intent better.
