---
problem: bug-report/checkout-rounding-mobile-quote
---

## What is going on

In the mobile discount checkout, the summary shows USD 12.39. The review-and-pay confirmation shows 12.40, and the sandbox log records both the quote and capture at 1240 cents. The purchase succeeds.

## The answer

1. Set severity to S3: incorrect information with no financial effect shown.

   **Why:** The summary gives the customer the wrong amount, but the capture agrees with what the customer confirmed.

2. Set priority to P1, before the discount campaign begins next week.

   **Why:** The campaign will put customers on the affected path. The policy reserves a checkout rollout stop for wrong captures or blocked purchases.

3. Route the report to the mobile checkout summary.

   **Why:** The summary is the first point of disagreement, and the quote and capture records agree. This suggests where to start without proving how the summary calculated the value.

4. Use the title “Mobile discount summary shows a cent less than sandbox quote.”

   **Why:** It states the mismatch without guessing that a rounding rule is broken. Keep the exact amounts, Pixel 8, Chrome 137 and build 702 in the body.

5. Load the tax-and-discount fixture, apply the test discount, record the summary and confirmed quote before paying, then complete the sandbox order and record the captured amount.

   **Why:** The pre-payment record preserves what the customer saw. The sandbox receipt can then show whether the mismatch continued into capture.

6. Ask for the sandbox order and quote IDs and the fixture cart details, including quantities and discount rule.

   **Why:** The IDs tie the screenshot and payment record to one purchase, and the cart inputs let another tester recreate the calculation.

7. Record that the summary should match the 12.40 confirmed quote but shows 12.39; the capture is 12.40.

   **Why:** Keeping both displays and the captured value distinct prevents a display discrepancy from being filed as a financial error.

## Why the tempting answer fails

S1, P0 and payment-provider routing assume a capture error the evidence contradicts. The long title buries the symptom in details better kept in the body. The IDs are useful, but the captured amount is already recorded; get the fixture inputs instead. The decoy's reproduction and expected versus actual comparison still fit.

## What the interviewer listens for

Tell the reader where the totals first diverge and where they agree, then use that distinction to justify impact and urgency.

## Sources

- [ISTQB CTFL: defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
