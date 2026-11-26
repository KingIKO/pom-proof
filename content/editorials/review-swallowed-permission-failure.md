---
problem: diagnosis/review-swallowed-permission-failure
---

Mark line 11. It handles a thrown error by logging and then allowing the test function to finish. Normal completion looks like a pass. The error might be a failed click or a missing `Permission denied` alert. A real authorization regression could also produce the wrong alert or no alert at all.

Remove the catch so the click and assertion failures report naturally. If diagnostics are required, capture them and rethrow the original error. The click and assertion are appropriate for this contract: an analyst can press the button, and the application responds with a denial. Removing the assertion would discard the behavior the test is meant to check.

A candidate may mark the alert expectation because some products hide forbidden actions. That is a reasonable design elsewhere, but the requirement here explicitly says to show the alert after the click. The wrong message must fail the check.

In an interview, describe a case where the app shows `Member removed`. The assertion would throw, and the corrected test would surface that failure in CI.

[MDN: `try...catch`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch) · [Playwright: assertions](https://playwright.dev/docs/test-assertions)
