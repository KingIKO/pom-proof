---
problem: test-design/signup-username-rules
---

## What is going on

The signup validator checks the name as entered before looking at availability. Start from an allowed name and isolate the rule that changes its result.

## The answer

1. Use only lowercase ASCII letters for the length pairs. Reject `sam`, accept `mira`, accept `abcdefghijklmnop`, and reject `abcdefghijklmnopq`.

   **Why:** With case and punctuation out of the picture, `mira` catches the mutant that excludes the minimum. The 17-letter row catches one that admits an overlength name.

2. Reject `7mira` and `miRa7`. Also reject `" mira"` without trimming, and `mirá7` with its non-ASCII letter.

   **Why:** The digit is legal later, so `7mira` catches the mutant that allows a leading digit. A valid opening letter in `miRa7` catches a different mutant that permits uppercase later. The other rejections distinguish the as-entered and ASCII requirements from case alone.

3. Accept `mira_7`, reject `mi__ra` for adjacent underscores, and reject `mira_` for an underscore at the end.

   **Why:** One negative row catches the mutant that permits adjacent underscores and the other catches the mutant that permits the final underscore. Two underscores at the end would let either intact check hide the other missing check.

## Why the tempting answer fails

`mira` catches an excluded minimum and `mira_7` checks a valid digit and underscore. `Mira7` fails at the opening letter even when uppercase is incorrectly allowed later. `mira-7` checks an illegal character and misses both underscore rules as well as the maximum length.

## What the interviewer listens for

Explain what each equivalence partition or boundary value adds. Use allowed controls and rejected cases that break one constraint at a time.

## Sources

- [ISTQB CTFL Syllabus v4.0.1, sections 4.2.1 and 4.2.2](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
- [MDN, regular expression character classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Character_class)
