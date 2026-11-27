---
problem: test-design/sign-in-attempt-state
---

## What is going on

This is state transition testing, which checks how a system moves from one state to another. It tests one account event at a time. The result has two fields, the status and the failure count. A locked account can look correct even when its failure count is wrong. A mutant is a copy of the function with one planted mistake for the tests to catch.

## The answer

1. Submit `password-mismatch` to active accounts with zero, two, and three failures.

   Expect `["active", 1]`, `["active", 3]`, and `["locked", 4]`, in that order.

   **Why:** The last active result catches the mutant that locks one failure early. The fourth mismatch catches the one that locks late. Starting from zero gives a normal increase to compare with the threshold, the count where the account locks.

2. Apply `password-match` to an active account with three failures, and `reset-complete` to an active account with two failures.

   Expect `["active", 0]` in both cases.

   **Why:** These rows catch two mutants that keep failures. One keeps them after a match, and the other keeps them after a reset on an active account. Each account starts with a nonzero streak, a run of failures in a row.

3. From locked with four failures, expect `["locked", 4]` after either `password-mismatch` or `password-match`.

   **Why:** The mismatch row catches the mutant that adds failures even while the account is locked. The match row shows that a correct password cannot change the locked status.

4. From locked with four failures, expect `reset-complete` to return `["active", 0]`.

   **Why:** This row catches the mutant that ignores a reset while locked. Clearing the count also stops the next mismatch from building on old failures.

## Why the tempting answer fails

The decoy, the tempting set of rows, has a first mismatch and a reset from locked. Both are useful, and the reset catches recovery that leaves the account locked. But the first mismatch cannot reveal an off-by-one threshold that locks one failure early or late. A match from zero cannot tell you whether any failures were cleared. There is also no password event while locked.

## What the interviewer listens for

Tell checks of one event apart from a sequence of events in the application. A follow-up integration test checks several parts working together. It can send failures, complete a reset, and show that the next mismatch starts a fresh streak.

## Sources

- [ISTQB CTFL Syllabus v4.0.1, section 4.2.4, state transition testing](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
