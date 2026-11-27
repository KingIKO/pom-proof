---
problem: bug-report/fall-back-calendar-invite
---

## What is going on

On November 1, 2026, in `America/New_York`, two different instants share the clock time 01:30. The booking record retains the second occurrence, `06:30 UTC`. The opened calendar entry shows `05:30 UTC`, the earlier occurrence.

## The answer

1. Assign S3: a secondary path is wrong and a documented route remains available.

   **Why:** The booking page still shows the correct appointment and is the supported way to verify its time.

2. Assign P1, before the affected autumn appointments.

   **Why:** A customer who relies on the invite could show up an hour early, even though the booking itself is usable.

3. Start triage with calendar invite generation.

   **Why:** The first observed mismatch is in the invite path. Until the attachment is examined, calendar generation and calendar-client interpretation are both possible explanations.

4. Use the title “Calendar invite opens at the earlier 01:30 for the second booking.”

   **Why:** It records the user's symptom without claiming the invite file itself contains the wrong value.

5. Open the fixture venue calendar on November 1, confirm the second 01:30 slot, open that confirmation's attachment, then compare its displayed instant with the booking record.

   **Why:** Using one confirmation keeps the comparison tied to one booking. Reporting UTC alongside the supplied venue zone and date keeps the repeated wall-clock time from hiding the discrepancy.

6. Request the redacted invite file with its start field and the test booking and notification IDs.

   **Why:** The IDs let an engineer retrieve the same outputs. The actual start field separates bad calendar data from a client opening correctly encoded data at the wrong time.

7. Record that both should represent `06:30 UTC`; the invite opens at `05:30 UTC` and the booking remains at `06:30 UTC`.

   **Why:** The two UTC values prove the booked instant changed along the invite path even though both values appear as 01:30 locally.

## Why the tempting answer fails

S2 and P0 treat the defect as an unusable booking. The documented booking page rules that out, and the audit timestamp gives no reason to start with storage. The IDs are useful, but date and zone are already supplied; ask for the file instead. Keep the decoy's title and reproducer, along with its expected versus actual result.

## What the interviewer listens for

Tell the two instants apart and show how the attachment would narrow the investigation without guessing the cause.

## Sources

- [RFC 5545: date-time values](https://www.rfc-editor.org/rfc/rfc5545.html#section-3.3.5)
