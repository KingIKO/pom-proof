---
problem: bug-report/invoice-pdf-clips-final-line
---

Use S3 and P2. The amount due is required information and the downloaded file obscures it, so the defect affects more than appearance. Printing from the portal still produces a complete invoice, so the policy sends it to the next billing patch rather than stopping processing.

Open the fixture invoice, record the portal's `82.00`, and download the PDF from the same record. Compare its final page with the documented total. Send the report to PDF rendering first. A screenshot identifies the visible failure; a redacted file and viewer information let the team check whether the defect travels with the file. The fixture ID and line layout inputs help reproduce the page break.

Use the title about the clipped amount and two-page condition. The report does not need the cause in the title or a second copy of the amount in the missing-information list. The decoy calls this appearance only, although the user cannot read a required value.

See [ISTQB CTFL, defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf). An interviewer is listening for the difference between stored values and what a customer can read.
