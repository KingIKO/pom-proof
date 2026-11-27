---
title: Check when an account locks and how to reset it
kind: test-design
topic: state-transitions
difficulty: hard
minutes: 13
roles: [manual-qa, automation, sdet, senior]
exportName: nextSignInState
params:
  - { name: status, type: enum, label: Starting account status, values: [active, locked] }
  - { name: failures, type: number, label: Wrong passwords in a row }
  - { name: event, type: enum, label: What happened, values: [password-mismatch, password-match, reset-complete] }
implementation: |
  export function nextSignInState(status, failures, event) {
    if (event === 'reset-complete') return ['active', 0];
    if (status === 'locked') return ['locked', failures];
    if (event === 'password-match') return ['active', 0];
    const count = failures + 1;
    return [count >= 4 ? 'locked' : 'active', count];
  }
mutants:
  - name: locks-one-failure-early
    teaches: Check the last wrong password attempt before the account locks.
    implementation: |
      export function nextSignInState(status, failures, event) {
        if (event === 'reset-complete') return ['active', 0];
        if (status === 'locked') return ['locked', failures];
        if (event === 'password-match') return ['active', 0];
        const count = failures + 1;
        return [count >= 3 ? 'locked' : 'active', count];
      }
  - name: locks-one-failure-late
    teaches: Use a wrong password attempt that makes the count reach the lockout limit.
    implementation: |
      export function nextSignInState(status, failures, event) {
        if (event === 'reset-complete') return ['active', 0];
        if (status === 'locked') return ['locked', failures];
        if (event === 'password-match') return ['active', 0];
        const count = failures + 1;
        return [count > 4 ? 'locked' : 'active', count];
      }
  - name: retains-failures-after-match
    teaches: Start with an active account that has a positive failure count. Then submit the correct password.
    implementation: |
      export function nextSignInState(status, failures, event) {
        if (event === 'reset-complete') return ['active', 0];
        if (status === 'locked') return ['locked', failures];
        if (event === 'password-match') return ['active', failures];
        const count = failures + 1;
        return [count >= 4 ? 'locked' : 'active', count];
      }
  - name: ignores-reset-while-locked
    teaches: After the account locks, reset the password. Check the resulting status and count.
    implementation: |
      export function nextSignInState(status, failures, event) {
        if (status === 'locked') return ['locked', failures];
        if (event === 'reset-complete') return ['active', 0];
        if (event === 'password-match') return ['active', 0];
        const count = failures + 1;
        return [count >= 4 ? 'locked' : 'active', count];
      }
  - name: counts-failures-while-locked
    teaches: After the account locks, compare the counts for correct and wrong password attempts.
    implementation: |
      export function nextSignInState(status, failures, event) {
        if (event === 'reset-complete') return ['active', 0];
        if (status === 'locked') return ['locked', event === 'password-mismatch' ? failures + 1 : failures];
        if (event === 'password-match') return ['active', 0];
        const count = failures + 1;
        return [count >= 4 ? 'locked' : 'active', count];
      }
  - name: retains-active-streak-on-reset
    teaches: Start with an active account that has a positive failure count. Complete a password reset.
    implementation: |
      export function nextSignInState(status, failures, event) {
        if (event === 'reset-complete') return ['active', status === 'locked' ? 0 : failures];
        if (status === 'locked') return ['locked', failures];
        if (event === 'password-match') return ['active', 0];
        const count = failures + 1;
        return [count >= 4 ? 'locked' : 'active', count];
      }
reference:
  source: |
    export function test(nextSignInState) {
      const cases = [
        ['active', 0, 'password-mismatch', ['active', 1]],
        ['active', 2, 'password-mismatch', ['active', 3]],
        ['active', 3, 'password-mismatch', ['locked', 4]],
        ['active', 3, 'password-match', ['active', 0]],
        ['active', 2, 'reset-complete', ['active', 0]],
        ['locked', 4, 'password-mismatch', ['locked', 4]],
        ['locked', 4, 'password-match', ['locked', 4]],
        ['locked', 4, 'reset-complete', ['active', 0]],
      ];
      for (const [status, failures, event, expected] of cases) {
        const actual = JSON.stringify(nextSignInState(status, failures, event));
        if (actual === JSON.stringify(expected)) continue;
        throw new Error(`${status}, ${failures} failures, ${event}: expected ${JSON.stringify(expected)}, got ${actual}`);
      }
    }
rowsReference:
  rows:
    - { args: [active, 0, password-mismatch], expected: [active, 1] }
    - { args: [active, 2, password-mismatch], expected: [active, 3] }
    - { args: [active, 3, password-mismatch], expected: [locked, 4] }
    - { args: [active, 3, password-match], expected: [active, 0] }
    - { args: [active, 2, reset-complete], expected: [active, 0] }
    - { args: [locked, 4, password-mismatch], expected: [locked, 4] }
    - { args: [locked, 4, password-match], expected: [locked, 4] }
    - { args: [locked, 4, reset-complete], expected: [active, 0] }
decoy:
  rows:
    - { args: [active, 0, password-match], expected: [active, 0] }
    - { args: [active, 0, password-mismatch], expected: [active, 1] }
    - { args: [locked, 4, reset-complete], expected: [active, 0] }
---

The `nextSignInState(status, failures, event)` function handles one account event at a time. For `active`, the starting count of wrong passwords in a row is a whole number from 0 to 3. For `locked`, the count is always 4.

The function returns a JSON array, an ordered list written in brackets. It lists the new status first and the new count second. For example, `["active", 0]` shows an active account with no failures.

- If the account is active, `password-mismatch` adds one to the count. A fourth wrong password in a row sets the status to `locked`.
- If the account is active, `password-match` keeps it active. The event also resets the count to zero.
- If the account is locked, a correct or wrong password leaves both the status and count unchanged.
- The `reset-complete` event means the person finished resetting their password. With either starting status, this sets the account to `active` and the count to zero.

Enter test rows or write the JavaScript function `export function test(nextSignInState)`. If the result differs from what you expected, throw an error.
