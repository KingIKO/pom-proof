---
problem: test-design/order-status-transitions
---

## What is going on

The function returns a status for one current state and one action. A state transition test checks how a system moves between states. It can check a valid edge, one allowed step in the order's path. It can also check an invalid action that must leave the state unchanged. A mutant is a copy of the function with one planted mistake for the tests to catch.

## The answer

1. Check that `capture` moves `awaiting-payment` to `paid`, `ship` moves `paid` to `shipped`, and `deliver` moves `shipped` to `delivered`.

   **Why:** The last row catches the mutant that drops the delivery update. If the test stopped at shipment, that mutant would go undetected.

2. Check that `cancel` returns `cancelled` from both `awaiting-payment` and `paid`.

   **Why:** The two rows catch separate mutants that refuse cancellation. One refuses before payment, and the other refuses after capture, when the service collects payment.

3. Check that `ship` from `awaiting-payment` and `cancel` from `shipped` keep the starting status.

   **Why:** The first row catches a mutant that fulfills an unpaid order, which means it ships the order. The second catches one that still allows cancellation once fulfillment has begun.

4. Check that `capture` from `cancelled` leaves it `cancelled` and `cancel` from `delivered` leaves it `delivered`.

   **Why:** A late capture catches the mutant that reopens a cancelled order. A terminal state is a final status that no action can change. The delivery row checks the same rule from the other final state, where a different late event could wrongly change the outcome.

## Why the tempting answer fails

The decoy, the tempting set of rows, uses the payment, shipment, and delivery examples. They cover the normal path and catch a dropped delivery update. But they never try either route to `cancelled`. They also never try an action in a state where it should have no effect. So they cannot tell valid transitions apart from overly broad ones that allow extra moves.

## What the interviewer listens for

For each test, name the starting state, the event, and the expected next state. If it helps, sketch the graph, a drawing of the states and the moves between them. Then enter the forbidden combinations in table mode, or check them directly in code mode.

## Sources

- [ISTQB CTFL Syllabus v4.0.1, section 4.2.4, state transition testing](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
