---
problem: bug-report/report-export-omits-second-page
---

## What is going on

The analyst's June filter returns 53 cases. The dashboard shows the three extra IDs on page two. The completed CSV contains exactly the first page's 50 IDs. The job log says `written=50`.

## The answer

1. Assign S3 for an incomplete export with a supported workaround.

   **Why:** Severity describes how much harm the defect causes. The documented date-slice procedure still lets the analyst download and combine the full set. A date slice is an export of one date range.

2. Assign P1, before this week's finance handoff.

   **Why:** Priority says how soon to fix the defect. The workaround keeps work moving. The handoff policy still calls for fixing the incomplete export before finance needs it.

3. Start with the CSV export job.

   **Why:** The dashboard already shows the missing records. The completed file and the job log agree on 50. That points toward the export path. It does not identify which query or job step cut the output.

4. Choose a title that says the CSV export is missing matching rows after the first report page.

   **Why:** The title states the cutoff and the affected file. It does not blame a specific implementation.

5. Reproduce the missing rows with the June fixture filter, which runs on prepared test data.

   Apply that filter and record the IDs on both pages. Without changing the filter, request the CSV. After the export completes, download it. Parse the file and compare its IDs with the ones you recorded.

   **Why:** Identical filters let the dashboard serve as the baseline, the known correct list. Comparing identifiers catches the specific omissions. That works even if a bad file has the right total count.

6. Request the evidence needed to repeat and trace the export.

   Include all saved filter values, even defaults the page hides. Ask for the test job ID and the redacted output with row IDs intact.

   **Why:** The filter recreates the input. The job and output let someone trace the exact file. Because the output is redacted, with private data removed, it does not expose unrelated data.

7. Report that the file should contain all 53 matching IDs but has exactly the first 50.

   **Why:** The download completed. That proves the failure is about completeness. It is not a job that never finishes or a source record that disappeared.

## Why the tempting answer fails

The decoy's S2 and P0 overlook the documented alternative. The decoy also routes to search pagination, which splits results into pages. That part already displays the extra rows. The job and output are useful. The counts and browser version are already known, but the full filter is missing.

Keep the decoy's title, reproduction steps and expected versus actual comparison.

## What the interviewer listens for

Name the particular rows lost between a correct input list and the resulting file. Keep the observed cutoff separate from a theory about the cause.

## Sources

- [ISTQB CTFL: defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
