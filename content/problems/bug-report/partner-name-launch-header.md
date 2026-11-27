---
title: Report the old partner name on a launch page
kind: bug-report
topic: defect-reporting
difficulty: easy
minutes: 8
roles: [manual-qa, senior]
items:
  - id: severity
    type: single-choice
    prompt: How serious is this bug under the team's rules for what users can do?
    choices:
      - { id: s1, text: "S1: The system permanently loses data or exposes protected data." }
      - { id: s4, text: "S4: The display is wrong without affecting any of the user's tasks." }
      - { id: s3, text: "S3: A secondary task is harder or a supported workaround exists." }
      - { id: s2, text: "S2: Users cannot complete a required task and have no workaround." }
  - id: priority
    type: single-choice
    prompt: When does the launch rule say to fix this?
    choices:
      - { id: p3, text: "P3: Leave the fix without a date." }
      - { id: p1, text: "P1: Fix it after launch this week." }
      - { id: p0, text: "P0: Fix it before the launch today." }
  - id: component
    type: single-choice
    prompt: Which part of the app shows the label from the screenshot?
    choices:
      - { id: landing, text: "The partner's landing page" }
      - { id: signup, text: "The service that handles registration" }
      - { id: oauth, text: "The service that verifies identity" }
      - { id: payments, text: "The page that confirms payment" }
  - id: title
    type: single-choice
    prompt: Which short title names what is wrong and where users see it?
    choices:
      - { id: blame, text: "Marketing published the wrong partner wording again" }
      - { id: precise, text: "Partner landing page heading shows the old company name" }
      - { id: vague, text: "Something is wrong with the partner campaign on staging" }
      - { id: long, text: "On staging build 615, the English invitation preview for Oakline Mutual shows Oakline General in the heading. The heading appears before registration starts." }
  - id: steps
    type: ordering
    prompt: Put the steps for reaching and checking the heading in order.
    choices:
      - { id: compare, text: "Compare the heading on the page with the approved name." }
      - { id: preview, text: "Open the landing page preview for the campaign you selected." }
      - { id: sign-in, text: "Sign in to the staging tool for campaign previews." }
      - { id: select, text: "In the staging campaign list, choose the launch campaign." }
  - id: missing
    type: multi-select
    prompt: Which missing details would help the team find this exact preview?
    choices:
      - { id: campaign, text: "The ID of the campaign selected on staging" }
      - { id: browser, text: "The browser and version used for the preview" }
      - { id: url, text: "The preview URL with its locale and path but no private details" }
      - { id: build, text: "The build number for the staging preview" }
  - id: expected
    type: single-choice
    prompt: Which expected and actual results match the evidence?
    choices:
      - { id: invalid, text: "The invitation should work. Instead, the link expires when the visitor clicks it." }
      - { id: generic, text: "Customers should see the site owner's brand. Instead, registered customers see a partner brand." }
      - { id: header, text: "The page heading should say Oakline Mutual. Instead, it says Oakline General." }
      - { id: registration, text: "The visitor should be able to finish registering. Instead, the form never opens." }
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

> I see Oakline General in the invitation preview. The partner's approved name is Oakline Mutual.

The test used staging build 615 in Firefox 138. Staging is the test environment. Sign in to the preview tool and open the launch campaign. The screenshot shows the old partner name in the heading of the English landing page. A landing page is the first page an invited user opens.

Users can finish registering with that invitation. The team has several campaigns on staging. The screenshot leaves out the page's route, or path in its URL. The locale identifies the page's language or region. The partner agreement requires the approved name at today's launch.

Severity tells how serious the bug is:

- S1: The system permanently loses data or exposes protected data.
- S2: A required task is blocked and has no workaround.
- S3: A secondary task is harder or a supported workaround exists.
- S4: The display is wrong. Users can still complete their tasks.

Priority tells when to fix it:

- P0: If a launch requirement fails, fix it before today's launch.
- P1: Fix it this week after launch.
- P3: Leave the fix without a target date.
