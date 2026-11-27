---
problem: code/count-result-lines
---

## What is going on

The importer counts exact report tags after stripping a specific kind of padding. An unexpected tag can reveal that the report producer changed its output. The helper should ignore an unknown value instead of quietly turning it into a valid one.

## The fix

1. Initialize the result with all three counters set to zero.

   **Why:** The caller can read a fixed set of fields even for `empty-file` and `unknown-tags`. Building keys only when a tag appears would omit fields, and `only-skips` would leave two of them missing.

   ```js
   const counts = { passed: 0, failed: 0, skipped: 0 };
   ```

2. Strip runs of literal ASCII spaces only at the start or end of each entry.

   **Why:** The anchors restrict removal to the allowed padding. `padded-spaces` tests both ends; `tabs-are-data` and `unicode-spacing` need their other characters intact so those malformed tags remain distinguishable. Deriving a local tag preserves the original lines for whoever needs to diagnose them.

   ```js
   for (const line of lines) {
     const tag = line.replace(/^ +| +$/g, '');
   ```

3. Inside the scan, increment only the counter whose exact uppercase tag matches, then return the counters after all entries.

   **Why:** Exact comparisons reject `FAILED` and do not promote `pass` from `lowercase`. A blank becomes an empty string and falls through the same comparisons, so it needs no separate rule.

   ```js
     if (tag === 'PASS') counts.passed++;
     if (tag === 'FAIL') counts.failed++;
     if (tag === 'SKIP') counts.skipped++;
   }
   return counts;
   ```

## Why the tempting answer fails

`trim()` removes whitespace beyond ASCII spaces, so `tabs-are-data` and `unicode-spacing` end up counting invalid entries. Uppercasing also turns all three tags in `lowercase` into valid results. Treating those entries as regular outcomes can hide a change in the report writer.

## What the interviewer listens for

Explain which normalization the importer permits and which changes would alter the meaning of a record. Pair a space-padded tag with a tab-padded tag, and show the zero-valued result for an empty file.

## Sources

- [MDN: String.trim()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim)
- [MDN: String.toUpperCase()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toUpperCase)
- [MDN: Regular expression input boundaries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Input_boundary_assertion)
