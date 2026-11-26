---
problem: test-design/booking-ticket-limits
---

Hold the ticket count at three and test ages 17, 18, and 19. The first age should get `"age-restricted"` and the next two should get `"accepted"`. That tells you where the result changes. Keep the quantity ordinary so a rejection can't come from an invalid ticket count.

For the quantity checks, use a buyer aged 30. Try 0, 1, and 2 tickets at the lower end and 5, 6, and 7 at the upper end. One and six are both valid. Zero and seven catch errors that extend the valid range by a single ticket. Add 2.5 to check the whole-number rule. Testing more whole numbers in the middle would never catch a missing integer check.

The weaker answer does include an age of 18 and a count of six. It can catch an implementation that excludes either exact limit. But age 12 and a ten-ticket request are too far from the cutoffs to spot a one-step expansion. Putting two limits in a single row also makes a rejection harder to diagnose.

An interviewer listens for which input you're holding steady and why. For a separate precedence check, combine an underage buyer with an invalid quantity and assert the exact reason code.

Source: [ISTQB CTFL Syllabus v4.0.1, section 4.2.2, boundary value analysis](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf).
