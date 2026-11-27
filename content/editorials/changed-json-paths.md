---
problem: code/changed-json-paths
---

## What is going on

A snapshot test compares a saved JSON response with a new one. The diff, its list of differences, must name the locations that changed. Each location is written as a JSON Pointer, a path such as `/cart/qty` that names one member. A removed object counts as a change at one location, even if it used to hold many leaves. A leaf is a plain value at the end of a branch, such as a number or a string.

Replacing the whole value counts the same way, as one change at the root. The root's pointer is the empty string, `""`. An empty result means the two snapshots agree.

## The fix

1. Prepare the helpers: an empty list of paths, a test for plain JSON objects, and a JSON Pointer escape for object keys.

   **Why:** The `typeof` operator reports `null` as an object, so the object test rules out `null` by name. Arrays also report as objects, but they need their own walk by position. In `root-type-change`, an array index looks like an object key, and the root must still be reported. The escape replaces `~` with `~0` before it replaces `/` with `~1`. That order stops `escaping-and-empty-key` from escaping again the tilde that the slash escape added.

   ```js
   const paths = [];
   const isObject = (value) =>
     value !== null && typeof value === 'object' && Array.isArray(value) === false;
   const escape = (key) => key.replaceAll('~', '~0').replaceAll('/', '~1');
   ```

2. Write a recursive `visit` function, one that calls itself on nested values. It returns at once for strictly equal values, and it records each missing member or changed leaf once, without going deeper.

   **Why:** For two arrays, the function checks each position up to the end of the longer array. That catches the extra element in `array-position-and-extra-item`. For two objects, it checks every own key, meaning a key stored directly on either object. That finds additions and removals regardless of key order. If a key is missing on one side, the function stops there and reports only that path, such as `/remove` in `missing-and-type-change`.

   Strict equality compares values without changing their types. It keeps `false` apart from `0` in `boolean-and-number`. The function only reads the inputs, so both snapshots stay intact.

   ```js
   const visit = (a, b, path) => {
     if (a === b) return;
     if (Array.isArray(a) && Array.isArray(b)) {
       for (let i = 0; i < Math.max(a.length, b.length); i++) {
         const next = path + '/' + i;
         if (i >= a.length || i >= b.length) paths.push(next);
         else visit(a[i], b[i], next);
       }
     } else if (isObject(a) && isObject(b)) {
       for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
         const next = path + '/' + escape(key);
         if (Object.hasOwn(a, key) && Object.hasOwn(b, key)) visit(a[key], b[key], next);
         else paths.push(next);
       }
     } else paths.push(path);
   };
   ```

3. Start the visit at the root, `""`, and sort the escaped paths by code point.

   **Why:** A code point is the number Unicode gives each character. The order must come from the pointer text the caller receives. When a longer path starts with a shorter one, the shorter path goes first. In `code-point-sort`, `U+E000` belongs before `U+10000`. The default JavaScript sort compares UTF-16 code units, the 16-bit pieces a string is stored in, and it puts those two the other way round.

   ```js
   visit(before, after, '');
   return paths.sort((a, b) => {
     const x = Array.from(a, (char) => char.codePointAt(0) ?? 0);
     const y = Array.from(b, (char) => char.codePointAt(0) ?? 0);
     for (let i = 0; i < Math.min(x.length, y.length); i++) {
       if (x[i] !== y[i]) return x[i] - y[i];
     }
     return x.length - y.length;
   });
   ```

## Why the tempting answer fails

The tempting answer walks the right members, but it fails in two ways. First, it puts raw keys into the path, so a key named `a/b` looks like a child under `a`. The `escaping-and-empty-key` test case catches those bad pointers. Second, it uses the default sort, and `code-point-sort` catches that.

## What the interviewer listens for

Explain the stop rule: when a whole nested branch is missing, report its path once and go no deeper. Then tell apart `[""]`, which reports a change at the root, from `[]`, which means the values are equal.

## Sources

- [RFC 6901: JSON Pointer syntax](https://www.rfc-editor.org/rfc/rfc6901#section-3)
- [MDN: typeof operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
- [MDN: Array.isArray()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
- [MDN: Object.hasOwn()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn)
- [MDN: Strict equality](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality)
- [MDN: Array.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [MDN: String.codePointAt()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt)
