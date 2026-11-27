---
problem: code/balanced-log-brackets
---

## What is going on

A log fragment can contain three bracket types. Each closing bracket must match the most recent opening bracket that still needs a match. This is a nesting check: inner pairs must close before the pairs around them. The counts for each symbol may be right even when the pairs cross.

## The fix

1. Set up an empty stack and the matching rules for each closing bracket.

   **Why:** A stack is a list where you add and remove entries at the same end. That keeps the newest opener ready to check first. A lookup maps each of the three closing symbols to the opener it expects. The `nested-context` case needs to remember a different opener at each level.

   ```js
   const stack = [];
   const opening = new Map([[')', '('], [']', '['], ['}', '{']]);
   ```

2. Scan the fragment for brackets, adding each opener to the stack and checking each closer against the top.

   **Why:** Once a closer fails to match, a later character cannot change which opener was on top. On an empty stack, `pop()` returns `undefined`, so the same comparison rejects `closing-first`. The loop ignores other characters, including quotes, so it still checks the bracket in `quotes-still-count`. Only the local stack changes.

   ```js
   for (const char of fragment) {
     if ('([{'.includes(char)) stack.push(char);
     else if (opening.has(char) && stack.pop() !== opening.get(char)) {
       return false;
     }
   }
   ```

3. Return a match only if the stack is empty at the end.

   **Why:** In `missing-close`, an opener is still on the stack at the end, so the check fails. In `empty-fragment` and `nothing-to-match`, the stack stays empty because no brackets need to close.

   ```js
   return stack.length === 0;
   ```

## Why the tempting answer fails

Separate counters can catch missing brackets and a closer before an opener of the same type. The `crossed-pairs` case gives the counters `([)]`. Both counts balance, even though `)` arrives while `[` is still open.

## What the interviewer listens for

Name what stays on the stack after each character: every unmatched opener in its original order. Explain why a source-code parser might need to track quotes. Show that the solution makes one pass and needs space in proportion to the deepest nesting.

## Sources

- [MDN: Array.pop()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
- [MDN: Array.push()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
