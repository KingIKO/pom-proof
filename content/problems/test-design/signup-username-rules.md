---
title: Check public usernames at signup
kind: test-design
topic: string-validation
difficulty: medium
minutes: 10
roles: [manual-qa, automation, sdet]
exportName: isSignupName
params:
  - { name: name, type: string, label: Username }
implementation: |
  export function isSignupName(name) {
    return name.length >= 4 && name.length <= 16
      && /^[a-z]/.test(name) && /[^a-z0-9_]/.test(name) === false
      && name.includes('__') === false && name.endsWith('_') === false;
  }
mutants:
  - name: excludes-shortest-name
    teaches: Try the shortest allowed name using only valid letters.
    implementation: |
      export function isSignupName(name) {
        return name.length > 4 && name.length <= 16
          && /^[a-z]/.test(name) && /[^a-z0-9_]/.test(name) === false
          && name.includes('__') === false && name.endsWith('_') === false;
      }
  - name: accepts-overlength-name
    teaches: Try a name one letter beyond the length limit with no other violations.
    implementation: |
      export function isSignupName(name) {
        return name.length >= 4 && name.length <= 17
          && /^[a-z]/.test(name) && /[^a-z0-9_]/.test(name) === false
          && name.includes('__') === false && name.endsWith('_') === false;
      }
  - name: accepts-uppercase-inside-name
    teaches: Put an uppercase letter after a valid opening letter.
    implementation: |
      export function isSignupName(name) {
        return name.length >= 4 && name.length <= 16
          && /^[a-z]/.test(name) && /[^A-Za-z0-9_]/.test(name) === false
          && name.includes('__') === false && name.endsWith('_') === false;
      }
  - name: starts-with-digit
    teaches: Move an otherwise allowed digit to the start of a valid-length name.
    implementation: |
      export function isSignupName(name) {
        return name.length >= 4 && name.length <= 16
          && /^[a-z0-9]/.test(name) && /[^a-z0-9_]/.test(name) === false
          && name.includes('__') === false && name.endsWith('_') === false;
      }
  - name: accepts-adjacent-underscores
    teaches: Put adjacent underscores inside an otherwise valid name.
    implementation: |
      export function isSignupName(name) {
        return name.length >= 4 && name.length <= 16
          && /^[a-z]/.test(name) && /[^a-z0-9_]/.test(name) === false
          && name.endsWith('_') === false;
      }
  - name: accepts-trailing-underscore
    teaches: Put one underscore at the end to isolate its position from repetition.
    implementation: |
      export function isSignupName(name) {
        return name.length >= 4 && name.length <= 16
          && /^[a-z]/.test(name) && /[^a-z0-9_]/.test(name) === false
          && name.includes('__') === false;
      }
reference:
  source: |
    export function test(isSignupName) {
      const cases = [
        ['sam', false], ['mira', true], ['abcdefghijklmnop', true], ['abcdefghijklmnopq', false],
        ['miRa7', false], ['7mira', false], ['mi__ra', false], ['mira_', false],
        ['mira_7', true], [' mira', false], ['mirá7', false],
      ];
      for (const [name, expected] of cases) {
        const actual = isSignupName(name);
        if (actual === expected) continue;
        throw new Error(`${JSON.stringify(name)}: expected ${expected}, got ${actual}`);
      }
    }
rowsReference:
  rows:
    - { args: [sam], expected: false }
    - { args: [mira], expected: true }
    - { args: [abcdefghijklmnop], expected: true }
    - { args: [abcdefghijklmnopq], expected: false }
    - { args: [miRa7], expected: false }
    - { args: ['7mira'], expected: false }
    - { args: [mi__ra], expected: false }
    - { args: [mira_], expected: false }
    - { args: [mira_7], expected: true }
    - { args: [' mira'], expected: false }
    - { args: [mirá7], expected: false }
decoy:
  rows:
    - { args: [mira], expected: true }
    - { args: [mira_7], expected: true }
    - { args: [mira-7], expected: false }
    - { args: [Mira7], expected: false }
---

A community site validates the public username before checking whether it is taken. `isSignupName(name)` checks only the string format. It returns `true` if the string meets all these rules and `false` otherwise:

- The name is 4 through 16 characters inclusive.
- The first character is an ASCII lowercase letter (`a` through `z`).
- Every later character is an ASCII lowercase letter, an ASCII digit (`0` through `9`), or an underscore.
- Underscores cannot be adjacent, and the last character cannot be an underscore.

Check the string as entered. Do not trim it or change its case. Enter test rows or write a JavaScript `export function test(isSignupName)` that throws on an unexpected result.
