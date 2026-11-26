---
title: "Count test result lines"
kind: code
topic: reporting
difficulty: easy
minutes: 10
roles: [automation, sdet]
exportName: countResultLines
starters:
  js: |
    export function countResultLines(lines) {
    }
  ts: |
    export function countResultLines(lines: string[]) {
    }
  python: |
    def count_result_lines(lines):
        pass
vectors:
  - name: basic-counts
    args: [["PASS","FAIL","PASS","SKIP"]]
    expected: {"passed":2,"failed":1,"skipped":1}
  - name: padded-spaces
    args: [[" PASS","FAIL "," SKIP "]]
    expected: {"passed":1,"failed":1,"skipped":1}
  - name: only-skips
    args: [["SKIP","SKIP"]]
    expected: {"passed":0,"failed":0,"skipped":2}
  - name: unknown-tags
    args: [["TODO","FAILED","OPEN"]]
    expected: {"passed":0,"failed":0,"skipped":0}
  - name: lowercase
    args: [["pass","Fail","skip"]]
    expected: {"passed":0,"failed":0,"skipped":0}
  - name: tabs-are-data
    args: [["\tPASS","SKIP\t","  FAIL "]]
    expected: {"passed":0,"failed":1,"skipped":0}
  - name: unicode-spacing
    args: [[" PASS","FAIL ",""]]
    expected: {"passed":0,"failed":0,"skipped":0}
  - name: empty-file
    args: [[]]
    expected: {"passed":0,"failed":0,"skipped":0}
solutions:
  js: |
    export function countResultLines(lines) {
      const counts = { passed: 0, failed: 0, skipped: 0 };
      for (const line of lines) {
        const tag = line.replace(/^ +| +$/g, '');
        if (tag === 'PASS') counts.passed++;
        if (tag === 'FAIL') counts.failed++;
        if (tag === 'SKIP') counts.skipped++;
      }
      return counts;
    }
  ts: |
    export function countResultLines(lines: string[]) {
      const counts = { passed: 0, failed: 0, skipped: 0 };
      for (const line of lines) {
        const tag = line.replace(/^ +| +$/g, '');
        if (tag === 'PASS') counts.passed++;
        if (tag === 'FAIL') counts.failed++;
        if (tag === 'SKIP') counts.skipped++;
      }
      return counts;
    }
  python: |
    def count_result_lines(lines):
        counts = {"passed": 0, "failed": 0, "skipped": 0}
        keys = {"PASS": "passed", "FAIL": "failed", "SKIP": "skipped"}
        for line in lines:
            key = keys.get(line.strip(" "))
            if key is not None:
                counts[key] += 1
        return counts
reference:
  language: js
  source: |
    export function countResultLines(lines) {
      const counts = { passed: 0, failed: 0, skipped: 0 };
      for (const line of lines) {
        const tag = line.replace(/^ +| +$/g, '');
        if (tag === 'PASS') counts.passed++;
        if (tag === 'FAIL') counts.failed++;
        if (tag === 'SKIP') counts.skipped++;
      }
      return counts;
    }
decoy:
  language: js
  source: |
    export function countResultLines(lines) {
      const counts = { passed: 0, failed: 0, skipped: 0 };
      for (const line of lines) {
        const tag = line.trim().toUpperCase();
        if (tag === 'PASS') counts.passed++;
        if (tag === 'FAIL') counts.failed++;
        if (tag === 'SKIP') counts.skipped++;
      }
      return counts;
    }
---

A report importer receives one short tag per array entry. Strip only ASCII spaces from both ends, then count exact `PASS`, `FAIL`, and `SKIP` tags. The input entries contain no line breaks and may contain other characters, including tabs. Ignore unknown tags, blank entries, and lowercase tags. Return the integer counts under the keys `passed`, `failed`, and `skipped`. Include all three keys even if their counts are zero.

`countResultLines(["PASS","FAIL","PASS","SKIP"])` returns `{"passed":2,"failed":1,"skipped":1}`. Leave the inputs unchanged.
