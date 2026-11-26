---
title: "Compare release versions"
kind: code
topic: ci
difficulty: medium
minutes: 20
roles: [automation, sdet]
exportName: compareReleaseVersions
starters:
  js: |
    export function compareReleaseVersions(left, right) {
    }
  ts: |
    export function compareReleaseVersions(left: string, right: string) {
    }
  python: |
    def compare_release_versions(left, right):
        pass
vectors:
  - name: numeric-minor
    args: ["1.10.0","1.9.9"]
    expected: 1
  - name: build-metadata-ties
    args: ["2.1.0+run.33","2.1.0+run.34"]
    expected: 0
  - name: patch-order
    args: ["3.0.0","3.0.1"]
    expected: -1
  - name: same-prerelease
    args: ["1.0.0-rc.1+a","1.0.0-rc.1+b"]
    expected: 0
  - name: prerelease-below-release
    args: ["2.0.0-rc.1","2.0.0"]
    expected: -1
  - name: prerelease-identifier-types
    args: ["2.0.0-alpha.9","2.0.0-alpha.A"]
    expected: -1
  - name: prerelease-prefix
    args: ["2.0.0-qa-fast","2.0.0-qa-fast.1"]
    expected: -1
  - name: long-core-number
    args: ["9007199254740992.0.0","9007199254740993.0.0"]
    expected: -1
  - name: long-prerelease-number
    args: ["1.0.0-9007199254740992","1.0.0-9007199254740993"]
    expected: -1
  - name: prerelease-numeric-order
    args: ["1.0.0-rc.11","1.0.0-rc.9"]
    expected: 1
solutions:
  js: |
    export function compareReleaseVersions(left, right) {
      const ascii = (a, b) => a < b ? -1 : a > b ? 1 : 0;
      const number = (a, b) => Math.sign(a.length - b.length) || ascii(a, b);
      const parts = (version) => {
        const [clean] = version.split('+', 1);
        const dash = clean.indexOf('-');
        return {
          core: (dash < 0 ? clean : clean.slice(0, dash)).split('.'),
          pre: dash < 0 ? [] : clean.slice(dash + 1).split('.'),
        };
      };
      const a = parts(left);
      const b = parts(right);
      for (let i = 0; i < 3; i++) {
        const order = number(a.core[i], b.core[i]);
        if (order) return order;
      }
      if (a.pre.length === 0 || b.pre.length === 0) return Math.sign(b.pre.length - a.pre.length);
      for (let i = 0; i < Math.min(a.pre.length, b.pre.length); i++) {
        const x = a.pre[i], y = b.pre[i];
        const xn = /^[0-9]+$/.test(x), yn = /^[0-9]+$/.test(y);
        const order = xn && yn ? number(x, y) : xn !== yn ? (xn ? -1 : 1) : ascii(x, y);
        if (order) return order;
      }
      return Math.sign(a.pre.length - b.pre.length);
    }
  ts: |
    export function compareReleaseVersions(left: string, right: string) {
      const ascii = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
      const number = (a: string, b: string) => Math.sign(a.length - b.length) || ascii(a, b);
      const parts = (version: string) => {
        const [clean] = version.split('+', 1);
        const dash = clean.indexOf('-');
        return {
          core: (dash < 0 ? clean : clean.slice(0, dash)).split('.'),
          pre: dash < 0 ? [] : clean.slice(dash + 1).split('.'),
        };
      };
      const a = parts(left);
      const b = parts(right);
      for (let i = 0; i < 3; i++) {
        const order = number(a.core[i], b.core[i]);
        if (order) return order;
      }
      if (a.pre.length === 0 || b.pre.length === 0) return Math.sign(b.pre.length - a.pre.length);
      for (let i = 0; i < Math.min(a.pre.length, b.pre.length); i++) {
        const x = a.pre[i], y = b.pre[i];
        const xn = /^[0-9]+$/.test(x), yn = /^[0-9]+$/.test(y);
        const order = xn && yn ? number(x, y) : xn !== yn ? (xn ? -1 : 1) : ascii(x, y);
        if (order) return order;
      }
      return Math.sign(a.pre.length - b.pre.length);
    }
  python: |
    def compare_release_versions(left, right):
        def compare(a, b):
            return (a > b) - (a < b)
        def number(a, b):
            return compare(len(a), len(b)) or compare(a, b)
        def parts(version):
            core, _, pre = version.split("+", 1)[0].partition("-")
            return core.split("."), pre.split(".") if pre else []
        a_core, a_pre = parts(left)
        b_core, b_pre = parts(right)
        for a, b in zip(a_core, b_core):
            order = number(a, b)
            if order:
                return order
        if not a_pre or not b_pre:
            return compare(len(b_pre), len(a_pre))
        for a, b in zip(a_pre, b_pre):
            an, bn = a.isdigit(), b.isdigit()
            order = number(a, b) if an and bn else compare(bn, an) if an != bn else compare(a, b)
            if order:
                return order
        return compare(len(a_pre), len(b_pre))
reference:
  language: js
  source: |
    export function compareReleaseVersions(left, right) {
      const ascii = (a, b) => a < b ? -1 : a > b ? 1 : 0;
      const number = (a, b) => Math.sign(a.length - b.length) || ascii(a, b);
      const parts = (version) => {
        const [clean] = version.split('+', 1);
        const dash = clean.indexOf('-');
        return {
          core: (dash < 0 ? clean : clean.slice(0, dash)).split('.'),
          pre: dash < 0 ? [] : clean.slice(dash + 1).split('.'),
        };
      };
      const a = parts(left);
      const b = parts(right);
      for (let i = 0; i < 3; i++) {
        const order = number(a.core[i], b.core[i]);
        if (order) return order;
      }
      if (a.pre.length === 0 || b.pre.length === 0) return Math.sign(b.pre.length - a.pre.length);
      for (let i = 0; i < Math.min(a.pre.length, b.pre.length); i++) {
        const x = a.pre[i], y = b.pre[i];
        const xn = /^[0-9]+$/.test(x), yn = /^[0-9]+$/.test(y);
        const order = xn && yn ? number(x, y) : xn !== yn ? (xn ? -1 : 1) : ascii(x, y);
        if (order) return order;
      }
      return Math.sign(a.pre.length - b.pre.length);
    }
decoy:
  language: js
  source: |
    export function compareReleaseVersions(left, right) {
      const core = (v) => v.split(/[+-]/, 1)[0].split('.').map(Number);
      const a = core(left), b = core(right);
      for (let i = 0; i < 3; i++) {
        if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
      }
      return 0;
    }
---

Compare two valid Semantic Versioning 2.0.0 strings. Return `-1` if the left version has lower precedence, `1` if it has higher precedence, or `0` if they tie. Ignore build metadata after `+`.

Compare major, minor, and patch as integers in that order. For equal core versions, a release without a prerelease has higher precedence. Compare prerelease identifiers left to right: two numeric identifiers use integer order, a numeric identifier ranks below every nonnumeric one, and two nonnumeric identifiers use ASCII text order. If all shared identifiers are equal, the shorter list ranks lower. Numeric parts may exceed JavaScript's safe integer range, so keep exact ordering without converting them to floating-point values.

`compareReleaseVersions("1.10.0", "1.9.9")` returns `1`. Leave the inputs unchanged.
