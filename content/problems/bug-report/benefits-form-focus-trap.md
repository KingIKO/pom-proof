---
title: Report a keyboard trap in the benefits form
kind: bug-report
topic: defect-reporting
difficulty: medium
minutes: 9
roles: [manual-qa, automation, senior]
items:
  - id: severity
    type: single-choice
    prompt: Which severity matches the demonstrated impact?
    choices:
      - { id: s3, text: "S3, secondary path impaired or reliable workaround exists" }
      - { id: s1, text: "S1, permanent loss or exposure of protected data" }
      - { id: s4, text: "S4, cosmetic only" }
      - { id: s2, text: "S2, required task blocked with no supported workaround" }
  - id: priority
    type: single-choice
    prompt: Which fix priority should the ticket propose?
    choices:
      - { id: p2, text: "P2, schedule after sign-off" }
      - { id: p0, text: "P0, before today's sign-off" }
      - { id: p3, text: "P3, backlog" }
  - id: component
    type: single-choice
    prompt: Which component should receive the report first?
    choices:
      - { id: eligibility, text: "Eligibility service" }
      - { id: accounts, text: "Account sign-in" }
      - { id: form, text: "Benefits form and validation summary" }
      - { id: jobs, text: "Application processing queue" }
  - id: title
    type: single-choice
    prompt: Which title makes the symptom easiest to find?
    choices:
      - { id: vague, text: "Benefits form broken" }
      - { id: blame, text: "Form developers broke the tab order again" }
      - { id: long, text: "Staging build 284 shows a validation summary after leaving Postal code empty and Tab cannot reach the field in Edge 135 on Windows 11" }
      - { id: precise, text: "Keyboard focus stays in the benefits form error summary" }
  - id: steps
    type: ordering
    prompt: Order the steps that produced the failure.
    choices:
      - { id: observe, text: "Press Tab repeatedly from the summary and observe where focus cycles." }
      - { id: input, text: "Fill the other required fields and leave Postal code empty." }
      - { id: open, text: "Open a fresh benefits application in the test account." }
      - { id: submit, text: "Activate Submit with the keyboard to reveal the validation summary." }
  - id: missing
    type: multi-select
    prompt: What is still needed to make this report usable at sign-off?
    choices:
      - { id: os, text: "Operating system name" }
      - { id: repeat, text: "Reproduction count across fresh applications" }
      - { id: evidence, text: "The actual sequence of focused elements or a short recording" }
      - { id: build, text: "Application build number" }
  - id: expected
    type: single-choice
    prompt: Which expected and actual result should be filed?
    choices:
      - { id: save, text: "Expected successful submission without a postal code; actual the form marks it required." }
      - { id: focus, text: "Expected keyboard access from the summary to the invalid field; actual Tab cycles inside the summary." }
      - { id: speech, text: "Expected the summary to speak automatically; actual the screen reader crashes." }
      - { id: service, text: "Expected the service to accept corrected data; actual it rejects all applications." }
reference:
  severity: s2
  priority: p0
  component: form
  title: precise
  steps: [open, input, submit, observe]
  missing: [repeat, evidence]
  expected: focus
decoy:
  severity: s3
  priority: p0
  component: form
  title: long
  steps: [open, input, submit, observe]
  missing: [repeat, build]
  expected: focus
---

> I left Postal code empty and submitted. Now Tab keeps taking me back to the same error summary.

Staging build 284, Edge 135, Windows 11, keyboard-only, test account. A screenshot shows the summary and the Postal code field below it. No submit request reached the server. The supported keyboard path must reach the field after validation; pointer input is not a workaround for this audience. Evidence is from one attempt. The accessibility sign-off is today.

Severity: S1 permanent data loss or protected data exposed; S2 required task blocked with no supported workaround; S3 secondary path impaired or reliable workaround exists; S4 cosmetic only. Priority: P0 fix before today's sign-off; P2 schedule after sign-off; P3 backlog.
