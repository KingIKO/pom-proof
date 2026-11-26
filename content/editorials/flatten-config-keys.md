---
problem: code/flatten-config-keys
---

At each object, join the existing prefix and the next key. Recurse only when the value is a nonempty object. Otherwise, save the complete path and move on. Sort the completed list so the report stays stable when a configuration writer changes the order of its keys.

The shortcut walks into every object. For an empty object, there are no child entries to visit and nothing gets recorded. A report can then lose the fact that someone explicitly supplied empty overrides. Treating arrays as traversable objects would have a similar problem: an empty array disappears and a nonempty array produces numeric element paths the report never asked for.

In an interview, explain why this dot notation is unambiguous within the exercise. The key alphabet excludes dots, so no escaping step is needed. With arbitrary JSON object keys, you would need to change the path representation. Include an empty root and an empty nested object in your tests to show they have different meanings.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)
