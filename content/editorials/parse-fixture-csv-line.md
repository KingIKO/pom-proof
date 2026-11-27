---
problem: code/parse-fixture-csv-line
---

## What is going on

In a fixture row, a comma can separate columns or belong to a quoted value. The parser also has to reject malformed rows. Once a quoted field closes, only a comma or the end of the row is allowed, even if the next character is a space.

## The fix

1. Track finished fields, the current field, and its state: `start`, `plain`, `quoted`, or `closed`.

   **Why:** An empty field and a just-closed field can contain the same text but allow different next characters. Keeping state separate lets `only-quoted-empty` produce an empty value while `text-after-quote` still rejects a space after closing. The parser can derive everything without changing the source row.

   ```js
   const fields = [];
   let field = '';
   let state = 'start';
   ```

2. Walk the row one character at a time. Inside a quoted field, copy ordinary characters. For a doubled quote, append one quote and skip the second character; otherwise mark the field closed.

   **Why:** This branch has to run before the comma check, so `comma-in-quoted-field` keeps `Paris, Texas` together. In `doubled-quote`, consuming both characters prevents the second quote from ending the field.

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

3. Outside quotes, finish a field on a comma. Reject other characters after a closing quote and allow an opening quote only at a field's start.

   **Why:** Every separator ends a field, even when it is empty in `empty-cells`. Treat spaces as ordinary data in `simple-cells`, so the quoted text in `interior-unquoted-quote` cannot open a quoted field after a space.

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

4. After the scan, reject an unfinished quote or append the remaining field.

   **Why:** No final separator arrives to flush that field. Appending it preserves `empty-row` as one empty field, while the state still rejects `unclosed-quote`.

   ```js
   return state === 'quoted' ? null : [...fields, field];
   ```

## Why the tempting answer fails

Splitting first breaks `comma-in-quoted-field` before the quote logic runs and shifts the following columns. Peeling quotes off split pieces cannot detect `unclosed-quote`, `text-after-quote`, or `interior-unquoted-quote`; the decoy returns field arrays for all three malformed rows.

## What the interviewer listens for

Trace a row with an empty cell and a quoted comma, then explain the failure on trailing text. For full CSV files, choose a library that handles the file's dialect and line breaks inside quoted values.

## Sources

- [RFC 4180: CSV format, line breaks, and escaped quotes](https://www.rfc-editor.org/rfc/rfc4180#section-2)
- [MDN: String.split()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split)
