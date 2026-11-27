---
problem: bug-report/offline-draft-disappears
---

## What is going on

The app acknowledges the edit to `WO-17` with the message `Saved offline`. Acknowledging means the app tells the user it has accepted the edit. After an offline restart, the app shows the previous value and an empty queue. The queue holds edits that wait to be sent.

The later sync sends zero edits. Support found no way to recover the acknowledged edit through the app.

## The answer

1. Assign S1: acknowledged data was lost without supported recovery.

   **Why:** Severity describes how much harm the defect causes. The app had already told the user the edit was saved. Entering the edit again would be new work. It would not recover what the app accepted.

2. Assign P0 and hold the field pilot.

   **Why:** Priority says how soon to fix the defect. The pilot policy requires a hold for S1. Field users could also rely on the same save confirmation while disconnected.

3. Start with mobile offline draft storage.

   **Why:** The draft is already missing before network access returns. The later sync log confirms that nothing was sent. It does not show a remote conflict or a service failure.

4. Choose a title that says the edit was saved offline and went missing after the app reopened offline.

   **Why:** The title records the acknowledgement and the first observed failure. It does not guess which of two faults happened. The app may have failed to write the draft, or it may have failed to load it later.

5. Follow an offline edit through reopening and reconnecting.

   Offline, edit the fixture order, the prepared test order, until `Saved offline` appears. While still offline, close and reopen the app and inspect the queue. After that check, reconnect and look for the edit in the queue and on the server.

   **Why:** The offline check separates a failure to survive the restart from anything that happens during sync. The final online check shows whether the edit returns.

6. Request evidence of the action that closed the app and what happened to the draft.

   Ask for the exact close gesture or OS action. Ask for redacted logs that show what the app did with the fixture edit.

   **Why:** The close action defines the restart to reproduce. Redacted logs have private details removed. The logs can show whether that edit reached each local save and reload stage.

7. Record the difference in what happens to the pending edit.

   The acknowledged edit should stay pending after reopening. It is missing offline and never returns after reconnecting.

   **Why:** That comparison documents two things separately. One is local persistence, which means whether the edit survives on the device. The other is the lack of any later recovery.

## Why the tempting answer fails

The decoy's S2 and P1 understate a confirmed loss that cannot be recovered. The decoy also routes the ticket to the remote conflict resolver. It reconnects before the offline inspection. Both choices lose the evidence that shows where the failure happens.

The logs belong in the request. Staging and build 771 are already known, so ask for the close action instead. Keep the decoy's title and its expected versus actual result.

## What the interviewer listens for

Name the last good state and the first observation where the edit is missing. Explain why the order of the checks matters.

## Sources

- [ISTQB CTFL: defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
