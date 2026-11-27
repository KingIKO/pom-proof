---
problem: bug-report/offline-draft-disappears
---

## What is going on

The app acknowledges the edit to `WO-17` with `Saved offline`. After an offline restart, the app shows the previous value and an empty queue. The later sync sends zero edits, and support found no way to recover the acknowledged edit through the app.

## The answer

1. Assign S1: acknowledged data was lost without supported recovery.

   **Why:** The app had already told the user the edit was saved. Re-entering the edit would be new work, not recovery of what the app accepted.

2. Assign P0 and hold the field pilot.

   **Why:** The pilot policy requires a hold for S1, and field users could rely on the same save confirmation while disconnected.

3. Start with mobile offline draft storage.

   **Why:** The draft is missing before network access returns. The later sync log confirms nothing was sent, without showing a remote conflict or service failure.

4. Use the title “Saved offline edit disappears after app reopens offline.”

   **Why:** It records the acknowledgement and the first observed failure without guessing whether the app failed to write the draft or later failed to load it.

5. Edit the fixture order offline until `Saved offline` appears, close the app while still offline, reopen it and inspect the queue, then reconnect and check the queue and server for the edit.

   **Why:** The offline check distinguishes failure to survive restart from anything that happens during sync. The final online check establishes whether the edit returns.

6. Ask for the exact close gesture or OS action and redacted local draft lifecycle logs for the fixture edit.

   **Why:** The close action defines the restart to reproduce. The logs can show whether that edit reached each local save and reload stage.

7. Record that the acknowledged edit should remain pending after reopen, but is absent offline and never returns after reconnect.

   **Why:** That comparison documents local persistence and the lack of subsequent recovery separately.

## Why the tempting answer fails

S2 and P1 understate a confirmed unrecoverable loss. Routing to the remote conflict resolver and reconnecting before the inspection lose the evidence that localizes the failure. The logs belong in the request, but staging and build 771 are known; ask for the close action instead. Keep the title and the expected versus actual result.

## What the interviewer listens for

Identify the last good state and the first observation where the edit is missing. Explain why the order of the checks makes the difference.

## Sources

- [ISTQB CTFL: defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
