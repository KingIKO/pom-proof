---
problem: code/balanced-log-brackets
---

## What is going on

A log fragment can contain three bracket types, and each close has to match the most recent opening bracket still waiting. This is a nesting check. A fragment may have the right number of each symbol and still be crossed.

## The fix

1. Start an empty stack and map each closing bracket to its expected opener.

   **Why:** The only eligible opener is the newest one. An array lets you push and pop at that end, and a lookup gives all three closing symbols the same matching rule. The `nested-context` case needs to remember a different opener at each level.

   ```js
   const stack = [];
   const opening = new Map([[')', '('], [']', '['], ['}', '{']]);
   ```

2. Scan the fragment, pushing openers and rejecting a close that cannot match the top. Let everything else pass through the loop.

   **Why:** A mismatch is already final; a later character cannot change what was open at that point. `pop()` returns `undefined` on an empty stack, so the same comparison rejects `closing-first`. Quotes carry no parser state here, which is why `quotes-still-count` still sees its bracket. Only the local stack changes.

   ```js
   for (const char of fragment) {
     if ('([{'.includes(char)) stack.push(char);
     else if (opening.has(char) && stack.pop() !== opening.get(char)) {
       return false;
     }
   }
   ```

3. Accept exactly when the stack is empty.

   **Why:** `missing-close` reaches the end with an unfinished group. In `empty-fragment` and `nothing-to-match`, there was never anything to close.

   ```js
   return stack.length === 0;
   ```

## Why the tempting answer fails

Separate counters can catch missing brackets and closes before opens within a single type. `crossed-pairs` gives them `([)]`: both counts come out even, but `)` arrives while `[` is still waiting.

## What the interviewer listens for

Say what is on the stack after each character: exactly the unmatched openers in their original order. Explain why a source-code parser might track quotes, then account for one linear scan and space proportional to maximum nesting depth.

## Sources

- [MDN: Array.pop()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
- [MDN: Array.push()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
