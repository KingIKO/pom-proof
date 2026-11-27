---
problem: code/failed-test-names
---

## What is going on

Each entry is a whole runner log line. The five characters `FAIL ` mark the start of an eligible line, and the entire suffix identifies the failure. A rerun tool needs that exact suffix, including any spaces that belong to the name.

## The fix

1. Start an empty set to hold names in the order of first failure.

   **Why:** `duplicates` expects `z` before `a`, even though `z` appears again later and would sort after `a`. JavaScript sets keep insertion order and ignore repeat additions. In Python, an insertion-ordered dictionary can do the same job with names as keys.

   ```js
   const names = new Set();
   ```

2. Scan each line and add the complete suffix only when the exact prefix matches and the suffix has at least one character.

   **Why:** `bare-prefix` includes `FAIL ` with no name, lowercased `fail`, and a line that mentions `FAIL` later. All must be ignored. Slicing after the five-character prefix leaves the leading space in `leading-name-space` and the accents and case in `unicode-and-case` unchanged. The source lines remain intact for other log readers.

   ```js
   for (const line of lines) {
     if (line.startsWith('FAIL ') && line.length > 5) names.add(line.slice(5));
   }
   ```

3. Return a new array of the set's names.

   **Why:** The caller gets a list in first-failure order without handling set state. `no-failures` and `empty-log` both produce `[]` because no name was added.

   ```js
   return [...names];
   ```

## Why the tempting answer fails

The shortcut takes the first space-delimited word after the prefix. `spaces-in-names` collapses `cart loads` and `cart updates` into `cart`, leaving neither name available for a rerun. In `leading-name-space`, the same split produces an empty token for one valid name.

## What the interviewer listens for

Define eligibility before discussing deduplication. Use a bare prefix and a name beginning with a space to show why removing the prefix is the only edit to the text.

## Sources

- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [MDN: String.startsWith()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith)
- [MDN: String.slice()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice)
- [Python: Dictionary insertion order](https://docs.python.org/3/builtins/stdtypes.html#dict)
