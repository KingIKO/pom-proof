---
title: Report a lost offline work order edit
kind: bug-report
topic: defect-reporting
difficulty: hard
minutes: 10
roles: [manual-qa, sdet, senior]
items:
  - id: severity
    type: single-choice
    prompt: Which severity applies to the acknowledged edit in the evidence?
    choices:
      - { id: s2, text: "S2, required task blocked without permanent loss" }
      - { id: s4, text: "S4, display defect only" }
      - { id: s1, text: "S1, acknowledged data lost with no supported recovery" }
      - { id: s3, text: "S3, secondary task impaired or recoverable issue" }
  - id: priority
    type: single-choice
    prompt: What should the team propose for the field pilot?
    choices:
      - { id: p0, text: "P0, hold the field pilot pending a fix" }
      - { id: p1, text: "P1, start the pilot and fix in its first update" }
      - { id: p2, text: "P2, review in the next planning cycle" }
  - id: component
    type: single-choice
    prompt: Which component should get the first investigation?
    choices:
      - { id: dispatch, text: "Dispatch web editor" }
      - { id: sync, text: "Remote conflict resolver" }
      - { id: radio, text: "Mobile connectivity indicator" }
      - { id: drafts, text: "Mobile offline draft storage" }
  - id: title
    type: single-choice
    prompt: Which title records the failure and the trigger?
    choices:
      - { id: vague, text: "Broken offline sync" }
      - { id: long, text: "Android staging build 771 shows Saved offline while editing a field work order then the pending queue is empty when reopened offline and remains empty after reconnecting" }
      - { id: precise, text: "Saved offline edit disappears after app reopens offline" }
      - { id: blame, text: "Mobile team failed to write the offline edit to disk" }
  - id: steps
    type: ordering
    prompt: Order the observations so restart and reconnect are distinguishable.
    choices:
      - { id: reopen, text: "Reopen before reconnecting and look for the acknowledged edit." }
      - { id: save, text: "Go offline and edit an opened fixture order until Saved offline appears." }
      - { id: final, text: "Reconnect and check that the edit does not return from the pending queue or server." }
      - { id: close, text: "Close the app while still offline using the action reported." }
  - id: missing
    type: multi-select
    prompt: Which evidence is missing and bears directly on the failure?
    choices:
      - { id: closure, text: "Exact close gesture or operating-system action" }
      - { id: build, text: "App build number" }
      - { id: environment, text: "Staging or production label" }
      - { id: logs, text: "Redacted local draft lifecycle logs tied to the fixture edit" }
  - id: expected
    type: single-choice
    prompt: Which expected and actual behavior belongs in the ticket?
    choices:
      - { id: expire, text: "Expected an expired draft to disappear; actual it remains in the queue after reconnect." }
      - { id: conflict, text: "Expected the app to resolve a conflict automatically; actual dispatch keeps the other value." }
      - { id: retry, text: "Expected reconnect to start immediately; actual mobile data remains disabled." }
      - { id: loss, text: "Expected the acknowledged edit to remain pending after reopening; actual it is absent offline and never returns after reconnect." }
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

> I saw Saved offline. I closed the app and opened it again before I had coverage. The edit was gone and it never came back.

Staging build 771, Pixel 8, Android 15, test work order `WO-17`. Screenshot shows Saved offline before closing; after reopening offline the screen has the previous value and an empty queue. After reconnect, the completed sync log reports zero edits sent. Support reproduced that the acknowledged edit cannot be recovered through the app. The exact close action was omitted.

Severity: S1 acknowledged data lost with no supported recovery; S2 required task blocked without permanent loss; S3 secondary task impaired or recoverable issue; S4 display only. Priority: P0 hold the field pilot for S1; P1 fix other required-path issues in the first update; P2 next planning cycle.
