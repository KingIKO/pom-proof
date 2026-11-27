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
    prompt: Which severity matches what happened to the user?
    choices:
      - { id: s3, text: "S3. A secondary path is impaired or a reliable workaround exists." }
      - { id: s1, text: "S1. The app loses data permanently or exposes protected data." }
      - { id: s4, text: "S4. Only the appearance of the app is affected." }
      - { id: s2, text: "S2. A required task is blocked with no supported workaround." }
  - id: priority
    type: single-choice
    prompt: Which priority should the report recommend for the fix?
    choices:
      - { id: p2, text: "P2. Schedule the fix after sign-off." }
      - { id: p0, text: "P0. Fix it before today's sign-off." }
      - { id: p3, text: "P3. Put it in the backlog." }
  - id: component
    type: single-choice
    prompt: Which part of the app should get the report first?
    choices:
      - { id: eligibility, text: "The service that checks eligibility" }
      - { id: accounts, text: "The part that handles account sign-in" }
      - { id: form, text: "The benefits form and its error summary" }
      - { id: jobs, text: "The queue that processes applications" }
  - id: title
    type: single-choice
    prompt: Which title makes the problem easiest to find in a search?
    choices:
      - { id: vague, text: "Something is wrong with the benefits application form" }
      - { id: blame, text: "The benefits form developers broke the Tab order again" }
      - { id: long, text: "Staging build 284 shows the error summary when Postal code is empty. In Edge 135 on Windows 11, Tab cannot reach that field." }
      - { id: precise, text: "Tab keeps keyboard focus inside the benefits form error summary" }
  - id: steps
    type: ordering
    prompt: Put the steps that reproduce the problem in order.
    choices:
      - { id: observe, text: "From the summary, press Tab repeatedly and check where focus returns." }
      - { id: input, text: "Leave Postal code blank and fill in the other required fields." }
      - { id: open, text: "In the test account, open a new benefits application." }
      - { id: submit, text: "Use the keyboard to press Submit and open the error summary." }
  - id: missing
    type: multi-select
    prompt: What details are still missing for today's sign-off?
    choices:
      - { id: os, text: "The name of the operating system used" }
      - { id: repeat, text: "How many new applications show the same issue" }
      - { id: evidence, text: "The focus sequence or a short recording of it" }
      - { id: build, text: "The build number of the app tested" }
  - id: expected
    type: single-choice
    prompt: Which pair describes what should happen and what actually happens?
    choices:
      - { id: save, text: "The form should submit without a postal code. Instead, it says the field is required." }
      - { id: focus, text: "Tab should reach the invalid field from the error summary. Instead, Tab stays inside the summary." }
      - { id: speech, text: "The screen reader should read the summary aloud automatically. Instead, the screen reader crashes." }
      - { id: service, text: "The service should accept the form after a correction. Instead, the service rejects all applications." }
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

The test used staging build 284, Edge 135 on Windows 11, a keyboard only, and a test account. The screenshot shows the validation summary, which lists the errors, with the Postal code field below it. No submit request reached the server.

After validation, the supported keyboard path must reach the field. For these users, a pointer does not count as a workaround. This evidence comes from one attempt. The accessibility sign-off is today.

Severity describes the effect on the user:

- S1: The app loses data permanently or exposes protected data.
- S2: A required task is blocked with no supported workaround.
- S3: A secondary path is impaired or a reliable workaround exists.
- S4: Only appearance is affected.

Priority says when to fix the issue:

- P0: Fix it before today's sign-off.
- P2: Schedule the fix after sign-off.
- P3: Put it in the backlog.
