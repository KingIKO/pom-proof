---
problem: scenario/accessible-form-deadline
---

Confirm the screen reader and browser pairing and ask how an invalid submission is meant to return the user to the field. The exercise requires the whole recovery path, so validating that the error exists in the page markup covers only part of it.

Take six minutes for keyboard recovery and nine for the screen reader pass. Submit with a known bad value, observe focus and what is announced, reach and fix the field, then resubmit and check confirmation. The observation belongs before correction. Otherwise the test might miss whether a person ever had enough information to recover. Use manual exploratory testing for the actual announcement. A UI regression can assert the focus path with `page.keyboard.press('Tab')` in TypeScript and a focus assertion. See [Playwright keyboard actions](https://playwright.dev/docs/api/class-keyboard).

The decoy repeats pointer success in several browsers and leaves speech output unchecked. A keyboard trap after submit blocks release because the only submission route cannot be completed by affected users. Name which other coverage remains unrun in the release decision.

See [W3C on identifying input errors](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html). An interviewer listens for a deadline tradeoff tied to a task the user must finish.
