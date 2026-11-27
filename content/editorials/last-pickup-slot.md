---
problem: scenario/last-pickup-slot
---

## What is going on

The reservation service has changed, and the test store has one pickup slot left. The product allows stale availability on screen, but checkout must refuse a second booking. Canceling the confirmed order should make that slot available again, once.

## The answer

1. Stop rollout if both customers receive confirmed orders for the same last slot.

   **Why:** Both customers already have order numbers and expect pickup. The store promised capacity it cannot fulfill. That consequence is different from briefly showing a slot that checkout later refuses.

2. Spend four minutes submitting two prepared checkouts together for the last slot in separate Playwright browser contexts. Check that one gets a confirmation, the other is rejected, and the test store records exactly one reservation. Spend two minutes canceling that confirmed order and verifying that the next valid booking of the released slot succeeds.

   **Why:** Submitting together tests the point at which both customers could compete for the same capacity. Separate contexts keep cookies and each customer's cart state independent, so the test represents two shoppers. Reading the reservation count catches an extra reservation even if only one confirmation appears. Canceling and rebooking checks the opposite failure: a freed slot staying unavailable.

## Why the tempting answer fails

A stale time on the screen does not meet the stop condition as long as the second purchase is refused. The decoy keeps the two-customer run but trades cancellation for checking the format of the store hours. Formatted hours cannot tell you whether the refactored service returns canceled capacity to the store.

## What the interviewer listens for

Separate the slot people see from the slot the store promises. Explain how each check in the six-minute budget tests a different way capacity can go wrong.

## Sources

- [Playwright, browser contexts and test isolation](https://playwright.dev/docs/browser-contexts)
