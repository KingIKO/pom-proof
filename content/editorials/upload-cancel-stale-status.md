---
problem: bug-report/upload-cancel-stale-status
---

## What is going on

The staging job returns `state=canceled`, and its log has no completion event. The screenshot taken after that response still shows 40 percent. Reloading shows Canceled, so the evidence distinguishes the stale row from the transfer itself.

## The answer

1. Set severity to S3 for misleading state with a supported recovery.

   **Why:** The row makes a canceled transfer look active. Reloading the list shows the correct status, and nothing indicates that the file finished uploading.

2. Set priority to P2, the next maintenance window.

   **Why:** The policy puts staging issues with a practical workaround in that window. The evidence does not show a cancellation that customers cannot complete.

3. Start triage with the upload queue and status display.

   **Why:** The row and service disagree until reload fetches the list again. This localizes the observed problem without identifying which callback or client state produced it.

4. Use the title “Upload row still shows progress after cancel succeeds.”

   **Why:** It makes the post-response timing explicit without claiming the upload team forgot a particular step.

5. Open an empty upload queue and select the fixture PDF, wait until progress holds at 40 percent, activate Cancel on that row, then inspect it after the response arrives.

   **Why:** The hold gives a known state to cancel from. Inspecting before the response would test whether the UI changes while cancellation is still pending.

6. Request the browser version and operating system and the upload job ID from the cancel response.

   **Why:** The environment helps someone repeat the symptom, and the ID ties the response to the same storage and job events.

7. Report that the row should show Canceled when the service confirms it, but remains at 40 percent until refresh.

   **Why:** Comparing the response with the rendered row captures the UI failure without claiming the server received the entire file.

## Why the tempting answer fails

S2 treats the progress label as proof of blocked cancellation, and P1 ignores the supported reload. Keep the browser and OS request, but the 12 MB size and staging build 1102 are known; get the job ID instead. The component, title, steps and expected versus actual result fit.

## What the interviewer listens for

Use the response and job log to tell an incomplete operation apart from a stale display. Make clear which observation occurred before reload.

## Sources

- [ISTQB CTFL: defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
