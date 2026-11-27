---
problem: scenario/login-lockout
---

## What is going on

This service limits repeated bad passwords with a failure count and a cooldown. The count tracks failed attempts. The cooldown is the waiting period after the account locks. Once the account is locked, even the correct password must fail until the cooldown ends.

## The answer

1. Ask which failures count, whether a successful login resets the count, when cooldown starts, and whether another attempt extends it.

   **Why:** These rules set the starting count and the deadline. If either is wrong, a test can report an apparent off-by-one error, a result one step early or late.

2. Spend five minutes on the threshold, the failure that locks the account, and four minutes on cooldown expiry.

   Compare the threshold failure with a separate account one failure short. Try valid credentials just before the cooldown ends and at its end.

   **Why:** The threshold check detects lockout starting too early or too late. The cooldown check detects access granted too soon or a lock that outlasts its deadline. Separate fixtures, the prepared test accounts, keep a successful login from changing state that the other check uses.

3. Use the sign-in API to check that the deployed service enters lockout on the threshold attempt.

   **Why:** The service makes the lockout decision and creates the session, the signed-in state after login. A screen can show a lockout without proving the server honors it.

4. Unit-test the expiry boundary in the pure cooldown predicate, the function that says whether the cooldown has ended.

   **Why:** The predicate is pure: it takes the current time and the deadline without calling the service. Supplying both times separates the comparison from storage or session behavior that might explain a failed sign-in.

5. If a locked account gets a session before the cooldown ends, stop the release.

   **Why:** The service granted access during the lock, even if the UI says otherwise.

6. Test what happens to a valid sign-in before and after the lockout expires.

   Create a clean account and record the failed attempt that locks it. Verify that valid credentials are denied. Advance the clock in staging, the pre-release test environment, to expiry. Use the valid credentials again and check that the app creates a session.

   **Why:** Checking the denial before moving the clock proves that the account was locked. Using the same valid password after the move leaves the deadline as the only change.

## Why the tempting answer fails

The heading does not settle the cooldown rules. A sweep across browsers can catch rendering and integration issues. But two successes on the first attempt never exercise the failure count. UI checks do not establish the service's lockout result as directly as the API. They also do not isolate the pure clock comparison.

## What the interviewer listens for

Name the count and clock boundaries. Then state which server result proves that access was denied or restored.

## Sources

- [OWASP's login throttling guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#login-throttling)
