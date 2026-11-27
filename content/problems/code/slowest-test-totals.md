---
title: "List the tests with the longest total run times"
kind: code
topic: reporting
difficulty: medium
minutes: 20
roles: [automation, sdet]
exportName: slowestTestTotals
starters:
  js: |
    export function slowestTestTotals(runs, limit) {
    }
  ts: |
    type Run = { name: string; ms: number };

    export function slowestTestTotals(runs: Run[], limit: number) {
    }
  python: |
    def slowest_test_totals(runs, limit):
        pass
vectors:
  - name: add-retries
    args: [[{"name":"cart","ms":31},{"name":"auth","ms":52},{"name":"cart","ms":30}],2]
    expected: [{"name":"cart","totalMs":61},{"name":"auth","totalMs":52}]
  - name: limit-results
    args: [[{"name":"b","ms":2},{"name":"a","ms":3}],1]
    expected: [{"name":"a","totalMs":3}]
  - name: limit-exceeds-count
    args: [[{"name":"only","ms":0}],4]
    expected: [{"name":"only","totalMs":0}]
  - name: zero-limit
    args: [[{"name":"first","ms":40}],0]
    expected: []
  - name: tie-at-cutoff
    args: [[{"name":"z","ms":50},{"name":"a","ms":25},{"name":"a","ms":25}],1]
    expected: [{"name":"a","totalMs":50}]
  - name: case-sensitive-ties
    args: [[{"name":"a","ms":0},{"name":"A","ms":0},{"name":"Z","ms":0}],4]
    expected: [{"name":"A","totalMs":0},{"name":"Z","totalMs":0},{"name":"a","totalMs":0}]
  - name: safe-integer-total
    args: [[{"name":"x","ms":9007199254740990},{"name":"x","ms":1},{"name":"y","ms":9007199254740990}],2]
    expected: [{"name":"x","totalMs":9007199254740991},{"name":"y","totalMs":9007199254740990}]
  - name: no-runs
    args: [[],12]
    expected: []
solutions:
  js: |
    export function slowestTestTotals(runs, limit) {
      const totals = new Map();
      for (const { name, ms } of runs) totals.set(name, (totals.get(name) ?? 0) + ms);
      return Array.from(totals, ([name, totalMs]) => ({ name, totalMs }))
        .sort((a, b) => b.totalMs - a.totalMs || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .slice(0, limit);
    }
  ts: |
    type Run = { name: string; ms: number };

    export function slowestTestTotals(runs: Run[], limit: number) {
      const totals = new Map<string, number>();
      for (const { name, ms } of runs) totals.set(name, (totals.get(name) ?? 0) + ms);
      return Array.from(totals, ([name, totalMs]) => ({ name, totalMs }))
        .sort((a, b) => b.totalMs - a.totalMs || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .slice(0, limit);
    }
  python: |
    def slowest_test_totals(runs, limit):
        totals = {}
        for run in runs:
            name = run["name"]
            totals[name] = totals.get(name, 0) + run["ms"]
        ordered = sorted(totals.items(), key=lambda item: (-item[1], item[0]))
        return [{"name": name, "totalMs": total} for name, total in ordered[:limit]]
reference:
  language: js
  source: |
    export function slowestTestTotals(runs, limit) {
      const totals = new Map();
      for (const { name, ms } of runs) totals.set(name, (totals.get(name) ?? 0) + ms);
      return Array.from(totals, ([name, totalMs]) => ({ name, totalMs }))
        .sort((a, b) => b.totalMs - a.totalMs || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .slice(0, limit);
    }
decoy:
  language: js
  source: |
    export function slowestTestTotals(runs, limit) {
      const totals = new Map();
      for (const { name, ms } of runs) totals.set(name, (totals.get(name) ?? 0) + ms);
      return Array.from(totals, ([name, totalMs]) => ({ name, totalMs }))
        .sort((a, b) => b.totalMs - a.totalMs).slice(0, limit);
    }
---

A continuous integration (CI) report shows the results of automated checks. It lists one `{name, ms}` row for each test run. Add the whole milliseconds from rows with the same test name. Match names exactly, including letter case. Names are nonempty ASCII strings.

Return at most `limit` rows of `{name, totalMs}`. Put the largest totals first. If totals tie, sort the names in ascending ASCII text order, using the ASCII number for each character.

The times and the limit are whole numbers of zero or more. They and each test's total fit the safe integer range, where JavaScript can store each integer exactly. If the report is empty or the limit is zero, return no rows.

For example, `slowestTestTotals([{"name":"cart","ms":31},{"name":"auth","ms":52},{"name":"cart","ms":30}], 2)` returns `[{"name":"cart","totalMs":61},{"name":"auth","totalMs":52}]`. Leave the inputs unchanged.
