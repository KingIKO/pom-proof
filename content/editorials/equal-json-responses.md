---
problem: code/equal-json-responses
---

Dispatch on the JSON value category before comparing its contents. An array is an ordered sequence. An object is a mapping with exact keys. For an object, compare the number of keys, make sure each key exists on the other object, and recurse on the corresponding values. That existence check distinguishes an omitted key from a present key whose value is null.

The shortcut serializes both responses and compares the resulting strings. A response with the same object fields in a different order can produce different text. A test then fails on a change the assertion should ignore. Conversely, sorting an array before comparing it can hide a real ordering bug.

An interviewer may switch the implementation language halfway through the question. In Python, a naive equality comparison accepts `True` and `1` as equal, including when nested inside containers. Checking value types during the recursive walk keeps the JSON distinction. Test the rule inside an object or array to make sure the type check is not only at the root.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
