---
title: How do explicit and implicit waits differ in Selenium?
topic: locators-waits
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Keep element lookup time separate from the explicit wait for a specific page state.
looksFor:
  - Implicit wait applies to element lookup
  - Explicit wait polls a condition with a timeout
  - Nested lookup can stretch observed timeouts
  - A condition tied to the user's next step
trap: Combining both wait types and adding a sleep when the combined timing looks unpredictable.
followUps:
  - question: What would you wait for after submitting a form?
    answer: I'd wait for its real result, such as the confirmation for the submitted record, rather than assume finding the Submit button proves success.
sources:
  - label: Selenium waits
    url: https://www.selenium.dev/documentation/webdriver/waits/
---

An implicit wait applies to element searches for the session. An explicit wait polls a condition until it's true or the timeout expires. A lookup inside that condition can itself use the implicit wait, so a poll can take longer than expected and the apparent timeout can be surprising. I avoid mixing them; where the suite uses explicit waits I leave the implicit wait at zero.

I choose a condition that describes why the next step is valid. Presence alone is weak if the element is still hidden, and finding a container may tell me nothing about whether its data finished loading. If the condition times out, I want the report to name the state I expected.

### Example

After filtering a Selenium Java results page, I'd use `WebDriverWait` for the row containing the order number I searched for. The table already existed before I typed; its presence tells me very little.
