---
title: "Parse a CSV fixture row"
kind: code
topic: parsing
difficulty: medium
minutes: 20
roles: [automation, sdet]
exportName: parseFixtureCsvLine
starters:
  js: |
    export function parseFixtureCsvLine(line) {
    }
  ts: |
    export function parseFixtureCsvLine(line: string) {
    }
  python: |
    def parse_fixture_csv_line(line):
        pass
vectors:
  - name: simple-cells
    args: ["sku, 42,ready"]
    expected: ["sku"," 42","ready"]
  - name: quoted-plain-text
    args: ["\"Fresh bread\",ready"]
    expected: ["Fresh bread","ready"]
  - name: empty-cells
    args: [",a,,"]
    expected: ["","a","",""]
  - name: empty-row
    args: [""]
    expected: [""]
  - name: comma-in-quoted-field
    args: ["\"Paris, Texas\",配送"]
    expected: ["Paris, Texas","配送"]
  - name: doubled-quote
    args: ["\"\"\"Quoted\"\"\",tail"]
    expected: ["\"Quoted\"","tail"]
  - name: unclosed-quote
    args: ["first,\"partial"]
    expected: null
  - name: text-after-quote
    args: ["\"closed\" extra,x"]
    expected: null
  - name: interior-unquoted-quote
    args: ["space \"x\",tail"]
    expected: null
  - name: only-quoted-empty
    args: ["\"\""]
    expected: [""]
solutions:
  js: |
    export function parseFixtureCsvLine(line) {
      const fields = [];
      let field = '';
      let state = 'start';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (state === 'quoted') {
          if (char !== '"') field += char;
          else if (line[i + 1] === '"') {
            field += '"';
            i++;
          } else state = 'closed';
        } else if (char === ',') {
          fields.push(field);
          field = '';
          state = 'start';
        } else if (state === 'closed') {
          return null;
        } else if (char === '"') {
          if (state !== 'start') return null;
          state = 'quoted';
        } else {
          field += char;
          state = 'plain';
        }
      }
      return state === 'quoted' ? null : [...fields, field];
    }
  ts: |
    export function parseFixtureCsvLine(line: string) {
      const fields: string[] = [];
      let field = '';
      let state: 'start' | 'plain' | 'quoted' | 'closed' = 'start';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (state === 'quoted') {
          if (char !== '"') field += char;
          else if (line[i + 1] === '"') {
            field += '"';
            i++;
          } else state = 'closed';
        } else if (char === ',') {
          fields.push(field);
          field = '';
          state = 'start';
        } else if (state === 'closed') {
          return null;
        } else if (char === '"') {
          if (state !== 'start') return null;
          state = 'quoted';
        } else {
          field += char;
          state = 'plain';
        }
      }
      return state === 'quoted' ? null : [...fields, field];
    }
  python: |
    def parse_fixture_csv_line(line):
        fields, field = [], []
        state, index = "start", 0
        while index < len(line):
            char = line[index]
            if state == "quoted":
                if char != '"':
                    field.append(char)
                elif line[index + 1:index + 2] == '"':
                    field.append('"')
                    index += 1
                else:
                    state = "closed"
            elif char == ",":
                fields.append("".join(field))
                field, state = [], "start"
            elif state == "closed":
                return None
            elif char == '"':
                if state != "start":
                    return None
                state = "quoted"
            else:
                field.append(char)
                state = "plain"
            index += 1
        return None if state == "quoted" else fields + ["".join(field)]
reference:
  language: js
  source: |
    export function parseFixtureCsvLine(line) {
      const fields = [];
      let field = '';
      let state = 'start';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (state === 'quoted') {
          if (char !== '"') field += char;
          else if (line[i + 1] === '"') {
            field += '"';
            i++;
          } else state = 'closed';
        } else if (char === ',') {
          fields.push(field);
          field = '';
          state = 'start';
        } else if (state === 'closed') {
          return null;
        } else if (char === '"') {
          if (state !== 'start') return null;
          state = 'quoted';
        } else {
          field += char;
          state = 'plain';
        }
      }
      return state === 'quoted' ? null : [...fields, field];
    }
decoy:
  language: js
  source: |
    export function parseFixtureCsvLine(line) {
      return line.split(',').map((field) => field.startsWith('"') && field.endsWith('"')
        ? field.slice(1, -1).replaceAll('""', '"')
        : field);
    }
---

Parse one CSV fixture row with no line breaks. Return its fields as strings, or `null` if the row is malformed. Outside a quoted field, a comma separates fields. An unquoted field may contain any non-comma character except `"`. A quoted field must start with `"` at the first character of the field. Inside it, commas are data and each `""` pair means one literal quote. A closing quote must be followed by a comma or the end of the row, with no padding.

Preserve all data spaces. Leading, trailing, and consecutive commas create empty fields. An empty row contains one empty field. A quote inside an unquoted value, text after a closing quote, and an unclosed quoted field are all malformed.

`parseFixtureCsvLine("sku, 42,ready")` returns `["sku"," 42","ready"]`. Leave the inputs unchanged.
