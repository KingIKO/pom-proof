---
problem: code/flatten-config-keys
---

## What is going on

The audit needs a dot-separated path to each leaf setting. A leaf is a value that the audit reports whole instead of opening it. An explicit empty overrides object is itself a setting, so the report includes it. An empty root object has no named settings, so it produces no paths. Arrays stay whole, even when they contain objects.

## The fix

1. Write a recursive visitor that reads the current object's entries and adds each key to the path prefix.

   **Why:** A recursive visitor is a function that calls itself for each nested object. Each key adds exactly one new segment to the path. Keys can never contain dots, so plain joining keeps the paths in `distinct-prefixes` unambiguous. Arbitrary JSON keys might need escaping or another path format. The visitor only reads entries and collects paths in a separate array, so the configuration stays intact.

   ```js
   const paths = [];
   const visit = (object, prefix) => {
     for (const [key, value] of Object.entries(object)) {
       const path = prefix ? prefix + '.' + key : key;
   ```

2. Descend only into nonempty objects that are not arrays, and save the path for every other value.

   **Why:** `array-is-a-leaf` needs one path for the whole array and another for `null`. In JavaScript, the `typeof` operator reports both `null` and arrays as objects. So `typeof` alone cannot tell them apart from nested objects. The check for child entries keeps `web.overrides` in `empty-nested-object`. The root is never a member of another object, so `empty-root` still produces no path.

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

3. Call the visitor with an empty prefix for the root, then sort the collected paths.

   **Why:** Sorting keeps the report the same when someone reorders the keys. The default string sort gives the requested ASCII order for these paths. It compares text one character at a time, so `numeric-keys` puts `10` before `2`. In `ordering`, uppercase `A` comes before lowercase `a`.

   ```js
   visit(config, '');
   return paths.sort();
   ```

## Why the tempting answer fails

The shortcut descends into every object, even an empty one. In `empty-nested-object`, `web.overrides` has no child entries. So the shortcut finds nothing to save there, and the report loses that explicit setting.

Descending into arrays would cause a similar problem. It would lose an empty array or add unwanted numeric paths for a nonempty one. The shortcut itself correctly leaves arrays alone.

## What the interviewer listens for

Compare the empty root with an empty named object. Then explain why the allowed key characters make dots safe as separators.

## Sources

- [MDN: Object.entries()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)
- [MDN: typeof operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
- [MDN: Array.isArray()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
- [MDN: Array.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
