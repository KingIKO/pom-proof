---
problem: code/flatten-config-keys
---

## What is going on

The audit needs dot-separated paths to leaf settings. An explicit empty overrides object is itself a setting to report. An empty root has no named settings, so it produces nothing. Arrays stay whole, even when they contain objects.

## The fix

1. In a recursive visitor, iterate the current object's entries and extend the prefix with each key.

   **Why:** The next key supplies exactly one new segment. Because the allowed key alphabet excludes dots, `distinct-prefixes` stays unambiguous with plain concatenation. Arbitrary JSON keys could require escaping or another path format. Reading entries and collecting paths separately keeps the configuration intact.

   ```js
   const paths = [];
   const visit = (object, prefix) => {
     for (const [key, value] of Object.entries(object)) {
       const path = prefix ? prefix + '.' + key : key;
   ```

2. Descend only into nonempty objects other than arrays. Save the path for every other value.

   **Why:** `array-is-a-leaf` requires a path for the whole array and another for `null`. In JavaScript, `typeof` alone would classify `null` and arrays as objects. Checking for children makes `empty-nested-object` keep `web.overrides`; the root is never treated as a member, so `empty-root` still emits no path.

   ```js
       if (value !== null && typeof value === 'object'
         && Array.isArray(value) === false && Object.keys(value).length) {
         visit(value, path);
       } else {
         paths.push(path);
       }
     }
   };
   ```

3. Call the visitor with an empty root prefix and sort the collected paths.

   **Why:** The report must stay stable when a writer reorders its keys. Default string sort gives the requested ASCII order for these paths; `numeric-keys` needs `10` before `2`, and `ordering` puts uppercase `A` before lowercase `a`.

   ```js
   visit(config, '');
   return paths.sort();
   ```

## Why the tempting answer fails

The shortcut descends into every object. In `empty-nested-object` there are no child entries under `web.overrides`, so the report loses that explicit setting. Recursing into arrays would likewise lose an empty array or produce unwanted numeric paths for a nonempty one; the actual shortcut correctly leaves arrays alone.

## What the interviewer listens for

Contrast the empty root with an empty named object, then explain why the key alphabet makes dots safe as separators.

## Sources

- [MDN: Object.entries()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)
- [MDN: typeof operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
- [MDN: Array.isArray()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
- [MDN: Array.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
