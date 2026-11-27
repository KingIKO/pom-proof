---
problem: test-design/monthly-renewal-date
---

## What is going on

A renewal moves forward by one calendar month and keeps the original billing day. If that day does not exist in the next month, use that month's last day. Some JavaScript date operations carry a day that is too large for its month into the following month. So check the whole date. A mutant is a copy of the function with one planted mistake for the tests to catch.

## The answer

1. Start in January with billing day 31, and test the years 2025, 2024, 1900, and 2000.

   Expect `2025-02-28`, `2024-02-29`, `1900-02-28`, and `2000-02-29`, in that order.

   **Why:** The ordinary leap year catches the mutant that ignores leap days. Both century years are divisible by four and by 100, but only 2000 is divisible by 400. So the pair catches a mutant that treats every multiple of four as a leap year. It also catches one that excludes every century year.

2. In 2025, test renewals from February and March with billing day 31, and from May with billing day 15.

   Expect `2025-03-31` from February, `2025-04-30` from March, and `2025-06-15` from May.

   **Why:** The renewal into March catches a mutant that carries February's shortened day forward. The renewal into April catches a mutant that overlooks a 30-day month outside February. The May row is an ordinary control in the middle of the month. It checks that a billing day that exists in the next month needs no adjustment.

3. From December 2025 with billing day 7, expect `2026-01-07`.

   **Why:** Checking the full date catches the mutant that leaves the year unchanged. Leading zeros are part of the expected format, so a single-digit day also exposes a formatting error.

## Why the tempting answer fails

The decoy, the tempting set of rows, uses the common February case and a case in the middle of the month. Both pass even if the leap day or April's length is wrong. Its December 15 case catches the missing move to the next year. But its two-digit day does not test whether the day gets a leading zero. The decoy also never shows that the original day comes back after a short month.

## What the interviewer listens for

Explain the calendar rule without counting how many days have passed. In table mode or code mode, check the exact date string, including the year.

## Sources

- [MDN, Date components and overflow](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_components_and_time_zones)
- [ISTQB CTFL syllabus v4.0.1, section 4.2.1, equivalence partitioning](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
