---
problem: scenario/autocomplete-response-order
---

Ask when a query becomes eligible and what can be selected while a newer request is pending. The team might keep the last list visible during loading or clear it immediately. Either policy can still satisfy the stated rule once the current response has rendered.

Use six minutes on inverted arrival order and four on clearing. Hold the first eligible response, render results for the longer query, then deliver the held reply. The first and second response fixtures should have different product IDs. Assert the displayed list and use Enter to verify the destination. Check clearing separately; that path has no new nonempty response to replace an old render.

Run it at the UI layer so the test sees both what is rendered and what the keyboard selects. The decoy checks plausible results under fast responses, but nothing forces the ordering problem found in production networks. Stop if the older reply makes Enter open the old result; that changes user intent into a wrong action.

In a Playwright TypeScript test, use `page.route()` to hold the first query and `route.fulfill()` to deliver its fixture reply afterward. See [Playwright's network guide](https://playwright.dev/docs/network). An interviewer wants controlled timing and an assertion that captures what a customer actually selects.
