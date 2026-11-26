---
title: Report an upload row stuck after cancel
kind: bug-report
topic: defect-reporting
difficulty: easy
minutes: 8
roles: [manual-qa, automation]
items:
  - id: severity
    type: single-choice
    prompt: Which severity matches the observed effect?
    choices:
      - { id: s1, text: "S1, data lost permanently or exposed" }
      - { id: s2, text: "S2, required task blocked with no supported workaround" }
      - { id: s4, text: "S4, cosmetic only with correct state shown" }
      - { id: s3, text: "S3, misleading state or recoverable task impairment" }
  - id: priority
    type: single-choice
    prompt: Which priority matches the rollout policy below?
    choices:
      - { id: p1, text: "P1, fix in the current update" }
      - { id: p0, text: "P0, stop the current rollout" }
      - { id: p2, text: "P2, schedule the next maintenance window" }
  - id: component
    type: single-choice
    prompt: Where should triage start?
    choices:
      - { id: scan, text: "Document review worker" }
      - { id: progress, text: "Upload queue and status display" }
      - { id: download, text: "Attachment download endpoint" }
      - { id: storage, text: "Document retention scheduler" }
  - id: title
    type: single-choice
    prompt: Which title isolates the condition and visible defect?
    choices:
      - { id: precise, text: "Upload row still shows progress after cancel succeeds" }
      - { id: blame, text: "Upload team forgot to clear canceled rows" }
      - { id: long, text: "Canceling the held 12 MB PDF on WebKit in build 1102 returns canceled in the stage log but the uploads list shows 40 percent until refresh" }
      - { id: vague, text: "Something wrong with the uploads page" }
  - id: steps
    type: ordering
    prompt: Order the actions through the unchanged status.
    choices:
      - { id: observe, text: "Check the row once the cancellation response arrives." }
      - { id: start, text: "Open the empty upload queue and select the fixture PDF." }
      - { id: cancel, text: "Activate Cancel on the held row." }
      - { id: wait, text: "Wait for the staged transfer to reach its held progress at 40 percent." }
  - id: missing
    type: multi-select
    prompt: Which details were omitted and would help reproduce and trace the issue?
    choices:
      - { id: size, text: "Approximate file size" }
      - { id: browser, text: "Browser version and operating system" }
      - { id: job, text: "Upload job ID from the cancel response" }
      - { id: env, text: "Application build and environment" }
  - id: expected
    type: single-choice
    prompt: Which expected versus actual pair fits both artifacts?
    choices:
      - { id: visible, text: "Expected the canceled row to show Canceled; actual it stays at 40 percent until refresh." }
      - { id: scan, text: "Expected the scanner to approve the document; actual it marks the PDF unsafe." }
      - { id: backend, text: "Expected cancellation to stop the upload; actual the server receives the entire file." }
      - { id: queue, text: "Expected the file to retry automatically; actual the app requires the user to reselect it." }
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

> I canceled a PDF and the row kept saying 40 percent. Reloading fixed the list.

Staging build 1102, WebKit, 12 MB fixture PDF. The controlled transfer waits at 40 percent. The cancel response says `state=canceled`; the screenshot taken after the response still shows 40 percent. On reload the row correctly shows Canceled and the job log shows no completion. The upload list should display Canceled when the service confirms it.

Severity: S1 permanent loss or exposure; S2 required task blocked without a supported workaround; S3 misleading state or recoverable task impairment; S4 cosmetic only with correct state shown. Priority: P0 stop rollout for an unmitigated required task failure or S1; P1 current update for recurring cases without a practical workaround; P2 next maintenance window for a staging issue with a practical workaround. Reload is supported for this list.
