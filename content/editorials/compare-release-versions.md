---
problem: code/compare-release-versions
---

## What is going on

A release report needs to know which of two versions comes first under Semantic Versioning 2.0.0. That ordering is called precedence. Both input strings are already valid versions. Build metadata, the part after `+`, can differ without changing precedence. A numeric field can also be too large for a JavaScript `Number` to compare exactly.

## The fix

1. After dropping the build suffix, split each version at its first dash into core fields and prerelease identifiers, all kept as strings.

   **Why:** The core is the major, minor, and patch numbers before the dash. A prerelease identifier is one dot-separated part after it. `build-metadata-ties` and `same-prerelease` change only text that has no effect on precedence. Splitting at the first dash keeps `qa-fast` whole in `prerelease-prefix`. The original versions stay available for display.

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

2. Compare the core fields from major through patch, by length first and then by digits, and return at the first difference.

   **Why:** Valid numeric identifiers have no leading zeroes, so a longer one is a greater number. Length alone handles `numeric-minor`, where `10` outranks `9`. When two lengths match, comparing the digits as text puts them in number order. That text comparison tells apart the equal-length neighbors in `long-core-number` without rounding.

   ```js
   const ascii = (a, b) => a < b ? -1 : a > b ? 1 : 0;
   const number = (a, b) => Math.sign(a.length - b.length) || ascii(a, b);
   const a = parts(left), b = parts(right);
   for (let i = 0; i < 3; i++) {
     const order = number(a.core[i], b.core[i]);
     if (order) return order;
   }
   ```

3. When the cores tie, rank a final release, which has no prerelease, above any prerelease. When both are prereleases, compare their identifiers in order.

   **Why:** The rule that a shorter list ranks lower applies only between two prereleases, so it cannot make the final release lose in `prerelease-below-release`. A numeric identifier ranks below a nonnumeric one, and `prerelease-identifier-types` tests that mixed-type rule. List length decides only after every shared identifier ties, which `prerelease-prefix` tests. `long-prerelease-number` needs the same exact number comparison as the core.

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

The tempting shortcut converts the core to numbers and stops there. In `long-core-number`, two neighboring values collapse into one `Number`, so the shortcut sees no difference. It also throws away the prerelease. That creates false ties in `prerelease-below-release`, `prerelease-identifier-types`, and `prerelease-prefix`. It skips numeric precedence altogether in `long-prerelease-number` and `prerelease-numeric-order`.

## What the interviewer listens for

Explain why `rc.11` outranks `rc.9`, even though plain text order says the opposite. Checking that a version is valid would need its own error contract, a defined way to report bad input. Here, precedence starts from versions that are already valid.

## Sources

- [Semantic Versioning 2.0.0: Rule 11, precedence](https://semver.org/#spec)
- [MDN: Number.isSafeInteger()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger)
- [MDN: Less than operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than)
