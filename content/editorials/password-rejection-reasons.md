---
problem: code/password-rejection-reasons
---

## What is going on

The sign-up fixture wants every failed rule from one attempt, in a prescribed order. It defines length in Unicode code points, then checks specific ASCII characters for the remaining rules. The two parts use different definitions on purpose.

## The fix

1. Start a result list. Iterate the password by code point before testing the minimum length.

   **Why:** JavaScript string iteration combines the UTF-16 pieces of a supplementary code point. `supplementary-characters` contains `A1` and six Deseret letters, so it has eight code points and fails the limit. `exactly-nine` checks the last length that should fail. Python strings are already sequences of Unicode code points, so `len()` supplies that count there.

   ```js
   const failures = [];
   if ([...password].length < 10) failures.push('too-short');
   ```

2. Run both ASCII character checks independently and append their labels in the listed order.

   **Why:** Returning at the first failure would hide actionable feedback in `empty-password`. In `unicode-digit-and-letter`, `É` and `١` do not satisfy the ASCII uppercase and digit rules. The explicit ranges keep the same policy across languages.

   ```js
   if (/[A-Z]/.test(password) === false) failures.push('no-uppercase');
   if (/[0-9]/.test(password) === false) failures.push('no-digit');
   ```

3. Append the final label only for a literal space, then return the list.

   **Why:** `tabs-are-not-spaces` needs a tab to stay distinct from a space. Searching without trimming leaves the input untouched and lets `only-whitespace-fails` report its one violation. The empty password cannot trigger this last check.

   ```js
   if (password.includes(' ')) failures.push('has-space');
   return failures;
   ```

## Why the tempting answer fails

The shortcut checks JavaScript's `password.length`, which counts UTF-16 code units. `supplementary-characters` has 14 units, so the decoy omits `too-short` even though eight code points fall below the minimum. Its other checks already follow the fixture.

## What the interviewer listens for

Name the unit being counted and the exact alphabet of each rule. Explain why the checks run independently and keep the policy limited to the fixture's requirements.

## Sources

- [MDN: String iteration by code point](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Symbol.iterator)
- [MDN: String length and UTF-16 code units](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length)
- [MDN: Regular expression character classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Character_class)
- [Python: Text sequence type](https://docs.python.org/3/library/stdtypes.html#text-sequence-type-str)
- [Python: len()](https://docs.python.org/3/library/functions.html#len)
