---
title: Report an invite for the earlier of two time slots
kind: bug-report
topic: defect-reporting
difficulty: hard
minutes: 10
roles: [automation, sdet, senior]
items:
  - id: severity
    type: single-choice
    prompt: How serious is the bug given the other way to find the right time?
    choices:
      - { id: s1, text: "S1: The system permanently loses data for a confirmed booking." }
      - { id: s3, text: "S3: A secondary route is wrong, but a documented route works." }
      - { id: s2, text: "S2: No supported route lets a customer keep their appointment." }
      - { id: s4, text: "S4: The issue affects only how the information is formatted." }
  - id: priority
    type: single-choice
    prompt: When should the team fix the invite given the appointment dates?
    choices:
      - { id: p2, text: "P2: Fix it after the affected appointments." }
      - { id: p0, text: "P0: Stop all booking today." }
      - { id: p1, text: "P1: Fix it before the autumn appointments." }
  - id: component
    type: single-choice
    prompt: Given the time saved with the booking, where should you look first?
    choices:
      - { id: slots, text: "The check for open slots" }
      - { id: invite, text: "The code that creates invites" }
      - { id: login, text: "The venue staff sign-in page" }
      - { id: storage, text: "The code that saves bookings" }
  - id: title
    type: single-choice
    prompt: Which title names exactly how the times differ?
    choices:
      - { id: long, text: "On staging build 812, the invite for the second New York 01:30 on November 1 opens at the first 01:30. The booking audit shows the right time." }
      - { id: precise, text: "Calendar invite opens at the first 01:30 for the second slot" }
      - { id: blame, text: "The calendar developer overlooked the clock change in the fall" }
      - { id: vague, text: "Something is wrong with the time in the calendar invite" }
  - id: steps
    type: ordering
    prompt: Put the steps for comparing the invite and booking times in order.
    choices:
      - { id: confirm, text: "Confirm the slot marked as the second 01:30." }
      - { id: compare, text: "Compare the invite start time with the stored booking time." }
      - { id: open, text: "Open the test venue's calendar for November 1, 2026." }
      - { id: download, text: "Open the calendar file attached to the booking confirmation." }
  - id: missing
    type: multi-select
    prompt: Which missing records would connect the wrong invite time to this booking?
    choices:
      - { id: file, text: "The invite file without private details, but with its start field" }
      - { id: date, text: "The date and time zone at the venue" }
      - { id: version, text: "The build number for the staging app" }
      - { id: ids, text: "The IDs of the test booking and notification" }
  - id: expected
    type: single-choice
    prompt: Which expected and actual results belong in the report?
    choices:
      - { id: unavailable, text: "The calendar should show the second slot. Instead, it lets the user book only one slot." }
      - { id: equal, text: "Both times should be 06:30 UTC. Instead, the invite opens at 05:30 UTC, and the booking stays at 06:30 UTC." }
      - { id: offset, text: "The booking should be at 05:30 UTC. Instead, both systems move it to 06:30 UTC." }
      - { id: absent, text: "The confirmation should include a calendar file for the booking. Instead, no file arrives." }
reference:
  severity: s3
  priority: p1
  component: invite
  title: precise
  steps: [open, confirm, download, compare]
  missing: [file, ids]
  expected: equal
decoy:
  severity: s2
  priority: p0
  component: storage
  title: precise
  steps: [open, confirm, download, compare]
  missing: [ids, date]
  expected: equal
---

> I booked the second 01:30 class. My booking page shows the right time. The calendar file shows the earlier slot.

The test used staging build 812 in Firefox 138. Staging is the test environment. The venue uses the `America/New_York` time zone. The screenshot confirms the second 01:30 slot on November 1, 2026.

The booking audit, or record of booking activity, stores `06:30 UTC`. UTC gives both systems one time standard to compare. The opened calendar entry shows `05:30 UTC`. No one saved the calendar file itself.

Invites must keep the exact booked time. The documented way to check the correct time is the booking page. Fix bad invites before the autumn appointments.

Severity tells how serious the bug is:

- S1: The system permanently loses confirmed booking data.
- S2: No supported route lets users keep the appointment.
- S3: A secondary route gives the wrong result. A documented route still works.
- S4: Only the formatting is wrong.

Priority tells when to fix it:

- P0: If bookings are lost or unusable, stop all booking.
- P1: If invites are wrong and a workaround exists, fix them before the affected appointments.
- P2: If only appearance is affected, fix it after the appointments.
