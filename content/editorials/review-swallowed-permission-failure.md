---
problem: diagnosis/review-swallowed-permission-failure
---

## What is going on

The analyst fixture owns test member `m20`. The product requires a visible removal button that responds with `Permission denied` when an analyst presses it. The test attempts that flow, but the try block encloses the click and the denial assertion.

## The answer

1. Mark line 11, the warning that substitutes logging for failure. Leave the surrounding control-flow syntax unmarked as instructed.

   **Why:** A failed click or alert assertion transfers control to the catch. After the warning, the function finishes normally, so CI can report a pass even if the button was never pressed or the product returned the wrong alert.

2. Choose exception suppression as the source of the false pass. Remove the catch, or capture the required diagnostics and rethrow the original error. Keep the click and the exact denial assertion.

   **Why:** Propagating the error gives CI a failed test when the flow breaks. Keeping the assertion makes the check sensitive to an authorization regression that shows the wrong message or no message at all.

## Why the tempting answer fails

The decoy marks line 9 and blames the visible denial expectation. Some products hide forbidden actions, but this requirement allows the analyst to press the button and explicitly calls for the alert. Removing the assertion would drop the outcome the test exists to verify and still leave click errors suppressed.

## What the interviewer listens for

Use `Member removed` as a negative case. The alert assertion should throw, and the corrected test should surface that failure in CI.

## Sources

- [MDN: `try...catch`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)
- [ECMAScript: `try` statement](https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html#sec-try-statement)
- [Playwright: assertions](https://playwright.dev/docs/test-assertions)
