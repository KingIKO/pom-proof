---
problem: bug-report/checkout-rounding-mobile-quote
---

## What is going on

In the mobile discount checkout, the summary shows USD 12.39. The review-and-pay confirmation shows 12.40. The purchase succeeds.

The sandbox is the test payment environment. Its log records both the quote and the capture at 1240 cents. The quote is the amount the customer confirmed. The capture is the amount actually charged.

## The answer

1. Set severity to S3: incorrect information with no financial effect shown.

   **Why:** Severity describes how much harm the defect causes. The summary shows the customer the wrong amount. The capture still matches what the customer confirmed.

2. Set priority to P1, before the discount campaign begins next week.

   **Why:** Priority says how soon to fix the defect. The campaign will put customers on the affected path. The policy stops the checkout rollout only for wrong captures or blocked purchases.

3. Route the report to the mobile checkout summary.

   **Why:** The summary is the first place where the amounts disagree. The quote and capture records agree with each other. This points to where to start. It does not prove how the summary calculated the value.

4. Choose a title that says the mobile discount summary is one cent lower than the sandbox quote.

   Keep the exact amounts, Pixel 8, Chrome 137 and build 702 in the report body.

   **Why:** The title states the mismatch without guessing that a rounding rule is broken. The report body can carry the details needed to repeat the test.

5. Reproduce the difference with the tax-and-discount fixture, a prepared test cart.

   Load the cart and apply the test discount. Before paying, record the summary and the confirmed quote. Finish the order in the sandbox and record what it captured.

   **Why:** The record made before payment keeps what the customer saw. The sandbox receipt can then show whether the mismatch carried on into the capture.

6. Ask for the sandbox order and quote IDs and the fixture cart details, including quantities and discount rule.

   **Why:** The IDs tie the screenshot and the payment record to one purchase. The cart inputs let another tester recreate the calculation.

7. Report the difference between the expected and displayed amounts.

   The summary should match the 12.40 confirmed quote. It shows 12.39. The capture is 12.40.

   **Why:** The report keeps the two displays and the captured value separate. That stops a display mismatch from being filed as a financial error.

## Why the tempting answer fails

The decoy's S1, P0 and payment-provider routing all assume a capture error. The evidence contradicts that, because the capture matches the confirmed quote. The long title hides the symptom among details that belong in the body. The IDs are useful. The captured amount is already recorded, so ask for the fixture inputs instead.

The decoy's reproduction steps and its expected versus actual comparison still fit.

## What the interviewer listens for

Tell the reader where the totals first differ and where they agree. Then use that difference to explain the severity and the priority you chose.

## Sources

- [ISTQB CTFL: defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
