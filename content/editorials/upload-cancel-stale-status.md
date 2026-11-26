---
problem: bug-report/upload-cancel-stale-status
---

Report the status inconsistency at the upload queue. The cancellation response and job log support that the transfer was canceled. The screenshot and reload behavior support that the row stayed out of date until the list fetched again. The evidence does not identify which callback or client state caused it.

Open an empty queue, start the known fixture, wait until the staged transfer is held, cancel it, and check the row after the response. Inspecting it before the response would test a different condition. Include the browser version and operating system, and capture the job ID so someone else can match the cancel response to storage and job events.

S3 captures the misleading state. Reload is a practical workaround, and the evidence is limited to staging, so the stated policy points to P2. The decoy takes an incorrect progress label as proof of a blocked cancellation. A stronger report makes the actual UI problem visible without inflating the service impact.

See [ISTQB CTFL, defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf). An interviewer listens for clues that distinguish an incomplete operation from an inaccurate display.
