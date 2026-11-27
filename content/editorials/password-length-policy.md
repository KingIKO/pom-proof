---
problem: test-design/password-length-policy
---

## What is going on

The password rule accepts 12 through 64 Unicode code points, including spaces. A code point is a number assigned to one character, such as a letter or a space. Test the length limits with ordinary characters first. Then use inputs where the way you count decides whether a password passes. A mutant is a copy of the function with one planted mistake for the tests to catch.

## The answer

1. With ordinary single-code-point letters, reject length 11 and accept lengths 12 and 13.

   Reject `aaaaaaaaaaa`. Accept `aaaaaaaaaaaa` and `aaaaaaaaaaaaa`.

   **Why:** Eleven catches the mutant that admits one too few. A length of 12 catches the mutant that excludes the exact minimum. Thirteen is just inside the range, so it catches code that accepts only the endpoint.

2. With ordinary characters, accept lengths 63 and 64 and reject length 65.

   Accept `012345678901234567890123456789012345678901234567890123456789012` and `0123456789012345678901234567890123456789012345678901234567890123`. Reject `01234567890123456789012345678901234567890123456789012345678901234`.

   **Why:** Sixty-four catches the mutant that rejects the exact maximum. Sixty-five catches the mutant that allows one too many. This is boundary value analysis, which tests values at and next to a limit. Ordinary characters keep it about the limit alone.

3. Accept `" abcdefghij "`, with one space on either side.

   **Why:** The mutant that trims the spaces before counting sees only ten and wrongly rejects the input. Counting the spaces brings the input to 12 code points.

4. Reject `abcdefghij𠮷`, which is ten ordinary letters plus the supplementary letter U+20BB7.

   **Why:** This input catches the mutant that counts code units. It has 11 code points. JavaScript's `String.length` reports 12 UTF-16 code units, because JavaScript stores a supplementary letter as two units. In the middle of the valid range, both counts could still pass.

## Why the tempting answer fails

The decoy, the tempting set of rows, uses `garden-path-2026` and `tiny`. They cover an ordinary valid input and a clearly short one. Its 12-letter case can catch an excluded minimum. But none of the rows checks the upper limit. None of them makes a different counting rule change the result.

## What the interviewer listens for

Before you choose inputs, define exactly what counts as length. Run these cases against the length function. Test any trimming or truncation in the UI separately against the same rule. Truncation means cutting off characters past a limit.

## Sources

- [ISTQB CTFL Syllabus v4.0.1, section 4.2.2](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
- [MDN, String length](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length)
