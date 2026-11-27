---
problem: scenario/accessible-form-deadline
---

## What is going on

The validation summary changed on the only form people can submit. An error can be present in the markup while someone using a keyboard and screen reader still has no way to find or correct the field.

## The answer

1. Confirm the supported screen reader and browser pairing and how an invalid submission should guide someone back to the field.

   **Why:** The pairing sets the environment for the speech check. The recovery rule tells you what focus and announcements should make possible.

2. Spend six minutes on the full keyboard recovery path and nine on finding and correcting the error with the supported screen reader.

   **Why:** The keyboard run catches an unreachable field. The screen reader run catches a field someone can reach but cannot identify from what they hear.

3. Use manual exploratory testing to listen to the actual announcement.

   **Why:** An assertion about text in the markup cannot establish what the supported screen reader spoke.

4. Automate the keyboard focus regression in the UI. For example, drive `page.keyboard.press('Tab')` in Playwright TypeScript and assert focus.

   **Why:** Repeating the actual keystroke detects a focus-order regression that checking for an enabled input would miss.

5. Stop release if the invalid submission traps focus in the summary.

   **Why:** Affected people cannot correct the form, and there is no alternate submission route.

6. Submit one known invalid value by keyboard, observe focus and the announcement, reach and correct the field, then resubmit and verify confirmation.

   **Why:** Observe before correcting so you know the user can discover the error without your prior knowledge of the fixture.

## Why the tempting answer fails

The future marketing link cannot settle today's recovery behavior. Repeating pointer success across browsers never tests speech, and UI automation alone leaves that output unchecked. Correcting the value before observing focus and speech erases the error state you need to inspect.

## What the interviewer listens for

Tie the deadline tradeoff to a task the user must finish. Name the coverage you left unrun when making the release decision.

## Sources

- [Playwright keyboard actions](https://playwright.dev/docs/api/class-keyboard)
- [Playwright test assertions](https://playwright.dev/docs/test-assertions)
- [W3C on identifying input errors](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
- [ISTQB CTFL syllabus v4.0.1, section 4.4.2, exploratory testing](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
