---
problem: code/count-failure-words
---

## What is going on

A failure report counts the words in test failure notes. Here a word is a run of ASCII letters or digits. That means uppercase or lowercase A to Z and the digits 0 to 9. Whitespace, hyphens, underscores, and non-ASCII letters end a word. The word boundaries stay the same when you lowercase or sort the words.

## The fix

1. Match every run of ASCII letters or digits, and fall back to an empty list when nothing matches.

   **Why:** The pattern describes the allowed runs, so it keeps the words on both sides of a separator. `interior-punctuation` needs two words from each joined pair. `unicode-separators` shows the ASCII rule at work. When nothing matches, `match()` can return `null` instead of an array. `only-separators` and `empty-notes` need the fallback for that case.

   ```js
   const tokens = notes.match(/[A-Za-z0-9]+/g) ?? [];
   ```

2. Lowercase each token, which is one matched word, and add one to its count in a map.

   **Why:** Lowercasing after the split makes spellings that differ only in case share one counter, without moving any word boundary. A `Map` holds one entry per word. Keeping the counts there leaves the original note untouched for display. The Python solution can collect those same ASCII characters one at a time until it reaches a separator.

   ```js
   const counts = new Map();
   for (const token of tokens) {
     const word = token.toLowerCase();
     counts.set(word, (counts.get(word) ?? 0) + 1);
   }
   ```

3. Sort the entries by count from high to low, then by word in ascending order.

   **Why:** If you sort by count alone, tied entries end up in an order that depends on the note. `order-ties-by-word` requires `cart` before `checkout`, even though `timeout` was read first. For the ASCII tokens in this exercise, plain string comparison gives the required order.

   ```js
   return [...counts].sort(([a, x], [b, y]) =>
     y - x || (a < b ? -1 : a > b ? 1 : 0));
   ```

## Why the tempting answer fails

The tempting answer splits on whitespace and then deletes punctuation. That handles a trailing comma. But in `interior-punctuation`, it joins the words of `cart-timeout` into `carttimeout`. It also joins the two sides of `表` in `unicode-separators`. Once a separator is deleted, the boundary it marked cannot be recovered.

## What the interviewer listens for

Suggest a test with punctuation in the middle of the note and at both ends. Explain how a rule that allows Unicode letters could join words separated by a non-ASCII letter such as `表`. Show why both implementations use the narrower ASCII rule here.

## Sources

- [MDN: Regular expression character classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Character_class)
- [MDN: String.match()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match)
- [MDN: Less than operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than)
- [Python: ASCII character constants](https://docs.python.org/3/library/string.html#string.ascii_letters)
