---
title: "Build an ordered test matrix"
kind: code
topic: test-data
difficulty: medium
minutes: 20
roles: [automation, sdet]
exportName: buildTestMatrix
starters:
  js: |
    export function buildTestMatrix(axes) {
    }
  ts: |
    export function buildTestMatrix(axes: string[][]) {
    }
  python: |
    def build_test_matrix(axes):
        pass
vectors:
  - name: two-parameter-matrix
    args: [[["firefox","chromium"],["en","fr"]]]
    expected: [["firefox","en"],["firefox","fr"],["chromium","en"],["chromium","fr"]]
  - name: one-axis
    args: [[["live","stub"]]]
    expected: [["live"],["stub"]]
  - name: duplicates-within-axis
    args: [[["A","A","a"],["on","on"]]]
    expected: [["A","on"],["a","on"]]
  - name: empty-last-axis
    args: [[["mobile"],[]]]
    expected: []
  - name: default-run
    args: [[]]
    expected: [[]]
  - name: empty-first-axis
    args: [[[],["on"]]]
    expected: []
  - name: unicode-and-empty-label
    args: [[["表",""],["normal","表"]]]
    expected: [["表","normal"],["表","表"],["","normal"],["","表"]]
  - name: later-axis-varies-faster
    args: [[["pre","prod"],["on","off"],["guest","member"]]]
    expected: [["pre","on","guest"],["pre","on","member"],["pre","off","guest"],["pre","off","member"],["prod","on","guest"],["prod","on","member"],["prod","off","guest"],["prod","off","member"]]
solutions:
  js: |
    export function buildTestMatrix(axes) {
      let matrix = [[]];
      for (const axis of axes) {
        const values = [...new Set(axis)];
        const next = [];
        for (const prefix of matrix) {
          for (const value of values) next.push([...prefix, value]);
        }
        matrix = next;
      }
      return matrix;
    }
  ts: |
    export function buildTestMatrix(axes: string[][]) {
      let matrix: string[][] = [[]];
      for (const axis of axes) {
        const values = [...new Set(axis)];
        const next: string[][] = [];
        for (const prefix of matrix) {
          for (const value of values) next.push([...prefix, value]);
        }
        matrix = next;
      }
      return matrix;
    }
  python: |
    def build_test_matrix(axes):
        matrix = [[]]
        for axis in axes:
            values = list(dict.fromkeys(axis))
            matrix = [prefix + [value] for prefix in matrix for value in values]
        return matrix
reference:
  language: js
  source: |
    export function buildTestMatrix(axes) {
      let matrix = [[]];
      for (const axis of axes) {
        const values = [...new Set(axis)];
        const next = [];
        for (const prefix of matrix) {
          for (const value of values) next.push([...prefix, value]);
        }
        matrix = next;
      }
      return matrix;
    }
decoy:
  language: js
  source: |
    export function buildTestMatrix(axes) {
      if (axes.length === 0) return [];
      let matrix = [[]];
      for (const axis of axes) {
        const values = [...new Set(axis)];
        matrix = matrix.flatMap((prefix) => values.map((value) => [...prefix, value]));
      }
      return matrix;
    }
---

A QA runner receives ordered lists of possible values for each test parameter. Return every tuple that picks one value per axis, with positions in axis order. Within each axis, remove exact duplicate strings while keeping the first occurrence. Generate tuples with the first axis changing slowest and the last axis changing fastest. If any axis is empty, there are no tuples. If there are zero axes, return one empty tuple to represent the default run.

`buildTestMatrix([["firefox","chromium"],["en","fr"]])` returns `[["firefox","en"],["firefox","fr"],["chromium","en"],["chromium","fr"]]`. Leave the inputs unchanged.
