---
problem: test-design/signup-username-rules
---

## What is going on

The signup validator checks the name exactly as entered, before it looks at whether the name is available. Start from an allowed name. Then change one thing, so that a single rule decides the result. A mutant is a copy of the function with one planted mistake for the tests to catch.

## The answer

1. Test the two length pairs with names made only of lowercase ASCII letters.

   Reject `sam` and accept `mira`. Accept `abcdefghijklmnop` and reject `abcdefghijklmnopq`. ASCII is the basic character set with the English alphabet and digits.

   **Why:** `mira` catches the mutant that excludes the minimum length. The 17-letter row catches the one that admits a name that is too long. Lowercase letters keep case and punctuation from interfering with the length checks.

2. Reject `7mira`, `miRa7`, `" mira"`, and `mirá7`.

   Keep the leading space in `" mira"` and the non-ASCII letter in `mirá7`.

   **Why:** `7mira` catches the mutant that allows a leading digit, since a digit is legal later in a name. `miRa7` starts with a valid letter, so it catches a different mutant that permits uppercase later. The other two rejections separate the as-entered and ASCII rules from letter case alone.

3. Accept `mira_7`, and reject `mi__ra` and `mira_`.

   **Why:** `mi__ra` catches the mutant that permits adjacent underscores. `mira_` catches the mutant that permits a final underscore. If one name had two underscores at the end, either check that still worked would hide the other missing check.

## Why the tempting answer fails

In the decoy, the tempting set of rows, `mira` catches an excluded minimum and `mira_7` checks a valid digit and underscore. `Mira7` fails at the opening letter, even when the code wrongly allows uppercase later. `mira-7` checks one illegal character. It misses both underscore rules as well as the maximum length.

## What the interviewer listens for

An equivalence partition is a group of inputs that the validator should treat the same way. A boundary value sits at the edge of a limit. Explain what each partition or boundary value adds. Use allowed names as controls, and use rejected names that each break one rule.

## Sources

- [ISTQB CTFL Syllabus v4.0.1, sections 4.2.1 and 4.2.2](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
- [MDN, regular expression character classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Character_class)
