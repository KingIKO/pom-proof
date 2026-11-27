---
problem: diagnosis/shipment-order-not-guaranteed
---

## What is going on

The panel shows `Shipments loaded` only after the full list appears. Both labels in the response are visible. The traces, records of each run, show `Warehouse pickup` and `Evening delivery` in opposite orders. The product requires the panel to show every shipment once. It leaves the order up to the panel.

## The answer

1. The assertion, the test's check of the list, requires a fixed order that the panel does not promise.

   **Why:** The response and the panel show the same two labels in the same order. The loaded marker rules out a partial list on this run. Compared with the passing trace, only the order differs.

2. Once the panel shows the loaded marker, compare sorted copies of the full expected and displayed arrays, or lists of labels.

   **Why:** Using the same sort on both copies makes matching lists equal in either display order. The original lists stay unchanged. The copies keep duplicates so you can still check how many times each shipment appears. A set keeps only one of each value. For example, sets treat expected `A, B` and displayed `A, B, B` as equal despite the extra entry.

3. Check that two complete responses in opposite orders produce complete lists in those same orders.

   The new assertion should pass for both orders. It should fail if the test data repeats one label in place of the other.

   **Why:** Both orders should pass because the product permits either. The repeated-label case keeps the same number of cards, so it shows whether the assertion still catches a missing or extra label.

## Why the tempting answer fails

The decoy correctly identifies the order assumption and asks for both label orders. Sorting the output in the product changes what customers see just to pass the test. Require a specific order only if the product adds that rule. Counting two cards does not tell you which shipments they represent. Retrying just waits for the preferred order to appear again.

## What the interviewer listens for

Explain how you tell when the list is ready. Show that checking which shipments appear is separate from checking their order. Give a case with the right number of cards and the wrong labels.

## Sources

- [Playwright: `allTextContents`](https://playwright.dev/docs/api/class-locator#locator-all-text-contents)
- [MDN: `Array.prototype.sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [ECMAScript: `Array.prototype.sort`](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.sort)
