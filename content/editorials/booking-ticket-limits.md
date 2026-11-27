---
problem: test-design/booking-ticket-limits
---

## What is going on

The venue checks the buyer's age and the number of tickets separately. Either check can reject the booking. Boundary value analysis tests values at and near a limit. Keep one input safely in range while you test the other.

## The answer

1. Test ages 17, 18, and 19 with three tickets.

   **Why:** Expect `age-restricted` at 17 and `accepted` at 18 and 19. A mutant is a changed version of the code with a mistake the test should catch. Seventeen catches the mutant that admits the oldest underage buyer. Age 18 catches the one that rejects the youngest eligible buyer. With a valid count, any rejection comes from the age check.

2. Test 0, 1, and 2 tickets with a 30-year-old buyer.

   **Why:** Expect `quantity-invalid` for 0 and `accepted` for 1 and 2. Zero catches the mutant that accepts a count just below the minimum. One catches the mutant that rejects the smallest valid booking.

3. Test 5, 6, and 7 tickets at the same age.

   **Why:** Expect `accepted` for 5 and 6 and `quantity-invalid` for 7. Six catches the mutant that rejects the exact cap. Seven catches the mutant that accepts a count just above it.

4. Test a request for 2.5 tickets at age 30.

   **Why:** Expect `quantity-invalid`. The mutant that accepts fractions would pass every test row with a whole number. A fraction between the limits shows whether the code checks for a whole number.

## Why the tempting answer fails

The row with age 18 and six tickets can catch either exact limit being excluded. If the row fails, you have two possible causes. Age 12 and ten tickets still get rejected even if the code allows one year or one ticket beyond the limit. Those cases miss the closest values the code would accept wrongly.

## What the interviewer listens for

Explain which input stays the same and why. In table mode, enter the exact reason codes. In code mode, check the same values. To see which rule takes precedence, give an underage buyer an invalid quantity in a separate check and expect `age-restricted`.

## Sources

- [ISTQB CTFL Syllabus v4.0.1, section 4.2.2, boundary value analysis](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
