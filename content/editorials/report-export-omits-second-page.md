---
problem: bug-report/report-export-omits-second-page
---

## What is going on

The analyst's June filter returns 53 cases. The dashboard shows the three extra IDs on page two, but the completed CSV contains exactly the first page's 50 IDs. The job log says `written=50`.

## The answer

1. Assign S3 for an incomplete export with a supported workaround.

   **Why:** The documented date-slice procedure still lets the analyst download and combine the full set.

2. Assign P1, before this week's finance handoff.

   **Why:** The workaround keeps work moving, but the handoff policy still calls for fixing the incomplete export before finance needs it.

3. Start with the CSV export job.

   **Why:** The dashboard already shows the missing records, and the completed file and job log agree on 50. That points toward the export path without identifying which query or job step cut the output.

4. Use the title “CSV export drops matching rows beyond the first report page.”

   **Why:** It conveys the cutoff and the affected artifact without blaming a specific implementation.

5. Apply the June fixture filter and record both pages of IDs, request the CSV without changing the filter, download it after completion, then parse and compare the IDs.

   **Why:** Identical filters let the dashboard serve as the baseline. Comparing identifiers catches the specific omissions even if a bad file has the right total count.

6. Get the full saved filter values, including hidden defaults, and the test job ID with redacted output containing row identifiers.

   **Why:** The filter recreates the input, and the job and output let someone trace the exact file without exposing unrelated data.

7. Report that the file should contain all 53 matching IDs but has exactly the first 50.

   **Why:** The completed download proves the failure is completeness, rather than a job that never finishes or a source record that disappeared.

## Why the tempting answer fails

S2 and P0 overlook the documented alternative, and search pagination already displays the extra rows. The job and output are useful, but the counts and browser version are already known; the full filter is missing. Keep the title, reproducer and expected versus actual comparison.

## What the interviewer listens for

Identify the particular rows lost between a correct input list and the resulting file. Separate the observed cutoff from a hypothesis about the cause.

## Sources

- [ISTQB CTFL: defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
