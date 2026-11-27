---
problem: bug-report/invoice-pdf-clips-final-line
---

## What is going on

The billing portal and API both show an amount due of `82.00`. The screenshot shows page two of the downloaded PDF. On that page, the bottom edge cuts off the required amount due. Printing from the portal still produces a complete invoice that the customer can keep for their records.

## The answer

1. Set severity to S3: a required value is unreadable from the usual route, with a supported workaround.

   **Why:** Severity describes how much harm the defect causes. The customer cannot read information in this file. The customer can still get a complete invoice through the portal.

2. Set priority to P2, the next billing patch.

   **Why:** Priority says how soon to fix the defect. The documented alternate route lets billing continue. Billing does not have to wait for the fix to the downloaded file.

3. Start triage with invoice PDF rendering.

   **Why:** Triage is the first sorting of a defect to decide where to look. The source value is correct, and the problem appears in the downloaded file. That narrows where to look. It does not prove a specific pagination bug, which is a fault in how content splits across pages.

4. Choose a title that names the clipped amount due on the downloaded two-page invoice.

   **Why:** A reader can see the missing value and the two-page condition at a glance. The reader does not need a theory about the template.

5. Reproduce the clipping with a two-page staging invoice.

   Open the invoice and record the amount in the portal. Download the PDF from the same record. Compare the final page with the recorded amount.

   **Why:** Using the same invoice ties the unreadable file to a known good source value.

6. Request the test artifacts and viewer details needed to repeat the clipping.

   Ask for the ID and layout inputs of the fixture invoice, the prepared test invoice. Ask for a redacted PDF, with private details removed, and the PDF viewer's name and version.

   **Why:** The layout helps reproduce the page break. The original file and viewer details let the team check one question. Does the clipping travel with the file, or does it depend on viewing the file a particular way?

7. Record what should appear on page two and what appears instead.

   The full amount due should be readable. The PDF clips it, and the portal still shows `82.00`.

   **Why:** Both pages exist. The concrete failure is that the customer cannot read a required value on the last page.

## Why the tempting answer fails

The decoy's S4 and P3 treat the clipping as appearance only. In fact, a required number is unreadable. Keep the decoy's request for the file and viewer. The portal amount is already known, so replace that request with the fixture ID and layout. The decoy routes the issue correctly.

Its title, steps and comparison also describe the observed failure.

## What the interviewer listens for

Separate the stored amount from what the customer can read. Explain how the workaround affects the priority you propose.

## Sources

- [ISTQB CTFL: defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
