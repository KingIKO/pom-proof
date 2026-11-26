---
problem: test-design/order-status-transitions
---

Draw the normal path from `awaiting-payment` through `paid` and `shipped` to `delivered`. Then add the two routes to `cancelled`. Test each path out of a state separately. In particular, run `cancel` on an unpaid order and a paid order. Both end at `cancelled`, but the service can easily implement one and omit the other.

A state can also be tested by trying an action that should leave it unchanged. `ship` while awaiting payment keeps `awaiting-payment`. `cancel` after shipping keeps `shipped`. A late payment event leaves a cancelled order cancelled, and a cancellation request after delivery leaves it delivered. Assert the current status as the expected result in those rows. At this level the function returns a value for every listed pair.

The weaker answer covers payment, shipment, and delivery in sequence. It does catch a dropped delivery update. It never asks the order to change along a cancellation path, and it can't tell whether the service accepts events at the wrong time.

An interviewer listens for explicit starting states, chosen events, and expected next states. A state diagram is a useful sketch, but write the forbidden combinations into the test plan as well.

Source: [ISTQB CTFL Syllabus v4.0.1, section 4.2.4, state transition testing](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf).
