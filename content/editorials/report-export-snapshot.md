---
problem: scenario/report-export-snapshot
---

## What is going on

The export must use the filters and data from the moment of the request. That holds even if the worker, the process that builds the file, starts later. A report can open with the right headings while containing the wrong records or altered note text.

## The answer

1. Ask which visible filters and hidden defaults are captured, and which columns the requesting role receives.

   **Why:** The filter set defines which row IDs belong in the export. The role determines which data those rows may expose.

2. Spend seven minutes on the request-time snapshot and four minutes on notes that contain commas and line breaks.

   Hold the worker and change one fixture row, a prepared test record. Compare the finished export with the request-time set. Parse, or read back, notes with commas and line breaks and compare them with the original text.

   **Why:** Changing what the export includes after the request exposes evaluation at the wrong instant. Parsing each note into one field catches corruption that a successfully downloaded file can hide.

3. Inspect the finished file from the deployed job through the export API.

   Count the report rows after parsing the file.

   **Why:** The API ties the finished file to the job you controlled. A CSV field can legitimately contain a line break. That break can add a physical line without adding a data row.

4. Unit-test the pure CSV writer with commas, line breaks, and quotes.

   **Why:** The writer is pure and runs on rows in memory. Text should round-trip, meaning it comes back unchanged after writing and reading. If these characters fail to round-trip in memory, you can diagnose the writer independently of job timing.

5. If the file includes a record excluded by the captured filter, stop the release.

   **Why:** The exported data breaks the agreed scope, regardless of how the file renders.

6. Reproduce a change to the report rows after requesting an export.

   While the worker is held, request the export and save the expected IDs from the fixture. Change whether one row is included. Release the worker and wait for that export job. Download and parse the file. Then compare its IDs with the expected ones.

   **Why:** You edit only after the request is accepted. So evaluation at request time and at run time give different answers. Saving the first answer separately prevents the downloaded file from defining its own expectation.

## Why the tempting answer fails

The default file name does not define which columns the role gets. Downloading an unfiltered report at two screen sizes cannot expose a snapshot evaluated too late. The UI adds a detour to the check of the deployed job. The API adds a job to a quoting rule that you can isolate in memory. The quoting rule decides how the writer wraps fields that hold commas, line breaks, or quotes.

## What the interviewer listens for

State exactly which records you expect. Explain how you will inspect logical rows, meaning data rows instead of physical lines, and the original cell values.

## Sources

- [RFC 4180 on CSV fields](https://www.rfc-editor.org/rfc/rfc4180.html#section-2)
