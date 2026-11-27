---
problem: test-design/loan-precheck-rules
---

## What is going on

Income and debt requirements always apply. A cosigner changes only the minimum credit score. A decision table describes which conditions apply; boundary value analysis places the cutoffs.

## The answer

1. At score 710 and 25 percent debt-to-income, expect acceptance at $30,000 without a cosigner and rejection at $29,999 even with one.

   **Why:** The exact $30,000 row catches the mutant that excludes the income floor. The lower row isolates income as a reason to fail even when the application has a cosigner.

2. Keep income and score comfortably eligible. Expect acceptance at 35 percent debt-to-income without a cosigner and rejection at 35.1 percent with one.

   **Why:** The exact 35 catches the mutant that excludes the debt ceiling. Having a cosigner in the failing row confirms that this condition still applies.

3. At $45,000 and 25 percent debt-to-income, compare scores 679 and 680 without a cosigner and 619 and 620 with one. Only 680 and 620 qualify in their respective pairs.

   **Why:** The exact cutoffs catch the mutants that exclude the lowest qualifying score in each band. The 619 result catches the mutant that waives the lower score floor for cosigned applications. Keeping other conditions eligible prevents them from hiding errors in the score rules.

4. At a score of 650, keep income and debt unchanged and flip only the cosigner flag. Expect acceptance with a cosigner and rejection without one.

   **Why:** The same applicant in the 620 through 679 band exposes the mutant that omits the cosigner condition.

## Why the tempting answer fails

The comfortable solo pass and the pair at 650 are useful. The pair catches the missing cosigner condition. The applicant with low income, low score, and high debt would still fail if any one check vanished. None of these rows shows whether equality passes at any cutoff.

## What the interviewer listens for

Say which conditions always apply and why changing one effective condition exposes a defect more clearly than failing all of them together.

## Sources

- [ISTQB CTFL Syllabus v4.0.1, sections 4.2.2 and 4.2.3](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
