---
problem: test-design/sign-in-attempt-state
---

## What is going on

This is state transition testing of one account event at a time. The result has two fields. A locked account can look correct even when its failure count is wrong.

## The answer

1. Submit `password-mismatch` to active accounts with zero, two, and three failures. Expect `["active", 1]`, `["active", 3]`, and `["locked", 4]` respectively.

   **Why:** The last active result catches the mutant that locks one failure early. The fourth mismatch catches the one that locks late. Starting from zero provides a normal increment to compare with the threshold behavior.

2. From active with three failures, apply `password-match`. From active with two failures, apply `reset-complete`. Expect `["active", 0]` in both cases.

   **Why:** Starting with a nonzero streak exposes two separate mutants: one keeps failures after a match, the other keeps them after a reset on an active account.

3. From locked with four failures, apply each password event and expect `["locked", 4]`.

   **Why:** Checking the count catches the mutant that increments on mismatch even while locked. Checking the status also proves a matching password cannot change it.

4. From locked with four failures, apply `reset-complete` and expect `["active", 0]`.

   **Why:** This catches the mutant that ignores reset while locked. The count must clear as well, or the next mismatch would use stale failures.

## Why the tempting answer fails

The first mismatch and locked reset are useful, and the reset catches recovery that leaves the account locked. But the first mismatch cannot reveal an off-by-one threshold, and a match from zero cannot tell you whether any failures were cleared. There is also no password event while locked.

## What the interviewer listens for

Distinguish one-event assertions from an application sequence. A follow-up integration test can send failures, complete a reset, and show that the next mismatch starts a fresh streak.

## Sources

- [ISTQB CTFL Syllabus v4.0.1, section 4.2.4, state transition testing](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
