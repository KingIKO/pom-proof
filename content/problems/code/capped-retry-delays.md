---
title: "Build a capped retry schedule"
kind: code
topic: api
difficulty: medium
minutes: 20
roles: [automation, sdet]
exportName: cappedRetryDelays
starters:
  js: |
    export function cappedRetryDelays(baseMs, capMs, retries) {
    }
  ts: |
    export function cappedRetryDelays(baseMs: number, capMs: number, retries: number) {
    }
  python: |
    def capped_retry_delays(baseMs, capMs, retries):
        pass
vectors:
  - name: doubling
    args: [50,1000,4]
    expected: [50,100,200,400]
  - name: exact-cap-at-last
    args: [10,40,3]
    expected: [10,20,40]
  - name: zero-base
    args: [0,100,3]
    expected: [0,0,0]
  - name: one-retry
    args: [30,90,1]
    expected: [30]
  - name: plateau
    args: [10,45,6]
    expected: [10,20,40,45,45,45]
  - name: base-over-cap
    args: [80,20,3]
    expected: [20,20,20]
  - name: safe-integer-cap
    args: [4503599627370496,9007199254740991,3]
    expected: [4503599627370496,9007199254740991,9007199254740991]
  - name: zero-retries
    args: [40,70,0]
    expected: []
solutions:
  js: |
    export function cappedRetryDelays(baseMs, capMs, retries) {
      const delays = [];
      let delay = Math.min(baseMs, capMs);
      for (let i = 0; i < retries; i++) {
        delays.push(delay);
        delay = Math.min(delay * 2, capMs);
      }
      return delays;
    }
  ts: |
    export function cappedRetryDelays(baseMs: number, capMs: number, retries: number) {
      const delays: number[] = [];
      let delay = Math.min(baseMs, capMs);
      for (let i = 0; i < retries; i++) {
        delays.push(delay);
        delay = Math.min(delay * 2, capMs);
      }
      return delays;
    }
  python: |
    def capped_retry_delays(baseMs, capMs, retries):
        delays = []
        delay = min(baseMs, capMs)
        for _ in range(retries):
            delays.append(delay)
            delay = min(delay * 2, capMs)
        return delays
reference:
  language: js
  source: |
    export function cappedRetryDelays(baseMs, capMs, retries) {
      const delays = [];
      let delay = Math.min(baseMs, capMs);
      for (let i = 0; i < retries; i++) {
        delays.push(delay);
        delay = Math.min(delay * 2, capMs);
      }
      return delays;
    }
decoy:
  language: js
  source: |
    export function cappedRetryDelays(baseMs, capMs, retries) {
      return Array.from({ length: retries }, (_, index) => baseMs * 2 ** index);
    }
---

A retry test needs the planned delay before each retry. The first delay is the smaller of `baseMs` and `capMs`. For each later retry, double the previous delay and cap it at `capMs`. Return the `retries` individual delays in order, rather than their cumulative timestamps. All arguments are nonnegative integers. The base and cap are safe integers and the fixture requests at most 100 retries. Zero retries gives an empty array. A zero base or cap gives zero on every retry.

`cappedRetryDelays(50, 1000, 4)` returns `[50,100,200,400]`. Leave the inputs unchanged.
