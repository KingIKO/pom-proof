---
title: "List the rules a password breaks"
kind: code
topic: validation
difficulty: easy
minutes: 10
roles: [automation, sdet]
exportName: passwordRejectionReasons
starters:
  js: |
    export function passwordRejectionReasons(password) {
    }
  ts: |
    export function passwordRejectionReasons(password: string) {
    }
  python: |
    def password_rejection_reasons(password):
        pass
vectors:
  - name: several-errors
    args: ["small word"]
    expected: ["no-uppercase","no-digit","has-space"]
  - name: passes
    args: ["TestUser42"]
    expected: []
  - name: exactly-nine
    args: ["TestUser4"]
    expected: ["too-short"]
  - name: only-whitespace-fails
    args: ["Test User4"]
    expected: ["has-space"]
  - name: empty-password
    args: [""]
    expected: ["too-short","no-uppercase","no-digit"]
  - name: supplementary-characters
    args: ["A1𐐀𐐀𐐀𐐀𐐀𐐀"]
    expected: ["too-short"]
  - name: unicode-digit-and-letter
    args: ["Équipe١suite"]
    expected: ["no-uppercase","no-digit"]
  - name: tabs-are-not-spaces
    args: ["Test\tUser42"]
    expected: []
solutions:
  js: |
    export function passwordRejectionReasons(password) {
      const failures = [];
      if ([...password].length < 10) failures.push('too-short');
      if (/[A-Z]/.test(password) === false) failures.push('no-uppercase');
      if (/[0-9]/.test(password) === false) failures.push('no-digit');
      if (password.includes(' ')) failures.push('has-space');
      return failures;
    }
  ts: |
    export function passwordRejectionReasons(password: string) {
      const failures: string[] = [];
      if ([...password].length < 10) failures.push('too-short');
      if (/[A-Z]/.test(password) === false) failures.push('no-uppercase');
      if (/[0-9]/.test(password) === false) failures.push('no-digit');
      if (password.includes(' ')) failures.push('has-space');
      return failures;
    }
  python: |
    def password_rejection_reasons(password):
        failures = []
        if len(password) < 10:
            failures.append("too-short")
        if not any("A" <= char <= "Z" for char in password):
            failures.append("no-uppercase")
        if not any("0" <= char <= "9" for char in password):
            failures.append("no-digit")
        if " " in password:
            failures.append("has-space")
        return failures
reference:
  language: js
  source: |
    export function passwordRejectionReasons(password) {
      const failures = [];
      if ([...password].length < 10) failures.push('too-short');
      if (/[A-Z]/.test(password) === false) failures.push('no-uppercase');
      if (/[0-9]/.test(password) === false) failures.push('no-digit');
      if (password.includes(' ')) failures.push('has-space');
      return failures;
    }
decoy:
  language: js
  source: |
    export function passwordRejectionReasons(password) {
      const failures = [];
      if (password.length < 10) failures.push('too-short');
      if (/[A-Z]/.test(password) === false) failures.push('no-uppercase');
      if (/[0-9]/.test(password) === false) failures.push('no-digit');
      if (password.includes(' ')) failures.push('has-space');
      return failures;
    }
---

A sign-up test double, a stand-in for the real sign-up flow, has its own password rules. Return an array with one label for each rule the password breaks. Use the order in the table.

A Unicode code point is one numbered unit of text. For the length rule, count code points even if several combine to look like one character.

| Label | Include it if the password |
| --- | --- |
| `too-short` | Has fewer than 10 Unicode code points |
| `no-uppercase` | Has no ASCII letter from `A` through `Z` |
| `no-digit` | Has no ASCII digit from `0` through `9` |
| `has-space` | Has an ordinary ASCII space |

An empty password breaks the first three rules. Tabs and other whitespace do not count toward `has-space`. If the password meets every rule, return an empty array.

For example, `passwordRejectionReasons("small word")` returns `["no-uppercase","no-digit","has-space"]`. Leave the inputs unchanged.
