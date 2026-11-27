---
problem: test-design/password-length-policy
---

## What is going on

The password rule accepts 12 through 64 Unicode code points, including spaces. Exercise the length limits with ordinary characters first, then make the count itself decide whether a password passes.

## The answer

1. Use ordinary single-code-point letters at lengths 11, 12, and 13. Reject 11 and accept 12 and 13.

   **Why:** Eleven catches the mutant that admits one too few; 12 catches the mutant that excludes the exact minimum. The inside neighbor guards against accepting only the endpoint.

2. Use ordinary characters at 63, 64, and 65. Accept 63 and 64, reject 65.

   **Why:** Sixty-four catches the mutant that rejects the exact maximum. Sixty-five catches the mutant that allows one too many. Keeping the characters ordinary makes this boundary value analysis about the limit alone.

3. Accept `" abcdefghij "`, with one space on either side.

   **Why:** Those spaces are what make the input 12 code points. The mutant that trims before counting sees only ten and wrongly rejects it.

4. Reject `abcdefghij𠮷`: ten ordinary letters and the supplementary letter U+20BB7.

   **Why:** There are 11 code points, but JavaScript's `String.length` reports 12 UTF-16 code units. That difference catches the mutant that counts code units. In the middle of the valid range both counts could still pass.

## Why the tempting answer fails

`garden-path-2026` and `tiny` cover ordinary valid and clearly short inputs. The 12-letter case can catch an excluded minimum, but none checks the upper limit or makes a different counting rule change the result.

## What the interviewer listens for

Define exactly what counts as length before choosing inputs. Keep these cases against the length function, and test any UI trimming or truncation separately against the same rule.

## Sources

- [ISTQB CTFL Syllabus v4.0.1, section 4.2.2](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
- [MDN, String length](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length)
