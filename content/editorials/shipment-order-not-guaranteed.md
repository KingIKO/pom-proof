---
problem: diagnosis/shipment-order-not-guaranteed
---

The panel has loaded and both shipments are present. The response and UI agree in the failing trace. The array comparison fails because the test asserts an exact sequence, even though the product only promises that each shipment appears once.

Sort copies of both full arrays using the same comparison, then assert equality. That preserves cardinality and duplicate counts. Changing the arrays to sets would discard repeated entries, so for expected `A, B`, an actual `A, B, B` could pass. Keep the loaded-state check before collecting the labels.

The decoy is to sort the product output. That changes what users see to satisfy a test assumption. Only require a specific sequence if the product adds a sorting rule. Retrying the current assertion merely waits for a favorable response order.

An interviewer will listen for how you separate readiness, membership and order. A useful verification run includes both permutations and a case that repeats one label. The good cases should pass with either order, and the duplicate should fail.

[Playwright: `allTextContents`](https://playwright.dev/docs/api/class-locator#locator-all-text-contents) · [MDN: `Array.prototype.sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
