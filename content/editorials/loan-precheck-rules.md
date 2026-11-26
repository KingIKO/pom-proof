---
problem: test-design/loan-precheck-rules
---

Break the score rule into bands. Below 620, a cosigner cannot make an applicant pass. From 620 through 679, compare the same income, score, and debt with and without a cosigner. At 680, a qualifying applicant can pass on their own. Keeping the other inputs comfortably in range prevents an income or debt failure from hiding a score defect.

Test the other cutoffs on purpose. At 30,000 dollars, the income rule passes; at 29,999 it fails. Debt-to-income of 35 percent passes, and 35.1 percent fails. Use a cosigner on the failing income and debt examples to show that their presence doesn't change those rules. The score checks at 619, 620, 679, and 680 do a different job: they place the boundaries between the score bands.

The weaker answer makes a useful cosigner comparison at an interior score, and that catches the missing cosigner condition. Its applicant who fails all the conditions would still fail if any single check vanished. It never establishes whether equality counts at the cutoffs.

An interviewer listens for the distinction between conditions that always apply and the one condition a cosigner changes. The decision table shows the business rule; the boundary rows show where it takes effect.

Source: [ISTQB CTFL Syllabus v4.0.1, sections 4.2.2 and 4.2.3](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf).
