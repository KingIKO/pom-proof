---
problem: code/password-rejection-reasons
---

## What is going on

The sign-up check lists every rule a password fails, in a fixed order. It measures length in Unicode code points. A code point is a number the Unicode text standard assigns, such as the number for a letter. The other rules check for specific ASCII characters, including the English uppercase letters and the digits from zero through nine. The exercise uses these two definitions on purpose.

## The fix

1. Check the minimum password length by counting code points.

   **Why:** JavaScript stores text in pieces called UTF-16 code units. A supplementary code point, such as a Deseret letter, takes two of those pieces. When you loop over the string, JavaScript reads both pieces together as one code point.

   The `supplementary-characters` case holds `A1` and six Deseret letters. It has eight code points, so it fails the length rule. The `exactly-nine` case checks the longest length that should still fail. Python strings already store text as a sequence of code points, so `len()` gives that count directly.

   ```js
   const failures = [];
   if ([...password].length < 10) failures.push('too-short');
   ```

2. Record the result of each ASCII rule that fails, in the listed order.

   **Why:** If the code returned at the first failure, `empty-password` would hide feedback the user can act on. In `unicode-digit-and-letter`, `É` and `١` do not satisfy the ASCII uppercase and digit rules. The explicit ranges keep the same policy across programming languages.

   ```js
   if (/[A-Z]/.test(password) === false) failures.push('no-uppercase');
   if (/[0-9]/.test(password) === false) failures.push('no-digit');
   ```

3. If the password contains a literal space, add the final label before returning the list.

   **Why:** The `tabs-are-not-spaces` case needs a tab to count as different from a space. The code searches the full password without removing spaces from the ends. That lets `only-whitespace-fails` report its one violation. The empty password cannot trigger this last check. The function then returns the full list of labels.

   ```js
   if (password.includes(' ')) failures.push('has-space');
   return failures;
   ```

## Why the tempting answer fails

The shortcut checks JavaScript's `password.length`, which counts UTF-16 code units instead of code points. `supplementary-characters` has 14 units, so the decoy leaves out `too-short`. Yet its eight code points fall below the minimum. The decoy's other checks already follow the fixture.

## What the interviewer listens for

Name the unit you count and the exact set of characters each rule accepts. Explain why the checks run independently. Keep the policy limited to what the fixture requires.

## Sources

- [MDN: String iteration by code point](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Symbol.iterator)
- [MDN: String length and UTF-16 code units](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length)
- [MDN: Regular expression character classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Character_class)
- [Python: Text sequence type](https://docs.python.org/3/library/stdtypes.html#text-sequence-type-str)
- [Python: len()](https://docs.python.org/3/library/functions.html#len)
