---
problem: test-design/loan-precheck-rules
---

## What is going on

Income and debt requirements always apply. A cosigner, someone who agrees to help repay the loan, changes only the minimum credit score. A decision table lists which conditions apply and which result each combination gives. Boundary value analysis places test values at the cutoffs. A mutant is a copy of the function with one planted mistake for the tests to catch.

## The answer

1. Test incomes of $30,000 and $29,999 at score 710 and 25 percent debt-to-income.

   Expect acceptance at $30,000 without a cosigner. Expect rejection at $29,999 even with one.

   **Why:** The exact $30,000 row catches the mutant that excludes the income floor. The lower row isolates income as a reason to fail, even when the application has a cosigner. Debt-to-income is the share of income that goes to debt payments.

2. At $45,000 and score 710, test both sides of the debt-to-income limit.

   Expect acceptance at 35 percent without a cosigner and rejection at 35.1 percent with one.

   **Why:** The exact 35 catches the mutant that excludes the debt ceiling. The rejection shows that the debt limit still applies with a cosigner, even though income and score are comfortably eligible.

3. At $45,000 and 25 percent debt-to-income, test both sides of the minimum score with and without a cosigner.

   Without a cosigner, reject 679 and accept 680. With a cosigner, reject 619 and accept 620.

   **Why:** The exact cutoffs catch the mutants that exclude the lowest qualifying score from each band, the score range for that group. The 619 result catches the mutant that waives the lower score floor for cosigned applications. The other conditions stay eligible, so they cannot hide errors in the score rules.

4. At $45,000, 25 percent debt-to-income and score 650, change only whether the applicant has a cosigner.

   Expect acceptance with a cosigner and rejection without one.

   **Why:** The pair catches the mutant that omits the cosigner condition. The applicant stays in the 620 through 679 band, so only that condition can explain the change.

## Why the tempting answer fails

The decoy, the tempting set of rows, has a comfortable pass without a cosigner and a pair at 650. Those rows are useful, and the pair catches the missing cosigner condition. Its applicant with low income, a low score, and high debt would still fail if any one check vanished. None of these rows shows whether a value equal to a cutoff passes.

## What the interviewer listens for

Say which conditions always apply. Explain why changing one condition that decides the result exposes a defect more clearly than failing all of them together.

## Sources

- [ISTQB CTFL Syllabus v4.0.1, sections 4.2.2 and 4.2.3](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
