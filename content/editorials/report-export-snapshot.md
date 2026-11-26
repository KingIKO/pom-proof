---
problem: scenario/report-export-snapshot
---

Ask which visible and default filters apply, and which columns a given role should receive. A file that opens and has the right headings can still contain records outside the requested set. Make the expected row IDs explicit before a queued job runs.

Use seven minutes for the snapshot check. Hold the worker, request the export, and record the expected rows from the fixture. Change a row so its inclusion would differ if evaluated at processing time. Release the worker, wait for that job's completion, and compare the parsed rows with the saved set.

Spend the other four minutes on cell fidelity. A note with a comma and a line break should still be one field, with the original contents. Cover quoting in a unit test for the writer. For the job and file checks, inspect the export through the API and count parsed rows rather than physical lines. The decoy's two-screen-size check cannot expose a filter captured at the wrong time. Including an excluded row stops release.

The interviewer wants a specific expected dataset and a meaningful way to inspect the artifact. See [RFC 4180 on CSV fields](https://www.rfc-editor.org/rfc/rfc4180.html#section-2).
