---
problem: scenario/password-reset-links
---

## What is going on

The reset service changes how it stores and consumes links. A used or expired link must leave the account unchanged. An error page cannot tell you whether a password was written before the error.

## The answer

1. Ask whether a new request invalidates older unused links, how long a link lasts, and when the clock starts.

   **Why:** Both rules can invalidate links, and a test needs to know which one caused a particular denial.

2. Spend five minutes resetting once and checking that reuse cannot change the password again. Spend six advancing the staging clock past expiry and checking that a separate link leaves the password unchanged.

   **Why:** One check detects a consumed link staying valid. The unused link isolates expiry from prior use, which could otherwise explain the same denial.

3. Use an API integration test for consumption and reuse.

   **Why:** The request exercises both stored link state and the account write. A refusal on screen could hide an incorrect write.

4. Use a small unit table for the pure time comparison, with inputs before, at, and after expiry.

   **Why:** The table isolates the exact comparison. The staging clock check separately proves that the service respects that calculation.

5. Stop release if a consumed link changes the password again.

   **Why:** Anyone who still has that supposedly spent link could change access to the account again.

6. Request a link for an isolated account, set the first replacement with that link, submit the same link with a different candidate, then verify the first replacement still works and the second does not.

   **Why:** The first reset establishes a consumed link and a known good password. A different candidate makes an unintended second write observable.

## Why the tempting answer fails

The sender label helps readers recognize the email but does not define link acceptance. A mail delivery sweep spends the expiry budget without testing expiry. A UI refusal cannot prove persisted consumption, and a broad API check is less direct than a unit table for the pure comparison.

## What the interviewer listens for

Name the account state you assert after a rejected attempt and explain how you isolate reuse from expiry.

## Sources

- [OWASP forgot password guidance](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
