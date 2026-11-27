---
problem: scenario/autocomplete-response-order
---

## What is going on

Search suggestions can return in a different order from the requests that produced them. Once the current list appears, the old reply must leave it alone. Clearing the query must close the list even if a reply is on its way.

## The answer

1. Ask the minimum eligible query length, what happens below it, and whether old suggestions may remain visible or selectable while a newer request is pending.

   **Why:** A field can keep or clear the old list during loading and still honor the rule after the new list renders. Without the pending-state policy, the test could reject a valid design.

2. Spend six minutes delivering the latest reply first and the older reply last. Spend four clearing the field while a reply is held and checking that the list stays empty.

   **Why:** The first check gives an old reply a chance to overwrite the current list. The second has no newer nonempty response to restore an empty search.

3. Check the inverted replies at the UI layer, asserting the list and what Enter opens.

   **Why:** The list can look correct while the keyboard handler still points at an old product.

4. Check clearing at the UI layer too.

   **Why:** A request test can show that a reply arrived. It cannot show whether that reply reopened the rendered list.

5. Stop release if Enter opens an old product after the new list has appeared.

   **Why:** The customer acts on one result and the application opens another.

6. Type the first eligible query and hold its reply. Type the longer query, deliver its reply and see its list, then deliver the older reply and verify the same list and Enter destination. Use different product IDs. In Playwright TypeScript, use `page.route()` and `route.fulfill()` to control delivery.

   **Why:** Observing the new list first establishes what the late reply might overwrite. Different IDs make an incorrect destination visible even if labels look alike.

## Why the tempting answer fails

Magnifier style leaves pending selection undefined. Fast common-product fixtures can pass without ever reversing the reply order a slower network can produce.

## What the interviewer listens for

Control timing and verify the customer's selected destination, not just the text they saw.

## Sources

- [Playwright's network guide](https://playwright.dev/docs/network)
