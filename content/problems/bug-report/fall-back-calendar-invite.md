---
title: Report a calendar invite for the wrong occurrence
kind: bug-report
topic: defect-reporting
difficulty: hard
minutes: 10
roles: [automation, sdet, senior]
items:
  - id: severity
    type: single-choice
    prompt: Which severity reflects the supported way to recover?
    choices:
      - { id: s1, text: "S1, confirmed booking data lost permanently" }
      - { id: s3, text: "S3, secondary path wrong with a documented route to complete the task" }
      - { id: s2, text: "S2, appointment cannot be kept using a supported route" }
      - { id: s4, text: "S4, visual formatting only" }
  - id: priority
    type: single-choice
    prompt: Which priority fits the scheduled appointments?
    choices:
      - { id: p2, text: "P2, fix after the affected appointment window" }
      - { id: p0, text: "P0, halt all booking today" }
      - { id: p1, text: "P1, fix before the autumn appointments" }
  - id: component
    type: single-choice
    prompt: Where should triage begin given the recorded booking instant?
    choices:
      - { id: slots, text: "Slot availability" }
      - { id: invite, text: "Calendar invite generation" }
      - { id: login, text: "Venue staff sign-in" }
      - { id: storage, text: "Booking persistence" }
  - id: title
    type: single-choice
    prompt: Which title conveys the precise mismatch?
    choices:
      - { id: long, text: "Staging build 812 calendar invite for a New York second 01:30 appointment on November 1 opens at the first 01:30 even though the booking audit timestamp is correct" }
      - { id: precise, text: "Calendar invite opens at the earlier 01:30 for the second booking" }
      - { id: blame, text: "Calendar developer ignored the fall clock change" }
      - { id: vague, text: "Calendar appointment issue" }
  - id: steps
    type: ordering
    prompt: Order the path that compares the invite with the booked instant.
    choices:
      - { id: confirm, text: "Confirm the slot marked as the second 01:30 occurrence." }
      - { id: compare, text: "Compare the invite's start instant with the one retained by the booking." }
      - { id: open, text: "Open the fixture venue calendar for November 1, 2026." }
      - { id: download, text: "Open the calendar attachment for that confirmation." }
  - id: missing
    type: multi-select
    prompt: Which missing artifacts would tie the invite symptom to the tested booking?
    choices:
      - { id: file, text: "Redacted invite file, including its actual start field" }
      - { id: date, text: "Venue date and time zone" }
      - { id: version, text: "Staging build" }
      - { id: ids, text: "Test booking and notification identifiers" }
  - id: expected
    type: single-choice
    prompt: Which result should be recorded?
    choices:
      - { id: unavailable, text: "Expected the second slot to appear; actual only one slot can be booked." }
      - { id: equal, text: "Expected invite and booking at 06:30 UTC; actual the invite opens at 05:30 UTC and the booking stays at 06:30 UTC." }
      - { id: offset, text: "Expected a 05:30 UTC booking; actual both systems move the booking to 06:30 UTC." }
      - { id: absent, text: "Expected a calendar attachment; actual no attachment arrives." }
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

> I booked the second 01:30 class. The calendar attachment shows the earlier one even though my booking page is right.

Staging build 812, Firefox 138, America/New_York venue, November 1, 2026. Screenshot: confirmed second 01:30. The booking audit stores `06:30 UTC`; the opened calendar entry shows `05:30 UTC`. The attachment itself was not saved. Invitations must preserve the booked instant. The booking page is the documented way to verify the correct time. Do not wait until the autumn appointment window to fix bad invites.

Severity: S1 confirmed booking data permanently lost; S2 appointment cannot be kept via a supported route; S3 secondary path wrong with a documented route; S4 formatting only. Priority: P0 halt booking for lost or unusable bookings; P1 before the affected appointments for incorrect invites with a workaround; P2 defer past the appointment window for appearance issues.
