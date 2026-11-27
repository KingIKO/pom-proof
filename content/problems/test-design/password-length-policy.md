---
title: Check how the form counts password length
kind: test-design
topic: boundary-testing
difficulty: medium
minutes: 9
roles: [manual-qa, automation, sdet]
exportName: meetsPasswordLength
params:
  - { name: password, type: string, label: Password entered }
implementation: |
  export function meetsPasswordLength(password) {
    const length = [...password].length;
    return length >= 12 && length <= 64;
  }
mutants:
  - name: accepts-short-password
    teaches: Use a password one code point shorter than the minimum.
    implementation: |
      export function meetsPasswordLength(password) {
        const length = [...password].length;
        return length >= 11 && length <= 64;
      }
  - name: excludes-minimum-length
    teaches: Use a password with exactly the fewest code points allowed.
    implementation: |
      export function meetsPasswordLength(password) {
        const length = [...password].length;
        return length > 12 && length <= 64;
      }
  - name: excludes-maximum-length
    teaches: Use a password with exactly the most code points allowed.
    implementation: |
      export function meetsPasswordLength(password) {
        const length = [...password].length;
        return length >= 12 && length < 64;
      }
  - name: accepts-long-password
    teaches: Use a password one code point longer than the maximum.
    implementation: |
      export function meetsPasswordLength(password) {
        const length = [...password].length;
        return length >= 12 && length <= 65;
      }
  - name: trims-before-counting
    teaches: Use a password that passes only if you count its spaces at the ends.
    implementation: |
      export function meetsPasswordLength(password) {
        const length = [...password.trim()].length;
        return length >= 12 && length <= 64;
      }
  - name: counts-utf16-units
    teaches: In a password near either length limit, use a supplementary Unicode letter such as 𠮷.
    implementation: |
      export function meetsPasswordLength(password) {
        const length = password.length;
        return length >= 12 && length <= 64;
      }
reference:
  source: |
    export function test(meetsPasswordLength) {
      const cases = [
        ['a'.repeat(11), false], ['a'.repeat(12), true], ['a'.repeat(13), true],
        ['a'.repeat(63), true], ['a'.repeat(64), true], ['a'.repeat(65), false],
        [' abcdefghij ', true], ['abcdefghij𠮷', false],
      ];
      for (const [password, expected] of cases) {
        const actual = meetsPasswordLength(password);
        if (actual === expected) continue;
        throw new Error(`${JSON.stringify(password)}: expected ${expected}, got ${actual}`);
      }
    }
rowsReference:
  rows:
    - { args: ['aaaaaaaaaaa'], expected: false }
    - { args: ['aaaaaaaaaaaa'], expected: true }
    - { args: ['aaaaaaaaaaaaa'], expected: true }
    - { args: ['012345678901234567890123456789012345678901234567890123456789012'], expected: true }
    - { args: ['0123456789012345678901234567890123456789012345678901234567890123'], expected: true }
    - { args: ['01234567890123456789012345678901234567890123456789012345678901234'], expected: false }
    - { args: [' abcdefghij '], expected: true }
    - { args: ['abcdefghij𠮷'], expected: false }
decoy:
  rows:
    - { args: ['garden-path-2026'], expected: true }
    - { args: ['tiny'], expected: false }
    - { args: ['aaaaaaaaaaaa'], expected: true }
---

The password change form passes the password to the `meetsPasswordLength(password)` function exactly as entered. A Unicode code point is a number assigned to a character, such as a letter or a space. For example, `𠮷` is one code point. Count every code point, including spaces at either end.

For lengths from 12 through 64, including both ends, the function returns `true`. For any other length, the function returns `false`. The function checks only length. It has no rules about which characters are allowed.

Enter test rows or write the JavaScript function `export function test(meetsPasswordLength)`. If the result differs from what you expected, throw an error.
