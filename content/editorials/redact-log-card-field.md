---
problem: code/redact-log-card-field
---

Separate the line on its documented delimiter, one ASCII space. This retains empty entries where several spaces appear in a row. Rejoining the entries with the same delimiter restores every original space. On each token, check the label and character count, then build the replacement from the original suffix and the right number of asterisks.

The shortcut assumes there are always 16 digits. A smoke test with one familiar fixture number passes. A 13- or 19-digit synthetic number will remain visible, though, even when it appears in the exact field the filter was meant to cover. Tests at both supported endpoints show why the length rule matters.

During an interview, bound your privacy claim to the format you were given. A production detector that searches arbitrary logs has a different job. Here, a token with trailing punctuation or a different label must remain as written. Also cover two card fields on one line. Testing just one occurrence can miss a solution that replaces only the first match.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split)
