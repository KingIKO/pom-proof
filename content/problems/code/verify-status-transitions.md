---
title: "Find status steps the polling test does not allow"
kind: code
topic: api
difficulty: easy
minutes: 10
roles: [automation, sdet]
exportName: verifyStatusTransitions
starters:
  js: |
    export function verifyStatusTransitions(statuses, allowed) {
    }
  ts: |
    export function verifyStatusTransitions(statuses: number[], allowed: [number, number][]) {
    }
  python: |
    def verify_status_transitions(statuses, allowed):
        pass
vectors:
  - name: valid-completion
    args: [[202,202,200],[[202,202],[202,200]]]
    expected: []
  - name: unlisted-transition
    args: [[202,500,200],[[202,200]]]
    expected: [1,2]
  - name: no-transitions
    args: [[200],[]]
    expected: []
  - name: same-status-requires-pair
    args: [[202,202],[[202,200]]]
    expected: [1]
  - name: reverse-edge-is-invalid
    args: [[200,202,200],[[202,200]]]
    expected: [1]
  - name: check-after-failure
    args: [[202,429,202,202],[[429,202]]]
    expected: [1,3]
  - name: empty-trace
    args: [[],[[202,200]]]
    expected: []
  - name: empty-table
    args: [[200,204,200],[]]
    expected: [1,2]
solutions:
  js: |
    export function verifyStatusTransitions(statuses, allowed) {
      const edges = new Set(allowed.map(([a, b]) => a + ':' + b));
      const badIndices = [];
      for (let index = 1; index < statuses.length; index++) {
        if (edges.has(statuses[index - 1] + ':' + statuses[index]) === false) badIndices.push(index);
      }
      return badIndices;
    }
  ts: |
    export function verifyStatusTransitions(statuses: number[], allowed: [number, number][]) {
      const edges = new Set(allowed.map(([a, b]) => a + ':' + b));
      const badIndices: number[] = [];
      for (let index = 1; index < statuses.length; index++) {
        if (edges.has(statuses[index - 1] + ':' + statuses[index]) === false) badIndices.push(index);
      }
      return badIndices;
    }
  python: |
    def verify_status_transitions(statuses, allowed):
        edges = {tuple(pair) for pair in allowed}
        return [index for index in range(1, len(statuses)) if (statuses[index - 1], statuses[index]) not in edges]
reference:
  language: js
  source: |
    export function verifyStatusTransitions(statuses, allowed) {
      const edges = new Set(allowed.map(([a, b]) => a + ':' + b));
      const badIndices = [];
      for (let index = 1; index < statuses.length; index++) {
        if (edges.has(statuses[index - 1] + ':' + statuses[index]) === false) badIndices.push(index);
      }
      return badIndices;
    }
decoy:
  language: js
  source: |
    export function verifyStatusTransitions(statuses, allowed) {
      const edges = new Set(allowed.map(([a, b]) => a + ':' + b));
      return statuses.flatMap((next, index) => {
        if (index === 0) return [];
        const previous = statuses[index - 1];
        return edges.has(previous + ':' + next) || edges.has(next + ':' + previous) ? [] : [index];
      });
    }
---

An API test polls, or checks repeatedly, and records the HTTP status code from each response in order. The test data lists allowed transitions, or steps from one status to the next, as `[previous, next]` pairs. The order in a pair matters. Both inputs use whole-number status codes supplied by the test data.

Check every pair of neighboring statuses, even after you find a pair that is not allowed. If a status repeats, the pair from that status to itself still needs to be allowed. For each disallowed pair, return the later status's position, counting from zero. Put the positions in ascending order. If there are fewer than two statuses, return an empty array.

For example, `verifyStatusTransitions([202,202,200], [[202,202],[202,200]])` returns `[]`. Leave the inputs unchanged.
