---
title: "Find tests that pass and fail on the same commit"
kind: code
topic: reporting
difficulty: medium
minutes: 20
roles: [automation, sdet]
exportName: flakyTestsByCommit
starters:
  js: |
    export function flakyTestsByCommit(runs) {
    }
  ts: |
    type Run = { test: string; commit: string; outcome: 'pass' | 'fail' | 'skip' };

    export function flakyTestsByCommit(runs: Run[]) {
    }
  python: |
    def flaky_tests_by_commit(runs):
        pass
vectors:
  - name: fails-then-passes
    args: [[{"test":"cart","commit":"c1","outcome":"fail"},{"test":"cart","commit":"c1","outcome":"pass"}]]
    expected: ["cart"]
  - name: repeated-passes
    args: [[{"test":"cart","commit":"c1","outcome":"pass"},{"test":"cart","commit":"c1","outcome":"pass"}]]
    expected: []
  - name: skip-is-neutral
    args: [[{"test":"cart","commit":"c1","outcome":"skip"},{"test":"cart","commit":"c1","outcome":"fail"}]]
    expected: []
  - name: passes-then-fails
    args: [[{"test":"search","commit":"c1","outcome":"pass"},{"test":"search","commit":"c1","outcome":"fail"}]]
    expected: ["search"]
  - name: different-commits
    args: [[{"test":"search","commit":"c1","outcome":"pass"},{"test":"search","commit":"c2","outcome":"fail"}]]
    expected: []
  - name: proof-order
    args: [[{"test":"a","commit":"c1","outcome":"pass"},{"test":"状態","commit":"c1","outcome":"fail"},{"test":"状態","commit":"c1","outcome":"pass"},{"test":"a","commit":"c1","outcome":"fail"}]]
    expected: ["状態","a"]
  - name: flaky-twice
    args: [[{"test":"a","commit":"c1","outcome":"pass"},{"test":"a","commit":"c1","outcome":"fail"},{"test":"a","commit":"c2","outcome":"fail"},{"test":"a","commit":"c2","outcome":"pass"}]]
    expected: ["a"]
  - name: no-history
    args: [[]]
    expected: []
solutions:
  js: |
    export function flakyTestsByCommit(runs) {
      const evidence = new Map();
      const flaky = new Set();
      for (const { test, commit, outcome } of runs) {
        if (outcome === 'skip') continue;
        const commits = evidence.get(test) ?? new Map();
        const seen = commits.get(commit) ?? new Set();
        seen.add(outcome);
        if (seen.size === 2) flaky.add(test);
        commits.set(commit, seen);
        evidence.set(test, commits);
      }
      return [...flaky];
    }
  ts: |
    type Run = { test: string; commit: string; outcome: 'pass' | 'fail' | 'skip' };

    export function flakyTestsByCommit(runs: Run[]) {
      const evidence = new Map<string, Map<string, Set<string>>>();
      const flaky = new Set<string>();
      for (const { test, commit, outcome } of runs) {
        if (outcome === 'skip') continue;
        const commits = evidence.get(test) ?? new Map<string, Set<string>>();
        const seen = commits.get(commit) ?? new Set<string>();
        seen.add(outcome);
        if (seen.size === 2) flaky.add(test);
        commits.set(commit, seen);
        evidence.set(test, commits);
      }
      return [...flaky];
    }
  python: |
    def flaky_tests_by_commit(runs):
        evidence, flaky = {}, {}
        for row in runs:
            test, commit, outcome = row["test"], row["commit"], row["outcome"]
            if outcome == "skip":
                continue
            seen = evidence.setdefault((test, commit), set())
            seen.add(outcome)
            if len(seen) == 2:
                flaky[test] = None
        return list(flaky)
reference:
  language: js
  source: |
    export function flakyTestsByCommit(runs) {
      const evidence = new Map();
      const flaky = new Set();
      for (const { test, commit, outcome } of runs) {
        if (outcome === 'skip') continue;
        const commits = evidence.get(test) ?? new Map();
        const seen = commits.get(commit) ?? new Set();
        seen.add(outcome);
        if (seen.size === 2) flaky.add(test);
        commits.set(commit, seen);
        evidence.set(test, commits);
      }
      return [...flaky];
    }
decoy:
  language: js
  source: |
    export function flakyTestsByCommit(runs) {
      const evidence = new Map();
      const flaky = new Set();
      for (const { test, outcome } of runs) {
        if (outcome === 'skip') continue;
        const seen = evidence.get(test) ?? new Set();
        seen.add(outcome);
        if (seen.size === 2) flaky.add(test);
        evidence.set(test, seen);
      }
      return [...flaky];
    }
---

For this report, a test is flaky if it both passes and fails on the same commit, or saved version of the code. A pass and a failure on different commits do not count. Ignore skipped runs.

Each `{test, commit, outcome}` row describes one run. The rows are in the order they arrived. Match each test name and commit ID exactly, including letter case.

List each qualifying test name once. Order the names by the first row that shows each test has both a pass and a failure on one commit.

For example, `flakyTestsByCommit([{"test":"cart","commit":"c1","outcome":"fail"},{"test":"cart","commit":"c1","outcome":"pass"}])` returns `["cart"]`. Leave the inputs unchanged.
