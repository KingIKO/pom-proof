---
title: "Find the second highest duration"
kind: code
topic: reporting
difficulty: easy
minutes: 10
roles: [automation, sdet]
exportName: secondHighestDuration
starters:
  js: |
    export function secondHighestDuration(durations) {
    }
  ts: |
    export function secondHighestDuration(durations: number[]) {
    }
  python: |
    def second_highest_duration(durations):
        pass
vectors:
  - name: unsorted
    args: [[11,90,24,42]]
    expected: 42
  - name: two-values
    args: [[10,100]]
    expected: 10
  - name: one-value
    args: [[12]]
    expected: null
  - name: second-is-zero
    args: [[5,0]]
    expected: 0
  - name: tied-maximum
    args: [[90,90,24]]
    expected: 24
  - name: all-equal
    args: [[10,10,10]]
    expected: null
  - name: large-safe-integers
    args: [[9007199254740991,9007199254740990,9007199254740991]]
    expected: 9007199254740990
  - name: empty-report
    args: [[]]
    expected: null
solutions:
  js: |
    export function secondHighestDuration(durations) {
      let first = null;
      let second = null;
      for (const duration of durations) {
        if (first === null || duration > first) {
          second = first;
          first = duration;
        } else if (duration < first && (second === null || duration > second)) {
          second = duration;
        }
      }
      return second;
    }
  ts: |
    export function secondHighestDuration(durations: number[]) {
      let first: number | null = null;
      let second: number | null = null;
      for (const duration of durations) {
        if (first === null || duration > first) {
          second = first;
          first = duration;
        } else if (duration < first && (second === null || duration > second)) {
          second = duration;
        }
      }
      return second;
    }
  python: |
    def second_highest_duration(durations):
        first = second = None
        for duration in durations:
            if first is None or duration > first:
                first, second = duration, first
            elif duration < first and (second is None or duration > second):
                second = duration
        return second
reference:
  language: js
  source: |
    export function secondHighestDuration(durations) {
      let first = null;
      let second = null;
      for (const duration of durations) {
        if (first === null || duration > first) {
          second = first;
          first = duration;
        } else if (duration < first && (second === null || duration > second)) {
          second = duration;
        }
      }
      return second;
    }
decoy:
  language: js
  source: |
    export function secondHighestDuration(durations) {
      return [...durations].sort((a, b) => b - a)[1] ?? null;
    }
---

A performance report needs the second highest distinct duration. The input contains nonnegative safe integers in milliseconds (at most 9,007,199,254,740,991). Return the second highest value, ignoring repeated values. Return `null` when there are fewer than two distinct durations.

`secondHighestDuration([11,90,24,42])` returns `42`. Leave the inputs unchanged.
