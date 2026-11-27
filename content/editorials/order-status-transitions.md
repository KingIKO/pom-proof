---
problem: test-design/order-status-transitions
---

## What is going on

The function returns a status for one current state and action. A state transition test can check a valid edge in the order's path or an invalid action that must leave the state unchanged.

## The answer

1. Check that `capture` moves `awaiting-payment` to `paid`, `ship` moves `paid` to `shipped`, and `deliver` moves `shipped` to `delivered`.

   **Why:** The last row catches the mutant that drops the delivery update. Stopping at shipment would leave that mutant undetected.

2. Check `cancel` from both `awaiting-payment` and `paid`. Both return `cancelled`.

   **Why:** Each row starts in a different state. Together they catch the separate mutants that refuse cancellation before payment or after capture.

3. Check that `ship` from `awaiting-payment` and `cancel` from `shipped` preserve the starting status.

   **Why:** The first catches a mutant that fulfills an unpaid order. The second catches one that still allows cancellation once fulfillment has begun.

4. Check that `capture` from `cancelled` leaves it `cancelled` and `cancel` from `delivered` leaves it `delivered`.

   **Why:** A late capture catches the mutant that reopens a cancelled order. The delivery row checks the same terminal-state rule from the other final state, where a different late event could wrongly change the outcome.

## Why the tempting answer fails

The payment, shipment, and delivery examples cover the normal path and catch a dropped delivery update. They never try either route to `cancelled` or an action in a state where it should have no effect, so they cannot distinguish valid transitions from overly broad ones.

## What the interviewer listens for

Give an explicit starting state, event, and expected next state. Sketch the graph if it helps, then write the forbidden combinations into table mode or assert them directly in code mode.

## Sources

- [ISTQB CTFL Syllabus v4.0.1, section 4.2.4, state transition testing](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
