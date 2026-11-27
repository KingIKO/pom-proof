---
title: Check which public usernames signup accepts
kind: test-design
topic: string-validation
difficulty: medium
minutes: 10
roles: [manual-qa, automation, sdet]
exportName: isSignupName
params:
  - { name: name, type: string, label: Public username }
implementation: |
  export function isSignupName(name) {
    return name.length >= 4 && name.length <= 16
      && /^[a-z]/.test(name) && /[^a-z0-9_]/.test(name) === false
      && name.includes('__') === false && name.endsWith('_') === false;
  }
mutants:
  - name: excludes-shortest-name
    teaches: Use only allowed letters to make the shortest valid name.
    implementation: |
      export function isSignupName(name) {
        return name.length > 4 && name.length <= 16
          && /^[a-z]/.test(name) && /[^a-z0-9_]/.test(name) === false
          && name.includes('__') === false && name.endsWith('_') === false;
      }
  - name: accepts-overlength-name
    teaches: Use a name one letter longer than the limit. Follow all the other rules.
    implementation: |
      export function isSignupName(name) {
        return name.length >= 4 && name.length <= 17
          && /^[a-z]/.test(name) && /[^a-z0-9_]/.test(name) === false
          && name.includes('__') === false && name.endsWith('_') === false;
      }
  - name: accepts-uppercase-inside-name
    teaches: Start with an allowed letter and follow it with an uppercase letter.
    implementation: |
      export function isSignupName(name) {
        return name.length >= 4 && name.length <= 16
          && /^[a-z]/.test(name) && /[^A-Za-z0-9_]/.test(name) === false
          && name.includes('__') === false && name.endsWith('_') === false;
      }
  - name: starts-with-digit
    teaches: Use a name of an allowed length. Move a digit that would otherwise be allowed to the start.
    implementation: |
      export function isSignupName(name) {
        return name.length >= 4 && name.length <= 16
          && /^[a-z0-9]/.test(name) && /[^a-z0-9_]/.test(name) === false
          && name.includes('__') === false && name.endsWith('_') === false;
      }
  - name: accepts-adjacent-underscores
    teaches: Put two underscores side by side inside an otherwise valid name.
    implementation: |
      export function isSignupName(name) {
        return name.length >= 4 && name.length <= 16
          && /^[a-z]/.test(name) && /[^a-z0-9_]/.test(name) === false
          && name.endsWith('_') === false;
      }
  - name: accepts-trailing-underscore
    teaches: Put just one underscore at the end. That way the test checks its position without repeating it.
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

A community site checks whether a public username has the right format before it checks whether someone has taken the name. The `isSignupName(name)` function checks only the format of the text. If the name meets every rule below, the function returns `true`. If any rule fails, it returns `false`.

- The name is 4 through 16 characters long, including both limits.
- The first character must be an ASCII lowercase letter (`a` through `z`). ASCII is the basic character set that includes the English alphabet and digits.
- After the first letter, use only ASCII lowercase letters, ASCII digits (`0` through `9`), or underscores.
- Keep underscores apart. The last character cannot be an underscore.

Check the text exactly as entered. Keep any spaces at the ends. Leave uppercase and lowercase letters as they are.

Enter test rows or write the JavaScript function `export function test(isSignupName)`. If the result differs from what you expected, throw an error.
