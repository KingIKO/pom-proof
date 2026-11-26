---
title: "Compare parsed JSON responses"
kind: code
topic: api
difficulty: medium
minutes: 20
roles: [automation, sdet]
exportName: equalJsonResponses
starters:
  js: |
    export function equalJsonResponses(left, right) {
    }
  ts: |
    type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

    export function equalJsonResponses(left: Json, right: Json) {
    }
  python: |
    def equal_json_responses(left, right):
        pass
vectors:
  - name: matching-response
    args: [{"state":"paid","items":[1,2]},{"state":"paid","items":[1,2]}]
    expected: true
  - name: different-array-order
    args: [[1,2],[2,1]]
    expected: false
  - name: missing-key-and-null
    args: [{"user":null},{}]
    expected: false
  - name: primitive-match
    args: [4.25,4.25]
    expected: true
  - name: different-key-order
    args: [{"user":"Zoë","nested":[{"ready":true,"retries":1}]},{"nested":[{"retries":1,"ready":true}],"user":"Zoë"}]
    expected: true
  - name: boolean-is-not-number
    args: [{"ready":true},{"ready":1}]
    expected: false
  - name: array-is-not-object
    args: [[3],{"0":3}]
    expected: false
  - name: empty-objects
    args: [{},{}]
    expected: true
solutions:
  js: |
    export function equalJsonResponses(left, right) {
      const same = (a, b) => {
        if (a === b) return true;
        if (Array.isArray(a)) {
          return Array.isArray(b) && a.length === b.length && a.every((value, index) => same(value, b[index]));
        }
        if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(b)) return false;
        const keys = Object.keys(a);
        return keys.length === Object.keys(b).length
          && keys.every((key) => Object.hasOwn(b, key) && same(a[key], b[key]));
      };
      return same(left, right);
    }
  ts: |
    type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

    export function equalJsonResponses(left: Json, right: Json) {
      const same = (a: Json, b: Json): boolean => {
        if (a === b) return true;
        if (Array.isArray(a)) {
          return Array.isArray(b) && a.length === b.length && a.every((value, index) => same(value, b[index]));
        }
        if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(b)) return false;
        const keys = Object.keys(a);
        return keys.length === Object.keys(b).length
          && keys.every((key) => Object.hasOwn(b, key) && same(a[key], b[key]));
      };
      return same(left, right);
    }
  python: |
    def equal_json_responses(left, right):
        def same(a, b):
            if type(a) in (int, float) and type(b) in (int, float):
                return a == b
            if type(a) is not type(b):
                return False
            if isinstance(a, dict):
                return a.keys() == b.keys() and all(same(a[key], b[key]) for key in a)
            if isinstance(a, list):
                return len(a) == len(b) and all(same(x, y) for x, y in zip(a, b))
            return a == b
        return same(left, right)
reference:
  language: js
  source: |
    export function equalJsonResponses(left, right) {
      const same = (a, b) => {
        if (a === b) return true;
        if (Array.isArray(a)) {
          return Array.isArray(b) && a.length === b.length && a.every((value, index) => same(value, b[index]));
        }
        if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(b)) return false;
        const keys = Object.keys(a);
        return keys.length === Object.keys(b).length
          && keys.every((key) => Object.hasOwn(b, key) && same(a[key], b[key]));
      };
      return same(left, right);
    }
decoy:
  language: js
  source: |
    export function equalJsonResponses(left, right) {
      return JSON.stringify(left) === JSON.stringify(right);
    }
---

Return whether two parsed JSON responses have equal values. Match objects by their exact keys and compare each matching value recursively, ignoring key order. Arrays must have the same length and equal values at every position. Primitives compare by JSON type and value: `null` equals only `null`, booleans differ from numbers, and strings compare exactly. JSON numbers compare by numeric value, so `1` and `1.0` are equal. Integers in the fixtures are within the safe integer range. A missing key is different from a key with value `null`.

`equalJsonResponses({"state":"paid","items":[1,2]}, {"state":"paid","items":[1,2]})` returns `true`. Leave the inputs unchanged.
