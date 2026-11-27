---
problem: scenario/password-reset-links
---

## What is going on

The reset service changes how it stores and consumes links. A link is consumed when someone uses it to reset a password. A used or expired link must leave the account unchanged. An error page cannot tell you whether a password was written before the error.

## The answer

1. Ask whether a new request invalidates older unused links, how long a link lasts, and when the clock starts.

   **Why:** Both rules can invalidate links. A test needs to know which rule caused a particular denial.

2. Spend five minutes on link reuse and six minutes on expiry.

   Complete a reset and check that using the link again cannot change the password. Move the clock in staging, the pre-release test environment, past expiry. Check that a separate, unused link leaves the password unchanged.

   **Why:** The reuse check detects a consumed link that stays valid. The unused link isolates expiry from prior use, which could otherwise explain the same denial.

3. Use an API integration test for consumption and reuse.

   **Why:** The request exercises both the stored link state and the account write. A refusal on screen could hide an incorrect password write.

4. Use a small unit table for the pure time comparison, with inputs before, at, and after expiry.

   **Why:** The comparison is pure, so its result depends only on the times you give it. The table isolates that exact comparison. The staging clock check separately proves that the service respects the calculation.

5. If a consumed link changes the password again, stop the release.

   **Why:** Anyone who still has that link, which should be spent, could change access to the account again.

6. Check that a used reset link cannot change the password again.

   Request a link for an isolated account. Use it to set the first replacement password. Submit the same link with a different candidate password. Then verify that the first replacement still works and the second does not.

   **Why:** The first reset establishes a consumed link and a known good password. Because the second candidate is different, you can observe an unintended second write.

## Why the tempting answer fails

The sender label helps readers recognize the email. It does not define which links the service accepts. A mail delivery sweep spends the expiry budget without testing expiry. A refusal in the UI cannot prove that the service saved the link as consumed. A broad API check is less direct than a unit table for the pure comparison.

## What the interviewer listens for

Name the account state you assert after a rejected attempt. Explain how you isolate reuse from expiry as the cause.

## Sources

- [OWASP forgot password guidance](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
