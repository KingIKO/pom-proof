---
problem: bug-report/checkout-rounding-mobile-quote
---

The summary is wrong and the captured amount matches the confirmed payment amount. S3 and P1 express both facts: the team has no evidence of the provider capturing a different value from the confirmation, but an inaccurate total still needs fixing before the campaign. The decoy routes to the payment provider and gives incident priority to a capture problem the evidence does not show.

Route to the mobile checkout summary. Record the fixture, apply the test discount, compare the summary with the confirmed quote before payment, and then capture the sandbox receipt. The title should point to the discrepancy. Put the amounts and device details in the body, along with the expectation that both displays show the confirmed quote.

Find the quote and order identifiers so the screenshot and sandbox record can be tied to the same purchase. Capture the fixture data and discount rule so another tester can exercise the same combination. Asking for the captured amount again would not make the report more reproducible.

See [ISTQB CTFL, defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf). An interviewer wants the comparison to separate a display discrepancy from an incorrect financial operation.
