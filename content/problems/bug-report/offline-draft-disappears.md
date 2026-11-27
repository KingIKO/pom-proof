---
title: Report a work order edit lost while offline
kind: bug-report
topic: defect-reporting
difficulty: hard
minutes: 10
roles: [manual-qa, sdet, senior]
items:
  - id: severity
    type: single-choice
    prompt: How serious is the bug given that the app said it saved the edit?
    choices:
      - { id: s2, text: "S2: A required task is blocked without any permanent data loss." }
      - { id: s4, text: "S4: The bug only affects how the information looks." }
      - { id: s1, text: "S1: The app loses data it said it saved, with no supported recovery." }
      - { id: s3, text: "S3: A secondary task is harder or the user can recover." }
  - id: priority
    type: single-choice
    prompt: When should the team fix this for the field trial?
    choices:
      - { id: p0, text: "P0: Wait to start the field trial until this is fixed." }
      - { id: p1, text: "P1: Start the field trial and fix it in its first update." }
      - { id: p2, text: "P2: Review the issue during the next round of planning." }
  - id: component
    type: single-choice
    prompt: Which part of the system should the team check first?
    choices:
      - { id: dispatch, text: "The dispatch team's web editor" }
      - { id: sync, text: "The server code that resolves conflicting edits" }
      - { id: radio, text: "The app's display of network status" }
      - { id: drafts, text: "The app's storage for offline drafts" }
  - id: title
    type: single-choice
    prompt: Which title tells what failed and when it happened?
    choices:
      - { id: vague, text: "Something is wrong with the way offline changes sync" }
      - { id: long, text: "Android staging build 771 shows Saved offline for a work order edit. The pending list is empty after reopening offline and stays empty after reconnecting." }
      - { id: precise, text: "Saved edit disappears after the app reopens while offline" }
      - { id: blame, text: "The mobile team forgot to store the offline edit on disk" }
  - id: steps
    type: ordering
    prompt: Put the steps in order so you can tell what happened before and after reconnecting.
    choices:
      - { id: reopen, text: "Before reconnecting, reopen the app and look for the edit it said it saved." }
      - { id: save, text: "While offline, edit the open test order until Saved offline appears." }
      - { id: final, text: "Reconnect and check that neither the pending list nor the server restores the edit." }
      - { id: close, text: "While still offline, close the app the same way the tester did." }
  - id: missing
    type: multi-select
    prompt: Which missing details would directly help explain why the edit disappeared?
    choices:
      - { id: closure, text: "The exact gesture or device action that closed the app" }
      - { id: build, text: "The build number of the mobile app tested" }
      - { id: environment, text: "Whether the test used the staging or live system" }
      - { id: logs, text: "The draft activity logs for the test edit, with private details removed" }
  - id: expected
    type: single-choice
    prompt: Which expected and actual results belong in the bug report?
    choices:
      - { id: expire, text: "An expired draft should disappear from the pending list. Instead, it stays after the device reconnects." }
      - { id: conflict, text: "The app should resolve conflicting edits on its own. Instead, dispatch keeps the other value." }
      - { id: retry, text: "The device should start to reconnect right away. Instead, it keeps mobile data turned off." }
      - { id: loss, text: "The saved edit should still be pending after reopening. Instead, it is gone offline and never returns after reconnecting." }
reference:
  severity: s1
  priority: p0
  component: drafts
  title: precise
  steps: [save, close, reopen, final]
  missing: [closure, logs]
  expected: loss
decoy:
  severity: s2
  priority: p1
  component: sync
  title: precise
  steps: [save, close, final, reopen]
  missing: [build, logs]
  expected: loss
---

> The app said Saved offline. I closed it and opened it again before I had a signal. The edit was gone. It never came back.

The test used staging build 771 on a Pixel 8 with Android 15 and test work order `WO-17`. Staging is the test environment. The screenshot shows Saved offline before the tester closes the app. After the app reopens offline, it shows the old value. The pending queue, or list of edits waiting to send, is empty.

After the device reconnects, the app finishes syncing, or sharing changes with the server. The sync log says it sent zero edits. Support repeated the test and confirmed that the app offers no way to recover the saved edit. The report leaves out how the tester closed the app.

Severity tells how serious the bug is:

- S1: The app loses data it said it saved. No supported way to recover it exists.
- S2: A required task is blocked. The app loses no data permanently.
- S3: A secondary task is harder or the user can recover.
- S4: Only the display is wrong.

Priority tells when to fix it:

- P0: If the bug is S1, hold the pilot, a small trial in the field.
- P1: If another issue affects a required task, fix it in the pilot's first update.
- P2: Review the issue during the next round of planning.
