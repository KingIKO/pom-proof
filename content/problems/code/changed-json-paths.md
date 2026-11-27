---
title: "Find where two JSON values differ"
kind: code
topic: api
difficulty: hard
minutes: 30
roles: [automation, sdet, senior]
exportName: changedJsonPaths
starters:
  js: |
    export function changedJsonPaths(before, after) {
    }
  ts: |
    type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
    type JsonObject = { [key: string]: Json };

    export function changedJsonPaths(before: Json, after: Json) {
    }
  python: |
    def changed_json_paths(before, after):
        pass
vectors:
  - name: nested-change-and-addition
    args: [{"cart":{"qty":1}},{"cart":{"qty":2,"coupon":null}}]
    expected: ["/cart/coupon","/cart/qty"]
  - name: array-position-and-extra-item
    args: [{"tags":["old"]},{"tags":["new","next"]}]
    expected: ["/tags/0","/tags/1"]
  - name: reordered-keys
    args: [{"a":1,"b":{"ok":true}},{"b":{"ok":true},"a":1}]
    expected: []
  - name: root-type-change
    args: [[1],{"0":1}]
    expected: [""]
  - name: escaping-and-empty-key
    args: [{"a/b":{"~flag":1},"~1":1,"":1},{"a/b":{"~flag":2},"~1":2,"":2}]
    expected: ["/","/a~1b/~0flag","/~01"]
  - name: missing-and-type-change
    args: [{"entry":null,"remove":{"leaf":1,"other":2}},{"entry":true,"add":[1,2]}]
    expected: ["/add","/entry","/remove"]
  - name: code-point-sort
    args: [{"2":0,"11":0,"":0,"𐀀":0},{"2":1,"11":1,"":1,"𐀀":1}]
    expected: ["/11","/2","/","/𐀀"]
  - name: boolean-and-number
    args: [{"data":[false,1]},{"data":[0,1]}]
    expected: ["/data/0"]
  - name: equal-empty-values
    args: [{"empty":[],"shape":{}},{"shape":{},"empty":[]}]
    expected: []
  - name: large-number-difference
    args: [{"count":9007199254740990},{"count":9007199254740991}]
    expected: ["/count"]
solutions:
  js: |
    export function changedJsonPaths(before, after) {
      const paths = [];
      const isObject = (value) =>
        value !== null && typeof value === 'object' && Array.isArray(value) === false;
      const escape = (key) => key.replaceAll('~', '~0').replaceAll('/', '~1');
      const visit = (a, b, path) => {
        if (a === b) return;
        if (Array.isArray(a) && Array.isArray(b)) {
          for (let i = 0; i < Math.max(a.length, b.length); i++) {
            const next = path + '/' + i;
            if (i >= a.length || i >= b.length) paths.push(next);
            else visit(a[i], b[i], next);
          }
        } else if (isObject(a) && isObject(b)) {
          for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
            const next = path + '/' + escape(key);
            if (Object.hasOwn(a, key) && Object.hasOwn(b, key)) visit(a[key], b[key], next);
            else paths.push(next);
          }
        } else paths.push(path);
      };
      visit(before, after, '');
      return paths.sort((a, b) => {
        const x = Array.from(a, (char) => char.codePointAt(0) ?? 0);
        const y = Array.from(b, (char) => char.codePointAt(0) ?? 0);
        for (let i = 0; i < Math.min(x.length, y.length); i++) {
          if (x[i] !== y[i]) return x[i] - y[i];
        }
        return x.length - y.length;
      });
    }
  ts: |
    type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
    type JsonObject = { [key: string]: Json };

    export function changedJsonPaths(before: Json, after: Json) {
      const paths: string[] = [];
      const isObject = (value: Json): value is JsonObject =>
        value !== null && typeof value === 'object' && Array.isArray(value) === false;
      const escape = (key: string) => key.replaceAll('~', '~0').replaceAll('/', '~1');
      const visit = (a: Json, b: Json, path: string): void => {
        if (a === b) return;
        if (Array.isArray(a) && Array.isArray(b)) {
          for (let i = 0; i < Math.max(a.length, b.length); i++) {
            const next = path + '/' + i;
            if (i >= a.length || i >= b.length) paths.push(next);
            else visit(a[i], b[i], next);
          }
        } else if (isObject(a) && isObject(b)) {
          for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
            const next = path + '/' + escape(key);
            if (Object.hasOwn(a, key) && Object.hasOwn(b, key)) visit(a[key], b[key], next);
            else paths.push(next);
          }
        } else paths.push(path);
      };
      visit(before, after, '');
      return paths.sort((a, b) => {
        const x = Array.from(a, (char) => char.codePointAt(0) ?? 0);
        const y = Array.from(b, (char) => char.codePointAt(0) ?? 0);
        for (let i = 0; i < Math.min(x.length, y.length); i++) {
          if (x[i] !== y[i]) return x[i] - y[i];
        }
        return x.length - y.length;
      });
    }
  python: |
    def changed_json_paths(before, after):
        paths = []
        def visit(a, b, path):
            if isinstance(a, list) and isinstance(b, list):
                for index in range(max(len(a), len(b))):
                    child = f"{path}/{index}"
                    if index >= len(a) or index >= len(b):
                        paths.append(child)
                    else:
                        visit(a[index], b[index], child)
            elif isinstance(a, dict) and isinstance(b, dict):
                for key in a.keys() | b.keys():
                    child = path + "/" + key.replace("~", "~0").replace("/", "~1")
                    if key in a and key in b:
                        visit(a[key], b[key], child)
                    else:
                        paths.append(child)
            elif type(a) in (int, float) and type(b) in (int, float):
                if a != b:
                    paths.append(path)
            elif type(a) is not type(b) or a != b:
                paths.append(path)
        visit(before, after, "")
        return sorted(paths)
reference:
  language: js
  source: |
    export function changedJsonPaths(before, after) {
      const paths = [];
      const isObject = (value) =>
        value !== null && typeof value === 'object' && Array.isArray(value) === false;
      const escape = (key) => key.replaceAll('~', '~0').replaceAll('/', '~1');
      const visit = (a, b, path) => {
        if (a === b) return;
        if (Array.isArray(a) && Array.isArray(b)) {
          for (let i = 0; i < Math.max(a.length, b.length); i++) {
            const next = path + '/' + i;
            if (i >= a.length || i >= b.length) paths.push(next);
            else visit(a[i], b[i], next);
          }
        } else if (isObject(a) && isObject(b)) {
          for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
            const next = path + '/' + escape(key);
            if (Object.hasOwn(a, key) && Object.hasOwn(b, key)) visit(a[key], b[key], next);
            else paths.push(next);
          }
        } else paths.push(path);
      };
      visit(before, after, '');
      return paths.sort((a, b) => {
        const x = Array.from(a, (char) => char.codePointAt(0) ?? 0);
        const y = Array.from(b, (char) => char.codePointAt(0) ?? 0);
        for (let i = 0; i < Math.min(x.length, y.length); i++) {
          if (x[i] !== y[i]) return x[i] - y[i];
        }
        return x.length - y.length;
      });
    }
decoy:
  language: js
  source: |
    export function changedJsonPaths(before, after) {
      const paths = [];
      const isObject = (value) => value !== null && typeof value === 'object' && Array.isArray(value) === false;
      const visit = (a, b, path) => {
        if (a === b) return;
        if (Array.isArray(a) && Array.isArray(b)) {
          for (let i = 0; i < Math.max(a.length, b.length); i++) {
            if (i >= a.length || i >= b.length) paths.push(path + '/' + i);
            else visit(a[i], b[i], path + '/' + i);
          }
        } else if (isObject(a) && isObject(b)) {
          for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
            const next = path + '/' + key;
            if (Object.hasOwn(a, key) && Object.hasOwn(b, key)) visit(a[key], b[key], next);
            else paths.push(next);
          }
        } else paths.push(path);
      };
      visit(before, after, '');
      return paths.sort();
    }
---

A response snapshot test compares saved response data with another response. The inputs are two already parsed JSON values. Each can be an object, an array, or a primitive value such as a string or number. Report the paths, or locations, where the values differ.

Look inside a pair of values only when both are objects or both are arrays. For objects, match keys by exact spelling and ignore key order. For arrays, match items by position, counting from zero. If either side is missing a key or item, report that path once. Do not report paths inside the missing value.

If the JSON types differ, report the current path once. Do the same if two primitive values, such as strings or numbers, differ. Compare numbers by value. Integers fit the safe integer range, where JavaScript can store each integer exactly.

Use JSON Pointer, a format for naming a location in JSON. The root, or whole value, has an empty string for its path. For each level, add `/` followed by the key or array index. In keys, write a literal `~` as `~0` and a literal `/` as `~1`.

A Unicode code point is a number that identifies a unit of text. Strings and keys contain valid Unicode scalar values: code points that exclude the numbers reserved for joining two parts of a character.

Return each path once. Sort the escaped paths from lowest to highest Unicode code point, comparing from left to right. If the inputs are equal, return an empty array.

For example, `changedJsonPaths({"cart":{"qty":1}}, {"cart":{"qty":2,"coupon":null}})` returns `["/cart/coupon","/cart/qty"]`. Leave the inputs unchanged.
