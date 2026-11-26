---
problem: code/failed-test-names
---

A line has two parts: the fixed prefix and the name that follows it. Check the prefix before slicing. There is no need to split the line into words, because the name can contain several words. Once you have the name, a JavaScript set records whether it has appeared and preserves the order of insertion. In Python an insertion-ordered dictionary can play the same role.

The shortcut is to grab the first word after the status. That works for short names such as `cart`, so a small smoke test can pass. In a log containing `cart loads` and `cart updates`, it turns two failures into one and drops the information needed to rerun either test.

In an interview, state exactly what makes a line eligible before discussing deduplication. Try a repeated failure, a leading space inside a name, and a prefix with no remainder. Keeping the whitespace can look odd until you consider that the report must preserve the test name as emitted.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
