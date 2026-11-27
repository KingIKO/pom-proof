---
problem: diagnosis/review-swallowed-permission-failure
---

## What is going on

The analyst fixture is test setup that creates and owns member `m20`. The product requires a visible removal button. When an analyst presses it, the product must show the alert `Permission denied`. The test puts both the click and the alert check inside the `try` block, which routes thrown errors to `catch`.

## The answer

1. Mark the warning on line 11. Leave the surrounding lines that control which code runs unmarked.

   **Why:** If the click or alert check fails, the code enters the `catch` block, which handles the error. Line 11 prints a warning and lets the test end normally. The test runner can report a pass even if the test never clicked the button or the product showed the wrong alert.

2. The `catch` block hides a failed click or alert check by logging a warning and letting the test pass.

   Remove the block or have it record the required details and throw the original error again. Keep the click and the check for the exact denial text.

   **Why:** If the original error reaches the runner, the runner can report a failure. The exact alert check catches a permissions change that shows the wrong message or none at all.

## Why the tempting answer fails

The decoy marks line 9 and treats the check for a visible denial as the problem. Some products hide actions a user cannot take. Here the requirement lets the analyst press the button and calls for the alert. Removing the alert check drops the outcome the test must verify. The warning would still hide click failures from the runner.

## What the interviewer listens for

Use `Member removed` as a negative case, an example that should fail. The alert check should throw an error, and the corrected test should report a failure in CI.

## Sources

- [MDN: `try...catch`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)
- [ECMAScript: `try` statement](https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html#sec-try-statement)
- [Playwright: assertions](https://playwright.dev/docs/test-assertions)
