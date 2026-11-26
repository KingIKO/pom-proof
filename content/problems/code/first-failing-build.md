---
title: "Find the first failing build"
kind: code
topic: ci
difficulty: easy
minutes: 10
roles: [automation, sdet]
exportName: firstFailingBuild
starters:
  js: |
    export function firstFailingBuild(failed) {
    }
  ts: |
    export function firstFailingBuild(failed: boolean[]) {
    }
  python: |
    def first_failing_build(failed):
        pass
vectors:
  - name: failure-near-end
    args: [[false,false,false,true,true]]
    expected: 3
  - name: no-failure
    args: [[false,false,false]]
    expected: -1
  - name: one-failing-build
    args: [[true]]
    expected: 0
  - name: failure-only-at-end
    args: [[false,false,true]]
    expected: 2
  - name: all-builds-fail
    args: [[true,true,true,true,true]]
    expected: 0
  - name: several-builds-fail
    args: [[false,true,true,true,true,true,true]]
    expected: 1
  - name: empty-history
    args: [[]]
    expected: -1
  - name: one-passing-build
    args: [[false]]
    expected: -1
solutions:
  js: |
    export function firstFailingBuild(failed) {
      let low = 0;
      let high = failed.length;
      while (low < high) {
        const mid = low + Math.floor((high - low) / 2);
        if (failed[mid]) high = mid;
        else low = mid + 1;
      }
      return low === failed.length ? -1 : low;
    }
  ts: |
    export function firstFailingBuild(failed: boolean[]) {
      let low = 0;
      let high = failed.length;
      while (low < high) {
        const mid = low + Math.floor((high - low) / 2);
        if (failed[mid]) high = mid;
        else low = mid + 1;
      }
      return low === failed.length ? -1 : low;
    }
  python: |
    def first_failing_build(failed):
        low, high = 0, len(failed)
        while low < high:
            mid = low + (high - low) // 2
            if failed[mid]:
                high = mid
            else:
                low = mid + 1
        return -1 if low == len(failed) else low
reference:
  language: js
  source: |
    export function firstFailingBuild(failed) {
      let low = 0;
      let high = failed.length;
      while (low < high) {
        const mid = low + Math.floor((high - low) / 2);
        if (failed[mid]) high = mid;
        else low = mid + 1;
      }
      return low === failed.length ? -1 : low;
    }
decoy:
  language: js
  source: |
    export function firstFailingBuild(failed) {
      let low = 0;
      let high = failed.length - 1;
      while (low <= high) {
        const mid = low + Math.floor((high - low) / 2);
        if (failed[mid]) return mid;
        low = mid + 1;
      }
      return -1;
    }
---

A build history is already ordered from oldest to newest. Each boolean says whether that build failed. Once a build fails, every later build in this particular history fails. Find the zero-based index of the first failure or return `-1` if there is none. Use binary search so the work grows logarithmically with history length. An empty history has no failure.

`firstFailingBuild([false,false,false,true,true])` returns `3`. Leave the inputs unchanged.
