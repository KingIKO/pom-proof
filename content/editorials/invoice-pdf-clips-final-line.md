---
problem: bug-report/invoice-pdf-clips-final-line
---

## What is going on

The billing portal and API both show an amount due of `82.00`. The screenshot of page two shows that the downloaded PDF cuts off that required value at the bottom. Printing from the portal still produces a complete invoice suitable for the customer's records.

## The answer

1. Set severity to S3: a required value is unreadable from the usual route, with a supported workaround.

   **Why:** The customer loses access to information in this file, but can still obtain a complete invoice through the portal.

2. Set priority to P2, the next billing patch.

   **Why:** The documented alternate route lets billing continue without waiting on the downloaded file fix.

3. Start triage with invoice PDF rendering.

   **Why:** The source value is correct and the problem appears in the downloaded artifact. That narrows where to look without proving a specific pagination bug.

4. Use the title “Downloaded two-page invoice clips the amount due.”

   **Why:** A reader can identify the missing value and the two-page condition at a glance without needing a theory about the template.

5. Open the two-page staging invoice, record the amount shown in the portal, download the PDF from that record, then compare its final page with the recorded amount.

   **Why:** Using the same invoice ties the unreadable file to a known good source value.

6. Request the fixture invoice ID and layout inputs, plus a redacted PDF and the PDF viewer name and version.

   **Why:** The layout helps reproduce the page break. The original file and viewer details let the team check whether clipping travels with the file or depends on viewing it a particular way.

7. Record that the full amount due should be readable on page two; the PDF clips it while the portal shows `82.00`.

   **Why:** Both pages exist. The concrete failure is the customer's inability to read a required value on the last page.

## Why the tempting answer fails

S4 and P3 treat the clipping as appearance only, though a required number is unreadable. Keep the request for the file and viewer, but replace the request for the already known portal amount with the fixture ID and layout. The decoy routes the issue correctly, and its title, steps and comparison describe the observed failure.

## What the interviewer listens for

Separate the stored amount from what the customer can read. Explain how the workaround affects the proposed priority.

## Sources

- [ISTQB CTFL: defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
