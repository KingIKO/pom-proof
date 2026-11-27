---
problem: code/parse-fixture-csv-line
---

## What is going on

A fixture row is one line of test data in CSV format, where commas separate the columns. In such a row, a comma can separate columns or belong to a quoted value. The parser also has to reject malformed rows. After a quoted field closes, only a comma or the end of the row may follow. That rule holds even when the next character is a space.

## The fix

1. Track the finished fields, the current field, and the current field's state: `start`, `plain`, `quoted`, or `closed`.

   **Why:** The state records which characters the parser may accept next. A new empty field and a just-closed field can hold the same text, but different characters may follow each one. With a separate state, `only-quoted-empty` produces an empty value. `text-after-quote` still rejects the space after its closing quote. The parser works all this out without changing the source row.

   ```js
   const fields = [];
   let field = '';
   let state = 'start';
   ```

2. Walk the row one character at a time, and handle characters inside a quoted field first.

   **Why:** Inside a quoted field, the parser copies every character except a quote. A doubled quote, `""`, stands for one literal quote, so the parser appends one quote and skips the second character. Any other quote closes the field. This branch runs before the comma check, so `comma-in-quoted-field` keeps `Paris, Texas` together. In `doubled-quote`, consuming both characters stops the second quote from ending the field.

   ```js
   for (let i = 0; i < line.length; i++) {
     const char = line[i];
     if (state === 'quoted') {
       if (char !== '"') field += char;
       else if (line[i + 1] === '"') {
         field += '"';
         i++;
       } else state = 'closed';
   ```

3. Outside quotes, finish the field at each comma and reject any character that the field's state does not allow.

   **Why:** Every comma ends a field, even an empty one, as `empty-cells` shows. After a closing quote, any character other than a comma makes the row malformed. An opening quote is allowed only at the start of a field. Spaces count as ordinary data, as in `simple-cells`. So in `interior-unquoted-quote`, the quote after a space cannot open a quoted field.

   ```js
     } else if (char === ',') {
       fields.push(field);
       field = '';
       state = 'start';
     } else if (state === 'closed') return null;
     else if (char === '"') {
       if (state !== 'start') return null;
       state = 'quoted';
     } else {
       field += char;
       state = 'plain';
     }
   }
   ```

4. After the scan, reject an unclosed quote or append the last field.

   **Why:** No comma follows the last field, so the loop never adds it. Appending it after the loop keeps `empty-row` as one empty field. The `quoted` state still rejects `unclosed-quote`.

   ```js
   return state === 'quoted' ? null : [...fields, field];
   ```

## Why the tempting answer fails

The decoy splits the row on commas first. That breaks `comma-in-quoted-field` before any quote logic runs, and it shifts the columns that follow. Removing quotes from the split pieces afterward cannot detect `unclosed-quote`, `text-after-quote`, or `interior-unquoted-quote`. The decoy returns field arrays for all three of those malformed rows.

## What the interviewer listens for

Trace a row that has an empty cell and a quoted comma. Then explain why text after a closing quote fails. For full CSV files, choose a library that handles the file's dialect, meaning its exact CSV rules. It should also handle line breaks inside quoted values.

## Sources

- [RFC 4180: CSV format, line breaks, and escaped quotes](https://www.rfc-editor.org/rfc/rfc4180#section-2)
- [MDN: String.split()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split)
