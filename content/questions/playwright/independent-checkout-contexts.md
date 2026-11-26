---
title: When should a Playwright test use two browser contexts?
topic: playwright
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Use separate browser contexts when the test needs two independent sessions that can still interact with the same backend.
looksFor:
  - Explain why two tabs can share login and cart state.
  - Create each customer in a separate browser context.
  - Seed shared inventory and assert what each customer sees after checkout.
trap: Opening a second tab and assuming it represents a second customer.
followUps:
  - question: How would you make both customers compete for the same last pickup slot?
    answer: Seed one slot, check that both sessions see it, and coordinate the two submit requests so neither waits for the other checkout to finish.
  - question: How do you check that only one reservation was created?
    answer: Check that one customer receives a confirmation and the other sees an unavailable message, then use a permitted reservation API to count confirmed records for the seeded slot.
sources:
  - label: Playwright browser context isolation
    url: https://playwright.dev/docs/browser-contexts
---

I'd use `browser.newContext()` for each customer and open the checkout page inside each context. Two pages in the same context can share cookies and origin storage, so I wouldn't use a second tab to stand in for a second login. I would give each context a different test account or start each as a separate guest, depending on what the checkout supports.

The contexts still talk to the same server. I'd seed a slot that this test owns, make sure each customer sees it as available, and check both outcomes after submitting.

### Example

For the last pickup slot at a store, I would submit one checkout per context and expect one confirmation and one unavailable message. Then I'd check that the server recorded exactly one confirmed reservation for the slot.
