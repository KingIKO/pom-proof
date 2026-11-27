---
problem: code/equal-json-responses
---

## What is going on

The assertion compares parsed JSON values. Array positions describe a sequence, so moving an element can change the response. Object key order is irrelevant to this assertion, even inside objects nested in arrays.

## The fix

1. In the recursive comparator, accept a strict match first.

   **Why:** Strict equality handles equal primitives without converting types, so the number in `boolean-is-not-number` cannot equal the boolean next to it. Parsed `1` and `1.0` are the same numeric value. Recursing through the same helper applies these rules at every depth.

   ```js
   const same = (a, b) => {
     if (a === b) return true;
   ```

2. Compare an array only with another array of the same length, then compare corresponding positions.

   **Why:** `different-array-order` would pass if we sorted both sides first, hiding a real ordering change. `array-is-not-object` prevents treating an index as an ordinary object key. Reading by index also keeps the caller's copies untouched for later assertions.

   ```js
     if (Array.isArray(a)) {
       return Array.isArray(b) && a.length === b.length
         && a.every((value, index) => same(value, b[index]));
     }
   ```

3. Reject any remaining pair that is not two non-null objects. Compare key counts, then require each key and its matching value on the right.

   **Why:** Counting prevents extra fields from slipping through, while presence distinguishes an omitted key from a key with `null` in `missing-key-and-null`. A lookup by key lets `different-key-order` pass at both nesting levels.

   ```js
     if (a === null || b === null || typeof a !== 'object'
       || typeof b !== 'object' || Array.isArray(b)) return false;
     const keys = Object.keys(a);
     return keys.length === Object.keys(b).length
       && keys.every((key) => Object.hasOwn(b, key) && same(a[key], b[key]));
   };
   return same(left, right);
   ```

## Why the tempting answer fails

`JSON.stringify()` visits object keys in a defined order, but two objects can have different insertion orders. The decoy compares text, so `different-key-order` fails despite matching values. Sorting arrays to avoid order differences would introduce a separate error.

## What the interviewer listens for

Explain why both container type and position matter. In Python, ordinary equality treats `True` and `1` as equal, including in containers, so check for booleans at each level while allowing equal JSON numbers.

## Sources

- [MDN: JSON.stringify()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
- [MDN: Strict equality](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality)
- [MDN: Array.isArray()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
- [MDN: Object.hasOwn()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn)
- [Python: Boolean type](https://docs.python.org/3/library/stdtypes.html#boolean-type-bool)
- [Python: Value comparisons in containers](https://docs.python.org/3/reference/expressions.html#value-comparisons)
