---
problem: code/compare-release-versions
---

## What is going on

A release report needs precedence under Semantic Versioning 2.0.0. The input strings are already valid. Build metadata can differ without changing precedence, and a numeric field can be too large for an exact JavaScript `Number` comparison.

## The fix

1. Discard the build suffix and split on the first prerelease dash. Keep the core fields and prerelease identifiers as strings.

   **Why:** `build-metadata-ties` and `same-prerelease` change only text that has no effect on precedence. Splitting on the first dash keeps `qa-fast` intact in `prerelease-prefix`. The original versions stay available for display.

   ```js
   const parts = (version) => {
     const [clean] = version.split('+', 1);
     const dash = clean.indexOf('-');
     return {
       core: (dash < 0 ? clean : clean.slice(0, dash)).split('.'),
       pre: dash < 0 ? [] : clean.slice(dash + 1).split('.'),
     };
   };
   ```

2. Compare the core from major through patch, returning on the first difference. For numeric strings, compare lengths, then compare digits if lengths tie.

   **Why:** Valid numeric identifiers have no leading zeroes, so a longer one represents a greater number. Text comparison distinguishes equal-length neighbors in `long-core-number` without rounding, and length handles `numeric-minor`, where `10` outranks `9`.

   ```js
   const ascii = (a, b) => a < b ? -1 : a > b ? 1 : 0;
   const number = (a, b) => Math.sign(a.length - b.length) || ascii(a, b);
   const a = parts(left), b = parts(right);
   for (let i = 0; i < 3; i++) {
     const order = number(a.core[i], b.core[i]);
     if (order) return order;
   }
   ```

3. On a core tie, put the final release above any prerelease. For two prereleases, compare shared identifiers, with numeric below nonnumeric, and use list length only after a shared-prefix tie.

   **Why:** The shorter-list rule applies inside prereleases, so it cannot make the final release lose in `prerelease-below-release`. `prerelease-identifier-types` tests the mixed-type rule, `prerelease-prefix` tests the last tie-break, and `long-prerelease-number` needs the same exact numeric comparator as the core.

   ```js
   if (a.pre.length === 0 || b.pre.length === 0) return Math.sign(b.pre.length - a.pre.length);
   for (let i = 0; i < Math.min(a.pre.length, b.pre.length); i++) {
     const x = a.pre[i], y = b.pre[i];
     const xn = /^[0-9]+$/.test(x), yn = /^[0-9]+$/.test(y);
     const order = xn && yn ? number(x, y) : xn !== yn ? (xn ? -1 : 1) : ascii(x, y);
     if (order) return order;
   }
   return Math.sign(a.pre.length - b.pre.length);
   ```

## Why the tempting answer fails

The shortcut converts the core to numbers and stops. `long-core-number` catches two neighbors collapsing into one value. Throwing away prerelease information creates false ties in `prerelease-below-release`, `prerelease-identifier-types`, and `prerelease-prefix`. It also bypasses numeric precedence altogether in `long-prerelease-number` and `prerelease-numeric-order`.

## What the interviewer listens for

Explain why `rc.11` outranks `rc.9` even though plain text order says otherwise. Validation would need a separate error contract; precedence here starts with valid versions.

## Sources

- [Semantic Versioning 2.0.0: Rule 11, precedence](https://semver.org/#spec)
- [MDN: Number.isSafeInteger()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger)
- [MDN: Less than operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than)
