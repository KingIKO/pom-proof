---
title: "Extract failed test names"
kind: code
topic: reporting
difficulty: easy
minutes: 10
roles: [automation, sdet]
exportName: failedTestNames
starters:
  js: |
    export function failedTestNames(lines) {
    }
  ts: |
    export function failedTestNames(lines: string[]) {
    }
  python: |
    def failed_test_names(lines):
        pass
vectors:
  - name: mixed-log
    args: [["PASS load","FAIL cart","SKIP profile","FAIL tax","FAIL cart"]]
    expected: ["cart","tax"]
  - name: no-failures
    args: [["INFO start","PASS cart","SKIP search"]]
    expected: []
  - name: duplicates
    args: [["FAIL z","FAIL z","FAIL a","FAIL z"]]
    expected: ["z","a"]
  - name: bare-prefix
    args: [["FAIL ","FAIL","fail cart","NOT FAIL cart"]]
    expected: []
  - name: spaces-in-names
    args: [["FAIL cart loads","FAIL cart updates","FAIL cart loads"]]
    expected: ["cart loads","cart updates"]
  - name: unicode-and-case
    args: [["FAIL Café","FAIL café","FAIL Café"]]
    expected: ["Café","café"]
  - name: leading-name-space
    args: [["FAIL  retry","FAIL retry"]]
    expected: [" retry","retry"]
  - name: empty-log
    args: [[]]
    expected: []
solutions:
  js: |
    export function failedTestNames(lines) {
      const names = new Set();
      for (const line of lines) {
        if (line.startsWith('FAIL ') && line.length > 5) names.add(line.slice(5));
      }
      return [...names];
    }
  ts: |
    export function failedTestNames(lines: string[]) {
      const names = new Set<string>();
      for (const line of lines) {
        if (line.startsWith('FAIL ') && line.length > 5) names.add(line.slice(5));
      }
      return [...names];
    }
  python: |
    def failed_test_names(lines):
        names = {}
        for line in lines:
            if line.startswith("FAIL ") and len(line) > 5:
                names[line[5:]] = None
        return list(names)
reference:
  language: js
  source: |
    export function failedTestNames(lines) {
      const names = new Set();
      for (const line of lines) {
        if (line.startsWith('FAIL ') && line.length > 5) names.add(line.slice(5));
      }
      return [...names];
    }
decoy:
  language: js
  source: |
    export function failedTestNames(lines) {
      return [...new Set(lines.filter((line) => line.startsWith('FAIL ') && line.length > 5)
        .map((line) => line.slice(5).split(' ')[0]))];
    }
---

A runner emits one log line per array entry. Collect the names from lines starting with the exact prefix `FAIL ` (including its single ASCII space). The entire nonempty remainder is the name, and spaces and case in that name are significant. Ignore all other lines, including a bare prefix with no name. Return each name once, ordered by its first failing line. Return an empty array if nothing qualifies.

`failedTestNames(["PASS load","FAIL cart","SKIP profile","FAIL tax","FAIL cart"])` returns `["cart","tax"]`. Leave the inputs unchanged.
