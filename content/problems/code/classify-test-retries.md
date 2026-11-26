---
title: Classify test retries
kind: code
topic: reporting
difficulty: easy
minutes: 10
roles: [automation, sdet]
exportName: classifyRun
starters:
  js: |
    export function classifyRun(attempts) {
    }
  ts: |
    type Outcome = 'passed' | 'failed' | 'skipped';
    type Result = 'not-run' | 'passed' | 'flaky' | 'failed';

    export function classifyRun(attempts: Outcome[]): Result {
      return 'not-run';
    }
  python: |
    def classifyRun(attempts):
        return "not-run"
vectors:
  - { name: empty, args: [[]], expected: not-run }
  - { name: skipped-only, args: [[skipped]], expected: not-run }
  - { name: first-pass, args: [[skipped, passed]], expected: passed }
  - { name: recovered, args: [[failed, skipped, passed, skipped]], expected: flaky }
  - { name: failed-last, args: [[passed, failed, skipped]], expected: failed }
  - { name: all-failed, args: [[failed, failed]], expected: failed }
reference:
  language: js
  source: |
    export function classifyRun(attempts) {
      const executed = attempts.filter((outcome) => outcome !== 'skipped');
      const last = executed.at(-1);
      if (last === undefined) return 'not-run';
      if (last === 'failed') return 'failed';
      return executed.includes('failed') ? 'flaky' : 'passed';
    }
decoy:
  language: js
  source: |
    export function classifyRun(attempts) {
      if (attempts.includes('passed')) return attempts.includes('failed') ? 'flaky' : 'passed';
      return attempts.includes('failed') ? 'failed' : 'not-run';
    }
---

A helper groups attempts for one test into a single row of a QA report. Implement `classifyRun(attempts)` in JavaScript, TypeScript, or Python. The input is an array of outcomes in execution order: `passed`, `failed`, or `skipped`.

| Condition after ignoring skips | Return |
| --- | --- |
| No attempts remain | `not-run` |
| The last attempt failed | `failed` |
| The last attempt passed after any failure | `flaky` |
| The last attempt passed with no failures | `passed` |

For example, `["passed", "failed", "skipped"]` returns `"failed"`. Keep the input array unchanged.
