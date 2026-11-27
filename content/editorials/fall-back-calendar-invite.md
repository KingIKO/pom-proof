---
problem: bug-report/fall-back-calendar-invite
---

## What is going on

On November 1, 2026, in `America/New_York`, two different instants share the clock time 01:30. An instant is one exact moment in time. UTC names each instant without that repeat.

The booking record keeps the second occurrence, `06:30 UTC`. The opened calendar entry shows `05:30 UTC`, the earlier occurrence.

## The answer

1. Assign S3: a secondary path is wrong and a documented route remains available.

   **Why:** Severity describes how much harm the defect causes. The booking page still shows the correct appointment. It is also the supported way to check the appointment's time.

2. Assign P1, before the affected autumn appointments.

   **Why:** Priority says how soon to fix the defect. A customer who relies on the invite could arrive an hour early. That risk remains even though the booking itself is usable.

3. Start triage with calendar invite generation.

   **Why:** Triage is the first sorting of a defect to decide where to look. The first mismatch you can observe is in the invite path. Until someone examines the attachment, two explanations remain possible. Calendar generation may write the wrong time, or the calendar client, the app that opens the invite, may read it wrongly.

4. Choose a title that says the calendar invite opens at the earlier 01:30 even though the customer booked the second one.

   **Why:** The title records the user's symptom. It does not claim that the invite file itself contains the wrong value.

5. Reproduce the invite mismatch for the second 01:30 slot on November 1.

   Open the calendar for the fixture venue, a prepared test venue, and confirm that slot. Open the attachment from the confirmation. Compare the instant it shows with the booking record.

   **Why:** Using one confirmation keeps the comparison tied to one booking. If the report gives UTC next to the supplied venue zone and date, the repeated clock time cannot hide the mismatch.

6. Request the evidence that connects the invite file with the test booking.

   Ask for the redacted invite file, with personal details removed and the start field retained. Ask for the test booking and notification IDs.

   **Why:** The IDs let an engineer retrieve the same outputs. The actual start field shows which of two faults occurred. Either the calendar data is wrong, or a client opens correctly encoded data at the wrong time.

7. Record the expected and actual times in the ticket.

   Both should represent `06:30 UTC`. The invite opens at `05:30 UTC`, and the booking remains at `06:30 UTC`.

   **Why:** Both values appear as 01:30 in local time. The two UTC values still prove that the booked instant changed along the invite path.

## Why the tempting answer fails

The decoy's S2 and P0 treat the defect as an unusable booking. The documented booking page rules that out. The audit timestamp is correct, so it gives no reason to start with storage. The IDs are useful. The date and zone are already supplied, so ask for the file instead.

Keep the decoy's title and reproduction steps, along with its expected versus actual result.

## What the interviewer listens for

Tell the two instants apart. Show how the attachment would narrow the search for the cause, without guessing that cause.

## Sources

- [RFC 5545: date-time values](https://www.rfc-editor.org/rfc/rfc5545.html#section-3.3.5)
