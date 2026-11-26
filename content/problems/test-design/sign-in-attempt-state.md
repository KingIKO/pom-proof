---
title: Check account lockout and reset
kind: test-design
topic: state-transitions
difficulty: hard
minutes: 13
roles: [manual-qa, automation, sdet, senior]
exportName: nextSignInState
params:
  - { name: status, type: enum, label: Account status, values: [active, locked] }
  - { name: failures, type: number, label: Consecutive failures }
  - { name: event, type: enum, label: Event, values: [password-mismatch, password-match, reset-complete] }
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
    teaches: Try the last counted failure that must leave the account active.
    implementation: |
      export function nextSignInState(status, failures, event) {
        if (event === 'reset-complete') return ['active', 0];
        if (status === 'locked') return ['locked', failures];
        if (event === 'password-match') return ['active', 0];
        const count = failures + 1;
        return [count >= 3 ? 'locked' : 'active', count];
      }
  - name: locks-one-failure-late
    teaches: Try a failure that brings the streak exactly to the lockout threshold.
    implementation: |
      export function nextSignInState(status, failures, event) {
        if (event === 'reset-complete') return ['active', 0];
        if (status === 'locked') return ['locked', failures];
        if (event === 'password-match') return ['active', 0];
        const count = failures + 1;
        return [count > 4 ? 'locked' : 'active', count];
      }
  - name: retains-failures-after-match
    teaches: Start with a nonzero streak on an active account and then submit a matching password.
    implementation: |
      export function nextSignInState(status, failures, event) {
        if (event === 'reset-complete') return ['active', 0];
        if (status === 'locked') return ['locked', failures];
        if (event === 'password-match') return ['active', failures];
        const count = failures + 1;
        return [count >= 4 ? 'locked' : 'active', count];
      }
  - name: ignores-reset-while-locked
    teaches: Exercise account recovery after the threshold and check both result fields.
    implementation: |
      export function nextSignInState(status, failures, event) {
        if (status === 'locked') return ['locked', failures];
        if (event === 'reset-complete') return ['active', 0];
        if (event === 'password-match') return ['active', 0];
        const count = failures + 1;
        return [count >= 4 ? 'locked' : 'active', count];
      }
  - name: counts-failures-while-locked
    teaches: Compare the counts returned for password events after lockout.
    implementation: |
      export function nextSignInState(status, failures, event) {
        if (event === 'reset-complete') return ['active', 0];
        if (status === 'locked') return ['locked', event === 'password-mismatch' ? failures + 1 : failures];
        if (event === 'password-match') return ['active', 0];
        const count = failures + 1;
        return [count >= 4 ? 'locked' : 'active', count];
      }
  - name: retains-active-streak-on-reset
    teaches: Complete a password reset on an active account with failures already counted.
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

`nextSignInState(status, failures, event)` models one account event at a time. The input failure count is a whole number from 0 to 3 for `active` and is always 4 for `locked`. The function returns a JSON array with the new status first and the new count second, such as `["active", 0]`.

- On an active account, `password-mismatch` adds one to the count. The fourth consecutive mismatch sets the status to `locked`.
- On an active account, `password-match` leaves the account active and resets the count to zero.
- On a locked account, either password event leaves the status and count unchanged.
- On either status, `reset-complete` sets the account to `active` and the count to zero. The event represents a completed password reset.

Enter test rows or write a JavaScript `export function test(nextSignInState)` that throws on an unexpected result.
