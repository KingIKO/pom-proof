---
problem: scenario/accessible-form-deadline
---

## What is going on

The validation summary changed on the only form people can submit. The summary lists problems with the submitted values. The error can appear in the markup even when a keyboard and screen reader user cannot find the invalid field. That person also needs a way to correct it.

## The answer

1. Confirm how field recovery should work with the supported screen reader and browser pairing.

   **Why:** The browser and screen reader pairing tells you where to check what the screen reader says. The expected recovery behavior tells you where focus should go. It also tells you what the user should hear to find the field.

2. Split testing time between full keyboard recovery and screen reader recovery.

   **Why:** The six-minute keyboard run catches an unreachable field. The nine-minute screen reader run checks whether someone can find the error from what they hear and correct it. A field can pass the keyboard check and still fail the screen reader check.

3. Listen to the actual announcement in a manual exploratory test.

   **Why:** A markup check tells you which text the page contains. Only listening tells you what the supported screen reader actually says.

4. Add an automated UI test that checks keyboard focus.

   **Why:** A focus-order regression is a change that breaks the working order of keyboard focus. An enabled input can still be out of reach with Tab. For example, a Playwright TypeScript test can press Tab with `page.keyboard.press('Tab')` and check where focus lands.

5. If the invalid submission traps focus in the summary, stop the release.

   **Why:** Affected people cannot reach the field to correct the form. This release has no other way to submit.

6. Test the keyboard path from one known invalid value through observing focus and speech, correcting the field, and checking the resubmission confirmation.

   **Why:** Checking focus and the announcement before making a correction shows whether a user can discover the error without already knowing the test data. A successful keyboard resubmission then shows the user can reach and correct the field.

## Why the tempting answer fails

The future marketing link tells you nothing about how the form helps users recover today. Successful pointer submissions across browsers leave speech untested. UI automation alone also leaves speech unchecked. If you correct the value before checking focus and speech, you lose the error state you need to inspect.

## What the interviewer listens for

Explain which user task matters most for this release and how the deadline affects your plan. When you make the release decision, name the checks you did not run.

## Sources

- [Playwright keyboard actions](https://playwright.dev/docs/api/class-keyboard)
- [Playwright test assertions](https://playwright.dev/docs/test-assertions)
- [W3C on identifying input errors](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
- [ISTQB CTFL syllabus v4.0.1, section 4.4.2, exploratory testing](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
