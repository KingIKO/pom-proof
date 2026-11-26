---
title: Report a wrong partner name at launch
kind: bug-report
topic: defect-reporting
difficulty: easy
minutes: 8
roles: [manual-qa, senior]
items:
  - id: severity
    type: single-choice
    prompt: Which severity follows the team's functional impact scale?
    choices:
      - { id: s1, text: "S1, irreversible data loss or protected data exposed" }
      - { id: s4, text: "S4, presentation error with no task impact" }
      - { id: s3, text: "S3, secondary task impaired or supported workaround exists" }
      - { id: s2, text: "S2, required task blocked with no workaround" }
  - id: priority
    type: single-choice
    prompt: Which fix priority fits the evidence and launch rule?
    choices:
      - { id: p3, text: "P3, no target date" }
      - { id: p1, text: "P1, fix this week after launch" }
      - { id: p0, text: "P0, fix before today's launch" }
  - id: component
    type: single-choice
    prompt: Which component owns the observed label?
    choices:
      - { id: landing, text: "Partner landing page" }
      - { id: signup, text: "Registration service" }
      - { id: oauth, text: "Identity provider" }
      - { id: payments, text: "Payment confirmation" }
  - id: title
    type: single-choice
    prompt: Which title gives a concise symptom and location?
    choices:
      - { id: blame, text: "Marketing shipped the wrong partner copy again" }
      - { id: precise, text: "Partner landing header shows the retired company name" }
      - { id: vague, text: "Partner issue on staging" }
      - { id: long, text: "English invitation landing preview for Oakline Mutual on staging build 615 shows Oakline General in the top header before registration begins" }
  - id: steps
    type: ordering
    prompt: Order the path to the header shown in the screenshot.
    choices:
      - { id: compare, text: "Compare the loaded header with the approved partner name." }
      - { id: preview, text: "Open the generated landing preview from the selected campaign." }
      - { id: sign-in, text: "Sign in to the staging preview console." }
      - { id: select, text: "Select the launch campaign from the staging campaign list." }
  - id: missing
    type: multi-select
    prompt: Which missing details identify the affected preview for the team?
    choices:
      - { id: campaign, text: "Campaign ID from the staging selection" }
      - { id: browser, text: "Browser and version" }
      - { id: url, text: "Redacted preview URL showing its locale and route" }
      - { id: build, text: "Staging build" }
  - id: expected
    type: single-choice
    prompt: Which comparison is supported?
    choices:
      - { id: invalid, text: "Expected an invitation to validate; actual the link expires on click." }
      - { id: generic, text: "Expected the site owner's brand; actual the registered customer sees a partner brand." }
      - { id: header, text: "Expected Oakline Mutual in the header; actual the header reads Oakline General." }
      - { id: registration, text: "Expected registration completion; actual the form refuses to open." }
reference:
  severity: s4
  priority: p0
  component: landing
  title: precise
  steps: [sign-in, select, preview, compare]
  missing: [campaign, url]
  expected: header
decoy:
  severity: s2
  priority: p0
  component: landing
  title: long
  steps: [sign-in, select, preview, compare]
  missing: [campaign, build]
  expected: header
---

> The invitation preview says Oakline General. Their approved name is Oakline Mutual.

Staging build 615, Firefox 138. Preview the launch campaign from the signed-in console. The screenshot shows the retired name in the English landing header. Registration completes with that invitation. The team has several staging campaigns, and the screenshot omits the route. The partner agreement requires the approved name at today's launch.

Severity: S1 irreversible data loss or protected data exposed; S2 required task blocked with no workaround; S3 secondary task impaired or supported workaround exists; S4 presentation error with no task impact. Priority: P0 before today's launch if a launch condition fails; P1 fix this week after launch; P3 no target date.
