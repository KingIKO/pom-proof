---
problem: scenario/report-export-snapshot
---

## What is going on

The export must use request-time filters and data even if a worker starts later. A report can open with the right headings while containing the wrong records or altered note text.

## The answer

1. Ask which visible filters and hidden defaults are captured, and which columns the requesting role receives.

   **Why:** The filter set defines which row IDs belong. The role determines which data those rows may expose.

2. Spend seven minutes holding the worker, changing a fixture row, and comparing the finished export with the request-time set. Spend four parsing notes with commas and line breaks and comparing the original text.

   **Why:** Changing inclusion after the request exposes evaluation at the wrong instant. Parsing the note into one field catches corruption that a successfully downloaded file can hide.

3. Use the export API to follow the deployed job and inspect its finished file. Count parsed rows rather than physical lines.

   **Why:** The API ties the artifact to the job you controlled, and a legitimate line break within a CSV field can add a physical line without adding a data row.

4. Unit-test the pure writer with commas, line breaks, and quotes.

   **Why:** If these characters fail to round-trip in memory, you can diagnose the writer independently of job timing.

5. Stop release if the file includes a record excluded by the captured filter.

   **Why:** The exported dataset violates the agreed scope, regardless of how the file renders.

6. Request the export while the worker is held and save the expected IDs from the fixture, then change one row's inclusion. Release the worker, wait for that job, then download, parse, and compare.

   **Why:** Editing only after acceptance gives request-time and run-time evaluation different answers. Saving the first answer independently prevents the downloaded file from defining its own expectation.

## Why the tempting answer fails

The default file name does not define which columns the role gets. Downloading an unfiltered report at two screen sizes cannot expose late snapshot evaluation. The UI adds a detour to the deployed job check, and the API adds a job to a quoting rule you can isolate in memory.

## What the interviewer listens for

State exactly which records you expect and how you will inspect logical rows and original cell values.

## Sources

- [RFC 4180 on CSV fields](https://www.rfc-editor.org/rfc/rfc4180.html#section-2)
