---
problem: test-design/signup-username-rules
---

Start with a name that satisfies every rule, then change one detail in each row. `mira` passes at the minimum length. `7mira` is long enough and contains only allowed characters, yet fails because a digit starts the name. `miRa7` keeps its valid first letter, so a rejection tests the case rule for the rest of the string.

Treat underscore placement as two separate rules. Compare a passing name such as `mira_7` with `mi__ra`, which has adjacent underscores, and `mira_`, which ends in one. Putting two underscores at the end would exercise both violations. Either check could reject that input even if the other check had gone missing.

The weaker answer gives useful coverage for a valid name with a digit and underscore, and it catches an excluded minimum. Its uppercase example starts with an uppercase letter, so the first-character check rejects it even when uppercase characters are incorrectly allowed later. A hyphen case misses both underscore rules.

An interviewer listens for an allowed and a disallowed example for each constraint. Keep the length checks on names that use only letters so a failure at the limit cannot be attributed to punctuation or case.

Sources: [ISTQB CTFL Syllabus v4.0.1, sections 4.2.1 and 4.2.2](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf) and [MDN, regular expression character classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Character_class).
