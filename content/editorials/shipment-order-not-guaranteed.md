---
problem: diagnosis/shipment-order-not-guaranteed
---

## What is going on

The `Shipments loaded` marker is visible, and both labels in the response appear in the panel. The pass and fail traces differ in the order of `Warehouse pickup` and `Evening delivery`. The product requires every shipment once and leaves their order unspecified.

## The answer

1. Identify the exact-order assertion as the cause of the reported failure.

   **Why:** The failing response and UI agree, and the loaded marker rules out a partial list in this trace. The comparison treats the reversed sequence as a defect even though neither shipment is missing.

2. Keep the loaded-state check, then compare sorted copies of the full expected and displayed arrays using the same sort.

   **Why:** Sorting the copies removes the order dependency without mutating the originals or losing duplicate counts. With sets, expected `A, B` and actual `A, B, B` can become equal even though the panel shows an extra entry.

3. Verify that settled responses in both orders produce the corresponding complete lists. Check that the new assertion accepts both orders and fails a fixture that duplicates one label in place of the other.

   **Why:** The reversed inputs test that a permitted variation passes. The duplicate fixture tests that the comparison still detects missing or repeated labels when the card count stays the same.

## Why the tempting answer fails

The decoy correctly identifies the order assumption and asks for both permutations. Sorting the product output changes what customers see to satisfy the test; require a particular sequence only if the product adds that rule. Counting two cards does not establish which shipments they represent. A retry just waits for the preferred order to recur.

## What the interviewer listens for

Separate readiness from membership and order. Show a failing case that has the right count and still violates the contract.

## Sources

- [Playwright: `allTextContents`](https://playwright.dev/docs/api/class-locator#locator-all-text-contents)
- [MDN: `Array.prototype.sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [ECMAScript: `Array.prototype.sort`](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.sort)
