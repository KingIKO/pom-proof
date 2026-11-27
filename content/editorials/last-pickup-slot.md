---
problem: scenario/last-pickup-slot
---

## What is going on

The reservation service has changed, and the test store has one pickup slot left. The product allows the screen to show stale availability, meaning slots that are no longer free. Checkout must still refuse a second booking. Canceling the confirmed order should make that slot available again, once.

## The answer

1. If both customers receive confirmed orders for the same last slot, stop the rollout.

   **Why:** Both customers already have order numbers and expect pickup. The store promised capacity it cannot fulfill. That consequence is different from briefly showing a slot that checkout later refuses.

2. Spend four minutes on two checkouts competing for the last slot and two minutes on cancellation and rebooking.

   Submit both prepared checkouts together in separate Playwright browser contexts. Check that one gets a confirmation and the other is rejected. Check that the test store records exactly one reservation. Then cancel the confirmed order and verify that the next valid booking of the released slot succeeds.

   **Why:** Submitting together tests the moment when both customers could compete for the same capacity. A browser context is a separate browser session with its own cookies and cart state. Separate contexts keep the two customers independent, so the test represents two shoppers. Reading the reservation count catches an extra reservation even if only one confirmation appears. Canceling and rebooking checks the opposite failure, a freed slot that stays unavailable.

## Why the tempting answer fails

As long as checkout refuses the second purchase, a stale time on the screen does not meet the stop condition. The decoy keeps the two-customer run. It drops the cancellation check and checks the format of the store hours instead. The release refactored the service, meaning it restructured the code. Formatted hours cannot tell you whether the refactored service returns canceled capacity to the store.

## What the interviewer listens for

Separate the slot people see from the slot the store promises. Explain how each check in the six-minute budget tests a different way capacity can go wrong.

## Sources

- [Playwright, browser contexts and test isolation](https://playwright.dev/docs/browser-contexts)
