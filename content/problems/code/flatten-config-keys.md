---
title: "List config leaf paths"
kind: code
topic: test-data
difficulty: medium
minutes: 20
roles: [automation, sdet]
exportName: flattenConfigKeys
starters:
  js: |
    export function flattenConfigKeys(config) {
    }
  ts: |
    type Config = { [key: string]: Config | unknown[] | string | number | boolean | null };

    export function flattenConfigKeys(config: Config) {
    }
  python: |
    def flatten_config_keys(config):
        pass
vectors:
  - name: nested-flags
    args: [{"beta":{"banner":true,"timeout":200},"staging":false}]
    expected: ["beta.banner","beta.timeout","staging"]
  - name: array-is-a-leaf
    args: [{"flags":[{"alpha":true}],"time":{"delay":null}}]
    expected: ["flags","time.delay"]
  - name: ordering
    args: [{"z":10,"A":0,"a":5}]
    expected: ["A","a","z"]
  - name: empty-root
    args: [{}]
    expected: []
  - name: empty-nested-object
    args: [{"web":{"overrides":{},"browsers":[],"enabled":false}}]
    expected: ["web.browsers","web.enabled","web.overrides"]
  - name: numeric-keys
    args: [{"2":"y","10":"x","namespace":{"5":0,"12":0}}]
    expected: ["10","2","namespace.12","namespace.5"]
  - name: deep-nesting
    args: [{"server":{"auth":{"rules":{"active":{"roles":[]}}}}}]
    expected: ["server.auth.rules.active.roles"]
  - name: distinct-prefixes
    args: [{"a-b":{"c":2},"a":{"b-c":3}}]
    expected: ["a-b.c","a.b-c"]
solutions:
  js: |
    export function flattenConfigKeys(config) {
      const paths = [];
      const visit = (object, prefix) => {
        for (const [key, value] of Object.entries(object)) {
          const path = prefix ? prefix + '.' + key : key;
          if (value !== null && typeof value === 'object' && Array.isArray(value) === false && Object.keys(value).length) {
            visit(value, path);
          } else {
            paths.push(path);
          }
        }
      };
      visit(config, '');
      return paths.sort();
    }
  ts: |
    type Config = { [key: string]: Config | unknown[] | string | number | boolean | null };

    export function flattenConfigKeys(config: Config) {
      const paths: string[] = [];
      const visit = (object: Config, prefix: string) => {
        for (const [key, value] of Object.entries(object)) {
          const path = prefix ? prefix + '.' + key : key;
          if (value !== null && typeof value === 'object' && Array.isArray(value) === false && Object.keys(value).length) {
            visit(value, path);
          } else {
            paths.push(path);
          }
        }
      };
      visit(config, '');
      return paths.sort();
    }
  python: |
    def flatten_config_keys(config):
        paths = []
        def visit(obj, prefix):
            for key, value in obj.items():
                path = f"{prefix}.{key}" if prefix else key
                if isinstance(value, dict) and value:
                    visit(value, path)
                else:
                    paths.append(path)
        visit(config, "")
        return sorted(paths)
reference:
  language: js
  source: |
    export function flattenConfigKeys(config) {
      const paths = [];
      const visit = (object, prefix) => {
        for (const [key, value] of Object.entries(object)) {
          const path = prefix ? prefix + '.' + key : key;
          if (value !== null && typeof value === 'object' && Array.isArray(value) === false && Object.keys(value).length) {
            visit(value, path);
          } else {
            paths.push(path);
          }
        }
      };
      visit(config, '');
      return paths.sort();
    }
decoy:
  language: js
  source: |
    export function flattenConfigKeys(config) {
      const paths = [];
      const visit = (object, prefix) => {
        for (const [key, value] of Object.entries(object)) {
          const path = prefix ? prefix + '.' + key : key;
          if (value !== null && typeof value === 'object' && Array.isArray(value) === false) visit(value, path);
          else paths.push(path);
        }
      };
      visit(config, '');
      return paths.sort();
    }
---

A configuration audit needs the dot-separated paths to leaf settings in a JSON object. Recurse into nonempty objects only. Treat arrays of any size, `null`, primitives, and empty objects below the root as leaves. The empty root produces no paths. Object keys are nonempty ASCII strings containing letters, digits, underscores, or hyphens, so a dot always separates path segments. Return the paths sorted by ascending ASCII text order.

`flattenConfigKeys({"beta":{"banner":true,"timeout":200},"staging":false})` returns `["beta.banner","beta.timeout","staging"]`. Leave the inputs unchanged.
