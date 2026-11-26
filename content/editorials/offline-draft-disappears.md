---
problem: bug-report/offline-draft-disappears
---

The key observation comes before reconnecting. A saved draft already appears missing when the reopened app is still offline. Start with mobile draft storage and record the empty queue after reopening. The sync log confirms that nothing was sent later, but it does not identify a remote conflict or a failing server.

Write down that the edit was acknowledged, close the app while disconnected, and observe the reopened state before bringing the connection back. Keep the final online check so the report can say whether the edit returned. Ask which close action occurred and collect the redacted draft lifecycle logs. The build and environment are already recorded.

This fits S1 because the acknowledged edit has no supported recovery. The pilot policy says to hold for S1, so propose P0. The decoy follows the word sync to the service and moves reconnect ahead of the observation that localizes the loss.

See [ISTQB CTFL, defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf). An interviewer is listening for the last known good state and the earliest point where the evidence changes.
