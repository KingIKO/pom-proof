---
title: "Find missing capture IDs"
kind: code
topic: test-data
difficulty: easy
minutes: 10
roles: [automation, sdet]
exportName: missingSequenceIds
starters:
  js: |
    export function missingSequenceIds(ids, first, last) {
    }
  ts: |
    export function missingSequenceIds(ids: number[], first: number, last: number) {
    }
  python: |
    def missing_sequence_ids(ids, first, last):
        pass
vectors:
  - name: one-gap
    args: [[14,11,12,14],11,14]
    expected: [13]
  - name: out-of-range-ids
    args: [[99,2,3],1,3]
    expected: [1]
  - name: all-present
    args: [[4,2,3],2,4]
    expected: []
  - name: no-reservation
    args: [[8,9],9,8]
    expected: []
  - name: missing-last
    args: [[20,21],20,22]
    expected: [22]
  - name: empty-list
    args: [[],2,4]
    expected: [2,3,4]
  - name: single-missing-id
    args: [[4],5,5]
    expected: [5]
  - name: safe-integer-limit
    args: [[9007199254740989,9007199254740990],9007199254740989,9007199254740991]
    expected: [9007199254740991]
solutions:
  js: |
    export function missingSequenceIds(ids, first, last) {
      const received = new Set(ids);
      const missing = [];
      for (let id = first; id <= last; id++) {
        if (received.has(id) === false) missing.push(id);
      }
      return missing;
    }
  ts: |
    export function missingSequenceIds(ids: number[], first: number, last: number) {
      const received = new Set(ids);
      const missing: number[] = [];
      for (let id = first; id <= last; id++) {
        if (received.has(id) === false) missing.push(id);
      }
      return missing;
    }
  python: |
    def missing_sequence_ids(ids, first, last):
        received = set(ids)
        return [capture_id for capture_id in range(first, last + 1) if capture_id not in received]
reference:
  language: js
  source: |
    export function missingSequenceIds(ids, first, last) {
      const received = new Set(ids);
      const missing = [];
      for (let id = first; id <= last; id++) {
        if (received.has(id) === false) missing.push(id);
      }
      return missing;
    }
decoy:
  language: js
  source: |
    export function missingSequenceIds(ids, first, last) {
      const received = new Set(ids);
      const missing = [];
      for (let id = first; id < last; id++) {
        if (received.has(id) === false) missing.push(id);
      }
      return missing;
    }
---

A test collector reserves capture IDs from `first` through `last`, inclusive. The received list is unsorted and can contain repeats and IDs from other runs. Return the reserved IDs that never appear, in ascending order. All values are nonnegative safe integers. The reservation contains at most 200 IDs when nonempty. If `first > last`, there was no reservation, so return an empty array.

`missingSequenceIds([14,11,12,14], 11, 14)` returns `[13]`. Leave the inputs unchanged.
