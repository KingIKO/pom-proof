---
problem: code/count-failure-words
---

## What is going on

A failure report counts runs of ASCII letters and digits. Whitespace can end a word, and so can a hyphen, an underscore, or a non-ASCII letter. That definition decides what gets counted before case and sorting come into play.

## The fix

1. Match every run of ASCII letters or digits and use an empty list when there are no matches.

   **Why:** A pattern for the allowed runs preserves both words on either side of a separator. `interior-punctuation` needs two words in each pair. `unicode-separators` makes the ASCII rule visible, and `only-separators` and `empty-notes` need the fallback because `match()` can return `null`.

   ```js
   const tokens = notes.match(/[A-Za-z0-9]+/g) ?? [];
   ```

2. Lowercase each matched token and increment its count in a map.

   **Why:** Case folding after tokenization makes matching spellings share a counter without changing where words begin and end. A map holds one entry per word, and keeping counts separate leaves the original note untouched for display. The Python solution can accumulate those same ASCII characters until it encounters a separator.

   ```js
   const counts = new Map();
   for (const token of tokens) {
     const word = token.toLowerCase();
     counts.set(word, (counts.get(word) ?? 0) + 1);
   }
   ```

3. Sort the entries by count descending, then by word ascending.

   **Why:** Count alone leaves the order of tied entries dependent on the note. `order-ties-by-word` requires `cart` before `checkout` even when `timeout` was read first. Plain string comparison gives the required order for the ASCII tokens in this exercise.

   ```js
   return [...counts].sort(([a, x], [b, y]) =>
     y - x || (a < b ? -1 : a > b ? 1 : 0));
   ```

## Why the tempting answer fails

Splitting on whitespace and deleting punctuation handles a trailing comma. It joins the words of `cart-timeout` as `carttimeout` in `interior-punctuation`; it also joins the two sides of `表` in `unicode-separators`. Deleting a separator cannot recover the boundary it marked.

## What the interviewer listens for

Give a test with punctuation at the beginning, middle, and end. Explain why a Unicode letter definition would split the same note differently and why both implementations use ASCII here.

## Sources

- [MDN: Regular expression character classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Character_class)
- [MDN: String.match()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match)
- [MDN: Less than operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than)
- [Python: ASCII character constants](https://docs.python.org/3/library/string.html#string.ascii_letters)
