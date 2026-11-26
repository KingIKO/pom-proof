---
problem: code/changed-json-paths
---

Walk the two snapshots together. For two objects, visit the union of their keys. For two arrays, visit every index present in either one. A member missing from one side is a complete difference at that path. When the types differ, stop at the current path for the same reason: the whole value there changed.

The shortcut puts raw keys between slashes. That passes for ordinary property names, then confuses a key named `a/b` with a value below key `a`. Escape the tilde first, before turning slashes into the pointer escape. Otherwise you can accidentally escape part of a sequence you just generated.

An interviewer might ask how you distinguish a changed root from no changes. The former returns an array containing the empty string; the latter returns an empty array. Test a missing member whose value had descendants and a key containing a slash. Then check that ordering follows Unicode code points. JavaScript's default string sort can order characters outside the basic plane differently.

[Related reference](https://www.rfc-editor.org/rfc/rfc6901#section-3)
