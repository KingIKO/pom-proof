---
problem: scenario/login-lockout
---

Ask which attempts count and what resets them. Then ask when the cooldown starts and whether another attempt moves the deadline. Those answers give the tester a clock and a counter to assert against. The heading can be reviewed later without changing either test.

Use five minutes to see that the lock starts exactly where specified and four to see that access returns at the right instant. Seed separate accounts so a successful login at one boundary cannot clean up state for the other. A browser sweep catches rendering and integration issues, but repeating a first-attempt success leaves the regression in the counter untouched.

Start at the sign-in API because the deployed service owns the decision and session creation. A unit check of the clock math can complement it. In the isolated run, create the account, trigger lockout, check denial, move the clock, and check that valid credentials create a session. Early session creation is the release blocker even if the UI still says the account is locked.

The interviewer is listening for a measurable boundary and an observable server result. See [OWASP's login throttling guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#login-throttling).
