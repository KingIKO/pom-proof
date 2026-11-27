---
title: Report an upload row that stays stuck after canceling
kind: bug-report
topic: defect-reporting
difficulty: easy
minutes: 8
roles: [manual-qa, automation]
items:
  - id: severity
    type: single-choice
    prompt: How serious is the bug based on what you can see?
    choices:
      - { id: s1, text: "S1: The system permanently loses data or exposes it." }
      - { id: s2, text: "S2: Users cannot complete a required task through any supported route." }
      - { id: s4, text: "S4: Only the appearance is wrong and the upload status is correct." }
      - { id: s3, text: "S3: The app shows the wrong status or disrupts a task users can recover." }
  - id: priority
    type: single-choice
    prompt: When do the rules for releasing updates say to fix this?
    choices:
      - { id: p1, text: "P1: Fix it in the current update." }
      - { id: p0, text: "P0: Stop rolling out the update." }
      - { id: p2, text: "P2: Fix it during the next maintenance window." }
  - id: component
    type: single-choice
    prompt: Which part of the app should you check first?
    choices:
      - { id: scan, text: "The process that reviews documents" }
      - { id: progress, text: "The upload queue and the display of its status" }
      - { id: download, text: "The service that sends attachments for download" }
      - { id: storage, text: "The process that schedules how long documents stay" }
  - id: title
    type: single-choice
    prompt: Which title says what users see go wrong and when?
    choices:
      - { id: precise, text: "Upload row keeps showing progress after the upload is canceled" }
      - { id: blame, text: "The upload team forgot to clear the canceled rows" }
      - { id: long, text: "After canceling the paused 12 MB PDF in WebKit on build 1102, the staging log shows canceled. The upload list shows 40 percent until reload." }
      - { id: vague, text: "Something looks wrong on the page that lists uploads" }
  - id: steps
    type: ordering
    prompt: Put the steps for reproducing the unchanged status in order.
    choices:
      - { id: observe, text: "Once the service responds to the request to cancel, check the row." }
      - { id: start, text: "Open the empty upload list and choose the test PDF." }
      - { id: cancel, text: "Select Cancel on the row for the paused upload." }
      - { id: wait, text: "Wait until the test upload pauses at 40 percent." }
  - id: missing
    type: multi-select
    prompt: Which missing details would help someone repeat the test and trace the issue?
    choices:
      - { id: size, text: "The approximate size of the chosen file" }
      - { id: browser, text: "The browser version and operating system used" }
      - { id: job, text: "The upload job ID returned when canceling" }
      - { id: env, text: "The app build and environment used for the test" }
  - id: expected
    type: single-choice
    prompt: Which expected and actual results fit both the response and the screenshot?
    choices:
      - { id: visible, text: "The row for the canceled upload should say Canceled. Instead, it stays at 40 percent until reload." }
      - { id: scan, text: "The scanner should approve the uploaded document. Instead, the scanner marks the PDF unsafe." }
      - { id: backend, text: "Canceling should stop the upload before it finishes. Instead, the server gets the whole file." }
      - { id: queue, text: "The app should retry the upload on its own. Instead, the user must choose the file again." }
reference:
  severity: s3
  priority: p2
  component: progress
  title: precise
  steps: [start, wait, cancel, observe]
  missing: [browser, job]
  expected: visible
decoy:
  severity: s2
  priority: p1
  component: progress
  title: precise
  steps: [start, wait, cancel, observe]
  missing: [browser, size]
  expected: visible
---

> I canceled a PDF upload. The row still said 40 percent. When I reloaded, the list showed the right status.

The test used staging build 1102 with WebKit and a 12 MB test PDF. Staging is the test environment. WebKit is the engine that displays pages in the browser. The test pauses the upload at 40 percent. The upload queue tracks files waiting to go to the server.

After the user cancels, the service returns `state=canceled`. The screenshot after the response still shows 40 percent. On reload, the row correctly shows Canceled. The job log shows the upload did not finish. When the service confirms the upload stopped, the list should show Canceled.

Severity tells how serious the bug is:

- S1: The system permanently loses or exposes data.
- S2: A required task is blocked and has no supported workaround.
- S3: The app shows a misleading status or disrupts a task users can recover.
- S4: Only appearance is affected. The status is correct.

Priority tells when to fix it:

- P0: If the bug is S1 or blocks a required task with no workaround, stop rollout.
- P1: If the issue keeps happening and has no practical workaround, fix it in the current update.
- P2: If the issue is on staging and has a practical workaround, fix it in the next maintenance window.

Reloading this list is a supported workaround.
