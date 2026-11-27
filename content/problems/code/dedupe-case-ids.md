---
title: "Remove repeated test IDs from a rerun queue"
kind: code
topic: test-data
difficulty: easy
minutes: 10
roles: [automation, sdet]
exportName: dedupeCaseIds
starters:
  js: |
    export function dedupeCaseIds(ids) {
    }
  ts: |
    export function dedupeCaseIds(ids: string[]) {
    }
  python: |
    def dedupe_case_ids(ids):
        pass
vectors:
  - name: basic-repeat
    args: [["api-1","api-1","api-2"]]
    expected: ["api-1","api-2"]
  - name: already-distinct
    args: [["cart","checkout","profile"]]
    expected: ["cart","checkout","profile"]
  - name: one-id
    args: [["a"]]
    expected: ["a"]
  - name: repeats-at-end
    args: [["a","b","c","a","b"]]
    expected: ["a","b","c"]
  - name: queue-priority
    args: [["z-first","a-second","z-first"]]
    expected: ["z-first","a-second"]
  - name: unicode-and-case
    args: [["É","é","é","É","e"]]
    expected: ["É","é","é","e"]
  - name: space-and-empty
    args: [[" ",""," ",""]]
    expected: [" ",""]
  - name: empty-queue
    args: [[]]
    expected: []
solutions:
  js: |
    export function dedupeCaseIds(ids) {
      return [...new Set(ids)];
    }
  ts: |
    export function dedupeCaseIds(ids: string[]) {
      return [...new Set(ids)];
    }
  python: |
    def dedupe_case_ids(ids):
        return list(dict.fromkeys(ids))
reference:
  language: js
  source: |
    export function dedupeCaseIds(ids) {
      return [...new Set(ids)];
    }
decoy:
  language: js
  source: |
    export function dedupeCaseIds(ids) {
      return [...new Set(ids)].sort();
    }
---

Several groups of tests share a list of test cases to run again. Return each case ID once, in the order it first appears. Match IDs exactly, including letter case and how the text is written in Unicode. Spaces, tabs, and all other whitespace must match too.

An ID can be an empty string. If the input is empty, return an empty array. Do not sort the queue or change the spelling or format of IDs.

For example, `dedupeCaseIds(["api-1","api-1","api-2"])` returns `["api-1","api-2"]`. Leave the inputs unchanged.
