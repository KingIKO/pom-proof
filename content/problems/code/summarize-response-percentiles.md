---
title: "Find the 50th and 95th response time percentiles"
kind: code
topic: reporting
difficulty: medium
minutes: 20
roles: [automation, sdet]
exportName: summarizeResponsePercentiles
starters:
  js: |
    export function summarizeResponsePercentiles(samples) {
    }
  ts: |
    export function summarizeResponsePercentiles(samples: number[]) {
    }
  python: |
    def summarize_response_percentiles(samples):
        pass
vectors:
  - name: small-tail
    args: [[10,10,10,300,300]]
    expected: {"p50":10,"p95":300}
  - name: one-sample
    args: [[47]]
    expected: {"p50":47,"p95":47}
  - name: all-identical
    args: [[10,10,10]]
    expected: {"p50":10,"p95":10}
  - name: empty-sample
    args: [[]]
    expected: {"p50":null,"p95":null}
  - name: unsorted-tail-outlier
    args: [[500,12,36,15,60,10]]
    expected: {"p50":15,"p95":500}
  - name: upper-rank-boundary
    args: [[120,119,118,117,116,115,114,113,112,111,110,109,108,107,106,105,104,103,102,101]]
    expected: {"p50":110,"p95":119}
  - name: duplicate-ranks
    args: [[4,4,1,40,6,4,20]]
    expected: {"p50":4,"p95":40}
  - name: safe-integer-tail
    args: [[9007199254740991,9007199254740990]]
    expected: {"p50":9007199254740990,"p95":9007199254740991}
solutions:
  js: |
    export function summarizeResponsePercentiles(samples) {
      if (samples.length === 0) return { p50: null, p95: null };
      const sorted = [...samples].sort((a, b) => a - b);
      const rank = (p) => Math.ceil(p * sorted.length / 100) - 1;
      return { p50: sorted[rank(50)], p95: sorted[rank(95)] };
    }
  ts: |
    export function summarizeResponsePercentiles(samples: number[]) {
      if (samples.length === 0) return { p50: null, p95: null };
      const sorted = [...samples].sort((a, b) => a - b);
      const rank = (p: number) => Math.ceil(p * sorted.length / 100) - 1;
      return { p50: sorted[rank(50)], p95: sorted[rank(95)] };
    }
  python: |
    def summarize_response_percentiles(samples):
        if not samples:
            return {"p50": None, "p95": None}
        ordered = sorted(samples)
        def at_rank(percentile):
            return ordered[(percentile * len(ordered) + 99) // 100 - 1]
        return {"p50": at_rank(50), "p95": at_rank(95)}
reference:
  language: js
  source: |
    export function summarizeResponsePercentiles(samples) {
      if (samples.length === 0) return { p50: null, p95: null };
      const sorted = [...samples].sort((a, b) => a - b);
      const rank = (p) => Math.ceil(p * sorted.length / 100) - 1;
      return { p50: sorted[rank(50)], p95: sorted[rank(95)] };
    }
decoy:
  language: js
  source: |
    export function summarizeResponsePercentiles(samples) {
      if (samples.length === 0) return { p50: null, p95: null };
      const sorted = [...samples].sort((a, b) => a - b);
      const rank = (p) => Math.floor(p * (sorted.length - 1) / 100);
      return { p50: sorted[rank(50)], p95: sorted[rank(95)] };
    }
---

A load test measures how long requests take when the system is busy. It reports `p50` and `p95`, the response times at the 50th and 95th percentiles. The nearest-rank rule picks a value from the sorted list of recorded times.

Sort a copy of the samples from smallest to largest. Keep repeated values. If there are `n` samples, use `ceil(p * n / 100)` for percentile `p`. This formula rounds up to a position, counting the first sample as position 1. Use the value at that position without estimating between values.

Return an object with keys `p50` and `p95`. If there are no samples, set both values to `null`. Samples are whole milliseconds of zero or more. They fit the safe integer range, where JavaScript can store each integer exactly.

For example, `summarizeResponsePercentiles([10,10,10,300,300])` returns `{"p50":10,"p95":300}`. Leave the inputs unchanged.
