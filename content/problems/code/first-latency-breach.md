---
title: "Find the first latency breach"
kind: code
topic: reporting
difficulty: easy
minutes: 10
roles: [automation, sdet]
exportName: firstLatencyBreach
starters:
  js: |
    export function firstLatencyBreach(durations, budget) {
    }
  ts: |
    export function firstLatencyBreach(durations: number[], budget: number) {
    }
  python: |
    def first_latency_breach(durations, budget):
        pass
vectors:
  - name: middle-breach
    args: [[45,70,20],50]
    expected: 1
  - name: all-below
    args: [[10,20],50]
    expected: -1
  - name: first-breach-wins
    args: [[31,80,40],30]
    expected: 0
  - name: zero-measurement
    args: [[0,5,60],20]
    expected: 2
  - name: exactly-at-budget
    args: [[50,51],50]
    expected: 1
  - name: empty-samples
    args: [[],50]
    expected: -1
  - name: zero-budget
    args: [[0,0,1],0]
    expected: 2
  - name: large-safe-integers
    args: [[9007199254740990,9007199254740991],9007199254740990]
    expected: 1
solutions:
  js: |
    export function firstLatencyBreach(durations, budget) {
      return durations.findIndex((duration) => duration > budget);
    }
  ts: |
    export function firstLatencyBreach(durations: number[], budget: number) {
      return durations.findIndex((duration) => duration > budget);
    }
  python: |
    def first_latency_breach(durations, budget):
        return next((index for index, duration in enumerate(durations) if duration > budget), -1)
reference:
  language: js
  source: |
    export function firstLatencyBreach(durations, budget) {
      return durations.findIndex((duration) => duration > budget);
    }
decoy:
  language: js
  source: |
    export function firstLatencyBreach(durations, budget) {
      return durations.findIndex((duration) => duration >= budget);
    }
---

A smoke test records durations in request order. Find the first request whose duration is strictly greater than its latency budget. Return its zero-based index, or `-1` if no request breaches the budget. The budget and durations are nonnegative integer milliseconds in the safe integer range. An exact match for the budget is acceptable.

`firstLatencyBreach([45,70,20], 50)` returns `1`. Leave the inputs unchanged.
