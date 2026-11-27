---
problem: bug-report/upload-cancel-stale-status
---

## What is going on

The staging job returns `state=canceled`. Its log has no completion event. The screenshot taken after that response still shows 40 percent. Reloading shows Canceled. So the evidence separates the stale row, which is out of date, from the transfer itself.

## The answer

1. Set severity to S3 for misleading state with a supported recovery.

   **Why:** Severity describes how much harm the defect causes. The row makes a canceled transfer look active. Reloading the list shows the correct status. Nothing indicates that the file finished uploading.

2. Set priority to P2, the next maintenance window.

   **Why:** Priority says how soon to fix the defect. The policy puts staging issues with a practical workaround in that window. The evidence does not show a cancellation that customers cannot complete.

3. Start triage with the upload queue and status display.

   **Why:** Triage is the first sorting of a defect to decide where to look. The row and the service disagree until a reload fetches the list again. This locates the observed problem. It does not identify which callback, the code that runs when a response arrives, or which client state produced it.

4. Choose a title that names the progress label that stays on the upload row after a successful cancellation.

   **Why:** The title makes clear that the problem appears after the response. It does not claim the upload team forgot a particular step.

5. Reproduce the stuck row after canceling the fixture PDF, a prepared test file.

   Start with an empty upload queue and select the file. When progress holds at 40 percent, activate Cancel on that row. After the response arrives, inspect the row.

   **Why:** The hold gives a known state to cancel from. Inspecting before the response would test something else. It would test whether the UI changes while cancellation is still pending.

6. Request what the engineer needs to repeat the test and find the upload job.

   Ask which browser version and operating system the reporter used. Ask for the upload job ID in the cancel response.

   **Why:** The environment helps someone repeat the symptom. The ID ties the response to the same storage and job events.

7. Report what the row shows after the service confirms cancellation.

   The row should show Canceled at that point. It stays at 40 percent until refresh.

   **Why:** Comparing the response with the displayed row captures the UI failure. It does not claim that the server received the entire file.

## Why the tempting answer fails

The decoy's S2 treats the progress label as proof that cancellation is blocked. Its P1 ignores the supported reload. Keep the request for the browser and OS. The 12 MB size and staging build 1102 are already known, so get the job ID instead. The decoy's component, title, steps and expected versus actual result fit.

## What the interviewer listens for

Use the response and job log to tell an incomplete operation apart from a stale display. Say clearly which observation came before the reload.

## Sources

- [ISTQB CTFL: defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
