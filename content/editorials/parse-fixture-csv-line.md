---
problem: code/parse-fixture-csv-line
---

Scan characters with a state for the start of a field, an unquoted field, a quoted field, and a closed quoted field. A comma is a field separator only outside a quoted field. Inside quotes, a quote followed by another quote adds one quote to the data and consumes both characters. Closing quotes have a stricter next-character rule than ordinary text.

The shortcut splits on every comma before inspecting quotes. A quoted value with an embedded comma has already been broken into separate pieces by the time the quote logic sees it. That can also shift every later value into the wrong fixture column.

An interviewer will usually ask you to trace one row containing both an empty cell and a quoted comma. Also include a row with trailing text after the closing quote. It checks that you took the malformed-row contract seriously. For full CSV files, which can include line breaks within quoted fields, choose a CSV library that matches the file's format.

[Related reference](https://www.rfc-editor.org/rfc/rfc4180#section-2)
