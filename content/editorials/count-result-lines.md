---
problem: code/count-result-lines
---

## What is going on

A report importer reads one short tag per entry, such as `PASS`. It strips one specific kind of padding, plain ASCII spaces at either end, and then counts exact tags. An unexpected tag can show that the tool producing the report changed its output. So the helper should ignore an unknown value. It should not quietly turn that value into a valid one.

## The fix

1. Start the result with all three counters set to zero.

   **Why:** The caller can then read the same fixed set of fields every time, even for `empty-file` and `unknown-tags`. If you added a key only when its tag appeared, some fields would be missing. In `only-skips`, two of them would be missing.

   ```js
   const counts = { passed: 0, failed: 0, skipped: 0 };
   ```

2. Remove runs of literal ASCII spaces, and only at the start or end of each entry.

   **Why:** In the pattern, the anchors `^` and `$` mark the start and end of the entry, so removal stays limited to the allowed padding. `padded-spaces` tests both ends. `tabs-are-data` and `unicode-spacing` need their other characters kept, so those malformed tags can still be told apart. The cleaned tag goes into a new local variable. The original lines stay as they were for whoever needs to diagnose them.

   ```js
   for (const line of lines) {
     const tag = line.replace(/^ +| +$/g, '');
   ```

3. In the same loop, add one only to the counter whose exact uppercase tag matches, and return the counters after the last entry.

   **Why:** Exact comparisons reject `FAILED`. They also leave `pass` from `lowercase` uncounted instead of promoting it to `PASS`. A blank entry becomes an empty string and fails all three comparisons, so it needs no separate rule.

   ```js
     if (tag === 'PASS') counts.passed++;
     if (tag === 'FAIL') counts.failed++;
     if (tag === 'SKIP') counts.skipped++;
   }
   return counts;
   ```

## Why the tempting answer fails

The tempting answer uses `trim()`, which removes other whitespace as well as ASCII spaces. So `tabs-are-data` and `unicode-spacing` end up counting invalid entries. Its uppercasing also turns all three tags in `lowercase` into valid results. Counting those entries as normal outcomes can hide a change in the report writer.

## What the interviewer listens for

Explain which normalization the importer permits, meaning which cleanup of a tag is allowed. Then explain which changes would alter what a record means. In your tests, pair a tag padded with spaces and a tag padded with a tab. Also show the all-zero result for an empty file.

## Sources

- [MDN: String.trim()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim)
- [MDN: String.toUpperCase()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toUpperCase)
- [MDN: Regular expression input boundaries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Input_boundary_assertion)
