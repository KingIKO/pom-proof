---
problem: code/equal-json-responses
---

## What is going on

The assertion, the check that decides whether the test passes, compares two parsed JSON values. In an array, positions describe a sequence. So moving an element can change the response. In an object, key order does not matter to this assertion. That holds even for objects nested inside arrays.

## The fix

1. In the recursive comparison function, accept a strict match first.

   **Why:** Primitives are single values such as numbers, strings, booleans, and `null`. Strict equality, `===`, matches equal primitives without converting types, so the number in `boolean-is-not-number` cannot equal the boolean next to it. Parsed `1` and `1.0` are the same numeric value. The function is recursive, which means it calls itself for nested values. So these rules apply at every depth.

   ```js
   const same = (a, b) => {
     if (a === b) return true;
   ```

2. Match an array only with another array of the same length, and then compare the values at each position.

   **Why:** If both sides were sorted first, `different-array-order` would pass and hide a real change in order. `array-is-not-object` makes sure an array index is never treated as an ordinary object key. Reading by index also leaves the caller's copies untouched for later assertions.

   ```js
     if (Array.isArray(a)) {
       return Array.isArray(b) && a.length === b.length
         && a.every((value, index) => same(value, b[index]));
     }
   ```

3. Accept any other pair only if both are non-null objects with equal key counts and each key has an equal value on the right.

   **Why:** Comparing the key counts stops extra fields from slipping through. Checking that each key is present tells an omitted key apart from a key set to `null`, as `missing-key-and-null` requires. Looking up each value by key lets `different-key-order` pass at both nesting levels.

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

The tempting answer compares the text from `JSON.stringify()`. That function visits object keys in a defined order. But two objects with equal values can have different insertion orders. So `different-key-order` fails even though the values match. Sorting arrays to avoid order differences would add a separate error.

## What the interviewer listens for

Explain why both the container type, array or object, and the position matter. In Python, ordinary equality treats `True` and `1` as equal, including inside containers such as lists and dictionaries. So a Python version must check for booleans at each level. It must still let equal JSON numbers match.

## Sources

- [MDN: JSON.stringify()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
- [MDN: Strict equality](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality)
- [MDN: Array.isArray()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
- [MDN: Object.hasOwn()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn)
- [Python: Boolean type](https://docs.python.org/3/library/stdtypes.html#boolean-type-bool)
- [Python: Value comparisons in containers](https://docs.python.org/3/reference/expressions.html#value-comparisons)
