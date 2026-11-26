---
title: Check the password length rule
kind: test-design
topic: boundary-testing
difficulty: medium
minutes: 9
roles: [manual-qa, automation, sdet]
exportName: meetsPasswordLength
params:
  - { name: password, type: string, label: Password }
implementation: |
  export function meetsPasswordLength(password) {
    const length = [...password].length;
    return length >= 12 && length <= 64;
  }
mutants:
  - name: accepts-short-password
    teaches: Try a password immediately below the minimum length.
    implementation: |
      export function meetsPasswordLength(password) {
        const length = [...password].length;
        return length >= 11 && length <= 64;
      }
  - name: excludes-minimum-length
    teaches: Try a password exactly at the minimum length.
    implementation: |
      export function meetsPasswordLength(password) {
        const length = [...password].length;
        return length > 12 && length <= 64;
      }
  - name: excludes-maximum-length
    teaches: Try a password exactly at the maximum length.
    implementation: |
      export function meetsPasswordLength(password) {
        const length = [...password].length;
        return length >= 12 && length < 64;
      }
  - name: accepts-long-password
    teaches: Try a password immediately above the maximum length.
    implementation: |
      export function meetsPasswordLength(password) {
        const length = [...password].length;
        return length >= 12 && length <= 65;
      }
  - name: trims-before-counting
    teaches: Try a password whose eligibility depends on counting outer spaces.
    implementation: |
      export function meetsPasswordLength(password) {
        const length = [...password.trim()].length;
        return length >= 12 && length <= 64;
      }
  - name: counts-utf16-units
    teaches: Use a supplementary Unicode letter near a length boundary.
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

The password change form calls `meetsPasswordLength(password)` with the string as entered. Return `true` for 12 through 64 Unicode code points inclusive and `false` for any other length. Count every code point, including leading and trailing spaces. For example, `𠮷` is one code point. The function checks length only and imposes no character requirements.

Enter test rows or write a JavaScript `export function test(meetsPasswordLength)` that throws on an unexpected result.
