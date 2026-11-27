---
problem: code/failed-test-names
---

## What is going on

Each entry is one whole line from the test runner's log. An eligible line starts with the five characters `FAIL `, including the space. Everything after those five characters is the suffix, and the whole suffix names the failure. A rerun tool needs that exact suffix, including any spaces that belong to the name.

## The fix

1. Start an empty set to hold names in the order of first failure.

   **Why:** The `duplicates` test case expects `z` before `a`, even though `z` appears again later and would sort after `a`. A JavaScript `Set` keeps the order in which names were added, and it ignores repeat additions. In Python, a dictionary also keeps insertion order, so it can do the same job with names as keys.

   ```js
   const names = new Set();
   ```

2. For each line, add the complete suffix only when the line starts with the exact prefix and the suffix has at least one character.

   **Why:** The scan must ignore every line in `bare-prefix`: `FAIL ` with no name, a lowercase `fail`, and a line that mentions `FAIL` only later. The `slice` call removes only the five-character prefix. So the leading space in `leading-name-space` stays, and so do the accents and case in `unicode-and-case`. The source lines stay intact for other log readers.

   ```js
   for (const line of lines) {
     if (line.startsWith('FAIL ') && line.length > 5) names.add(line.slice(5));
   }
   ```

3. Return a new array of the set's names.

   **Why:** The caller gets a plain list in first-failure order and never has to deal with the set. `no-failures` and `empty-log` both produce `[]`, because no name was added.

   ```js
   return [...names];
   ```

## Why the tempting answer fails

The tempting shortcut keeps only the first word after the prefix, cutting the name at the next space. In `spaces-in-names`, it turns both `cart loads` and `cart updates` into `cart`. Neither real name is then available for a rerun. In `leading-name-space`, the same split turns one valid name into an empty string.

## What the interviewer listens for

Define which lines are eligible before you discuss deduplication, which means removing repeats. Then use two examples: a bare prefix, and a name that begins with a space. Together they show why removing the prefix is the only change to the text.

## Sources

- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [MDN: String.startsWith()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith)
- [MDN: String.slice()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice)
- [Python: Dictionary insertion order](https://docs.python.org/3/builtins/stdtypes.html#dict)
