---
problem: test-design/monthly-renewal-date
---

## What is going on

Renewal moves by calendar month and keeps the original billing day. If that day is missing in the next month, use its last day. Some JavaScript date operations carry an overflowing day into the following month, so assert the whole date.

## The answer

1. Start in January with billing day 31. Expect `2025-02-28`, `2024-02-29`, `1900-02-28`, and `2000-02-29` for their respective years.

   **Why:** An ordinary leap year catches the mutant that ignores leap days. Both century years are divisible by four and by 100, but only 2000 is divisible by 400. The pair catches both a mutant that treats every multiple of four as leap and one that excludes every century year.

2. In 2025, keep the original day at 31 and test February to `2025-03-31` and March to `2025-04-30`. Use May day 15 to `2025-06-15` as an ordinary control.

   **Why:** March catches a mutant that carries forward February's shortened day. April catches a mutant that overlooks a 30-day month outside February. The mid-month control checks that an existing billing day needs no adjustment.

3. Start in December 2025 with billing day 7 and expect `2026-01-07`.

   **Why:** The full padded date catches the mutant that leaves the year unchanged. A single-digit day also makes a formatting error observable.

## Why the tempting answer fails

The common February and mid-month cases pass even if leap day or April's length is wrong. The December 15 case catches the missing year advance, but its two-digit day does not exercise day padding. The decoy never shows that the original day returns after a short month.

## What the interviewer listens for

Explain the calendar rule without relying on elapsed days. In table mode or code mode check the exact date string, including the year.

## Sources

- [MDN, Date components and overflow](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_components_and_time_zones)
- [ISTQB CTFL syllabus v4.0.1, section 4.2.1, equivalence partitioning](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
