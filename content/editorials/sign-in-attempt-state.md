---
problem: test-design/sign-in-attempt-state
---

Start an active account with two failures and send a mismatch. The result must be `["active", 3]`. Start with three and send the same event. This time the result must be `["locked", 4]`. The two rows bracket the lockout point. Checking both the status and the count matters: a locked account could look correct while its stored count is wrong.

Use an active account with a nonzero streak to test a password match and a completed reset. Each should clear the streak. A locked account should ignore both password events and keep its count unchanged. A completed reset is different from either password event: it returns the account to active with zero failures.

The weaker answer tries an ordinary first mismatch, a match from a clean account, and reset from a locked account. It catches a reset that never gets past the locked state. A match from a clean account can't show whether the function actually clears a counter, and a first mismatch can't reveal an off-by-one lockout.

An interviewer listens for the difference between testing this one-event function and testing a sequence in the application. A follow-up integration check can send failures, complete a reset, and show that the next mismatch starts a fresh streak.

Source: [ISTQB CTFL Syllabus v4.0.1, section 4.2.4, state transition testing](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf).
