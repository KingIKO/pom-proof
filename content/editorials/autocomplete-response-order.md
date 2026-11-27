---
problem: scenario/autocomplete-response-order
---

## What is going on

Autocomplete shows search suggestions while the user types. The replies with those suggestions can come back in a different order from the requests that produced them. Once the current list appears, a reply to an older query must leave it alone. When the user clears the query, the list must close, even if a reply is still on its way.

## The answer

1. Ask how many characters a query needs for suggestions and what happens below that minimum.

   Ask whether old suggestions can stay visible or selectable while a new request is pending.

   **Why:** The minimum tells you when a request should produce suggestions. A request is pending while the app waits for its reply. During that wait, the old list may stay or disappear before the new list renders. Without the rule about which suggestions belong to the current query, your test could reject a valid design.

2. Spend six minutes on replies that arrive out of order and four minutes on clearing the field.

   In the six-minute check, deliver the current reply first and the older reply last. In the four-minute check, clear the field while a reply is held back. After it arrives, check that the list stays empty.

   **Why:** The reversed order gives an old reply a chance to overwrite the current list. Clearing the field makes the held reply invalid. In that case, no reply for a newer query will arrive to replace it.

3. At the UI layer, which tests the rendered page, check the out-of-order replies through both the list and the product that Enter opens.

   **Why:** The list can look correct while the keyboard handler, the code that responds to Enter, still points at an old product.

4. Check clearing at the UI layer too.

   **Why:** A request test can show that a reply arrived. It cannot show whether that reply reopened the rendered list.

5. If Enter opens an old product after the new list has appeared, stop the release.

   **Why:** The customer acts on one result, and the application opens another.

6. Reproduce the reversed reply order using queries with different product IDs.

   Hold back the reply to the first query that is long enough to show suggestions. Type the longer query and deliver its reply so you can see its list. Then deliver the older reply and check that the list and the product Enter opens stay the same. In Playwright TypeScript, use `page.route()` and `route.fulfill()` to control when each reply arrives.

   **Why:** Seeing the new list first shows what the late reply might overwrite. Different IDs make a wrong destination visible even when the product labels look alike.

## Why the tempting answer fails

Asking about the magnifier icon's style leaves the pending selection rule undefined. Fixtures are prepared test data. Fixtures for common products with fast replies can pass without ever reversing the reply order. A slower network can produce that reversed order.

## What the interviewer listens for

Control the timing of each reply. Check the product the customer's selection opens, not just the text they saw.

## Sources

- [Playwright's network guide](https://playwright.dev/docs/network)
