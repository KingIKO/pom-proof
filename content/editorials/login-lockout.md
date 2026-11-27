---
problem: scenario/login-lockout
---

## What is going on

This service limits repeated bad passwords using a failure count and a cooldown. Once the account is locked, even the correct password must fail until the cooldown ends.

## The answer

1. Ask which failures count, whether a successful login resets the count, when cooldown starts, and whether another attempt extends it.

   **Why:** These rules determine the starting count and the deadline. A test can report an apparent off-by-one if either is wrong.

2. Spend five minutes comparing the threshold failure with a separate account one failure short. Spend four trying valid credentials just before and at cooldown expiry.

   **Why:** The first check detects lockout starting too early or late. The second detects premature access or a lock that outlasts its deadline. Separate fixtures keep a successful login from changing state used by the other check.

3. Use the sign-in API to check that the deployed service enters lockout on the threshold attempt.

   **Why:** The service owns the decision and session creation. A screen can show a lockout without proving the server honors it.

4. Unit-test the expiry boundary in the pure cooldown predicate.

   **Why:** Supplying both times isolates the comparison from storage or session behavior that might explain a failed sign-in.

5. Stop release if a locked account gets a session before cooldown ends.

   **Why:** The service granted access during the lock, even if the UI says otherwise.

6. Create a clean account, record the failed attempt that locks it, verify denial with valid credentials, advance the staging clock to expiry, then use valid credentials again and check session creation.

   **Why:** Checking denial before moving the clock proves the account was locked. Using the same valid password after the change isolates the deadline.

## Why the tempting answer fails

The heading does not resolve cooldown. A browser sweep can catch rendering and integration issues, but two first-attempt successes never exercise the failure count. UI checks neither establish the service's lockout result as directly as the API nor isolate the pure clock comparison.

## What the interviewer listens for

Name the count and clock boundaries, then state what server result proves access was denied or restored.

## Sources

- [OWASP's login throttling guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#login-throttling)
