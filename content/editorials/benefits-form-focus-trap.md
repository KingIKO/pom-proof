---
problem: bug-report/benefits-form-focus-trap
---

File this against the benefits form and its validation summary. The postal code is supposed to be required, so the ticket should say what happens after validation: a keyboard user expects to reach the field, but Tab cycles in the summary. Nothing in the evidence points to the eligibility service.

Start with a fresh test application, leave the postal code empty, submit from the keyboard, and then record the focus path. The screenshot proves the summary appeared. A focus sequence or recording shows the behavior that blocks recovery. Repeat in fresh applications and report how many reproduce. Keep the recorded build and operating system rather than requesting them again.

S2 describes the blocked required task without a supported workaround. P0 describes the deadline. The long title contains useful details but buries the symptom, and treating mouse input as a workaround discounts the users the keyboard path is for.

For a browser regression in Java, send Tab with `new Actions(driver).sendKeys(Keys.TAB).perform()` and record the focused element after each step. See [Selenium keyboard actions](https://www.selenium.dev/documentation/webdriver/actions_api/keyboard/) and [W3C guidance on form error notifications](https://www.w3.org/WAI/tutorials/forms/notifications/).

An interviewer wants a report that describes the failed recovery path and assigns urgency for a reason the release team can act on.
