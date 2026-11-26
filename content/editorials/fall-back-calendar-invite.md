---
problem: bug-report/fall-back-calendar-invite
---

The booking preserves the second occurrence, and the calendar client opens the wrong instant. Report the symptom in the invite path and ask for the redacted attachment. The team will need the start field to distinguish bad bytes from a calendar client interpreting good bytes incorrectly. The component choice is a triage starting point.

Open the fixture date, confirm the second occurrence, and open the attachment from that confirmation. Then compare its displayed instant with the booking record. Capture the booking and notification identifiers so an engineer can retrieve the same outputs. Keep the venue zone and date already supplied; local time without the two distinct instants would conceal the difference.

The supported booking page keeps the appointment usable, so S3 fits. P1 puts the fix before the affected appointments. The decoy treats the incorrect invite as an unusable booking, which overstates what was observed.

See [RFC 5545 on date-time values](https://www.rfc-editor.org/rfc/rfc5545.html#section-3.3.5) for calendar representations. An interviewer wants both timestamps and enough evidence to narrow the component without guessing the cause.
