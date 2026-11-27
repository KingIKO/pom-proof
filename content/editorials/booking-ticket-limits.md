---
problem: test-design/booking-ticket-limits
---

## What is going on

The venue uses an age gate and a separate ticket limit. Either can reject a booking, so the boundary value analysis holds one input safely in range while probing the other.

## The answer

1. Hold the count at three. Expect `age-restricted` at age 17 and `accepted` at 18 and 19.

   **Why:** Seventeen catches the mutant that admits the closest underage buyer; 18 catches the one that excludes the youngest eligible buyer. A valid count makes any rejection about age.

2. Use a 30-year-old buyer and try 0, 1, and 2 tickets. Expect `quantity-invalid` for 0 and `accepted` for 1 and 2.

   **Why:** Zero catches the mutant that accepts one ticket count below the minimum. One catches the mutant that rejects the smallest valid booking.

3. Keep the same age and try 5, 6, and 7 tickets. Expect `accepted` for 5 and 6 and `quantity-invalid` for 7.

   **Why:** Six catches the mutant that rejects the exact cap; seven catches the one that admits a count just above it.

4. Add a request for 2.5 tickets at age 30 and expect `quantity-invalid`.

   **Why:** The mutant that accepts fractions would pass every whole-number row. A fractional value inside the numerical range exposes the missing whole-number check.

## Why the tempting answer fails

The row with age 18 and six tickets can catch either exact limit being excluded, but it puts two possible causes in one row. Age 12 and ten tickets still fail when the code is too permissive by one, so those cases miss the nearest wrong acceptances.

## What the interviewer listens for

Explain what stays constant and why. In table mode enter the exact reason codes; in code mode assert the same values. As a separate precedence check, combine an underage buyer with an invalid quantity and expect `age-restricted`.

## Sources

- [ISTQB CTFL Syllabus v4.0.1, section 4.2.2, boundary value analysis](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
