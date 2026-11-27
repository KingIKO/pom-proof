---
title: Check who passes the first loan screening
kind: test-design
topic: decision-tables
difficulty: hard
minutes: 14
roles: [manual-qa, sdet, senior]
exportName: passesLoanPrecheck
params:
  - { name: annualIncome, type: number, label: Yearly income (dollars) }
  - { name: score, type: number, label: Applicant’s credit score }
  - { name: debtPercent, type: number, label: Debt-to-income percent }
  - { name: hasCosigner, type: boolean, label: Applying with cosigner }
implementation: |
  export function passesLoanPrecheck(annualIncome, score, debtPercent, hasCosigner) {
    return annualIncome >= 30000 && debtPercent <= 35
      && (score >= 680 || (score >= 620 && hasCosigner));
  }
mutants:
  - name: excludes-income-floor
    teaches: Use the lowest income that qualifies. Meet every other rule.
    implementation: |
      export function passesLoanPrecheck(annualIncome, score, debtPercent, hasCosigner) {
        return annualIncome > 30000 && debtPercent <= 35
          && (score >= 680 || (score >= 620 && hasCosigner));
      }
  - name: excludes-debt-ceiling
    teaches: Use the highest debt-to-income percentage that qualifies. Meet every other rule.
    implementation: |
      export function passesLoanPrecheck(annualIncome, score, debtPercent, hasCosigner) {
        return annualIncome >= 30000 && debtPercent < 35
          && (score >= 680 || (score >= 620 && hasCosigner));
      }
  - name: excludes-solo-score-floor
    teaches: If the applicant has no cosigner, use the lowest score that qualifies.
    implementation: |
      export function passesLoanPrecheck(annualIncome, score, debtPercent, hasCosigner) {
        return annualIncome >= 30000 && debtPercent <= 35
          && (score > 680 || (score >= 620 && hasCosigner));
      }
  - name: excludes-cosigned-score-floor
    teaches: If the applicant has a cosigner, use the exact minimum score for that case.
    implementation: |
      export function passesLoanPrecheck(annualIncome, score, debtPercent, hasCosigner) {
        return annualIncome >= 30000 && debtPercent <= 35
          && (score >= 680 || (score > 620 && hasCosigner));
      }
  - name: cosigner-waives-score-floor
    teaches: Give an applicant with a cosigner a score below the minimum for that case.
    implementation: |
      export function passesLoanPrecheck(annualIncome, score, debtPercent, hasCosigner) {
        return annualIncome >= 30000 && debtPercent <= 35
          && (score >= 680 || hasCosigner);
      }
  - name: omits-cosigner-condition
    teaches: Give an applicant without a cosigner a score between the two minimums.
    implementation: |
      export function passesLoanPrecheck(annualIncome, score, debtPercent, hasCosigner) {
        return annualIncome >= 30000 && debtPercent <= 35
          && score >= 620;
      }
reference:
  source: |
    export function test(passesLoanPrecheck) {
      const cases = [
        [30000, 710, 25, false, true], [29999, 710, 25, true, false],
        [45000, 710, 35, false, true], [45000, 710, 35.1, true, false],
        [45000, 680, 25, false, true], [45000, 679, 25, false, false],
        [45000, 620, 25, true, true], [45000, 619, 25, true, false],
        [45000, 650, 25, true, true], [45000, 650, 25, false, false],
      ];
      for (const [income, score, debt, cosigner, expected] of cases) {
        const actual = passesLoanPrecheck(income, score, debt, cosigner);
        if (actual === expected) continue;
        throw new Error(`${income}, score ${score}, debt ${debt}, cosigner ${cosigner}: expected ${expected}, got ${actual}`);
      }
    }
rowsReference:
  rows:
    - { args: [30000, 710, 25, false], expected: true }
    - { args: [29999, 710, 25, true], expected: false }
    - { args: [45000, 710, 35, false], expected: true }
    - { args: [45000, 710, 35.1, true], expected: false }
    - { args: [45000, 680, 25, false], expected: true }
    - { args: [45000, 679, 25, false], expected: false }
    - { args: [45000, 620, 25, true], expected: true }
    - { args: [45000, 619, 25, true], expected: false }
    - { args: [45000, 650, 25, true], expected: true }
    - { args: [45000, 650, 25, false], expected: false }
decoy:
  rows:
    - { args: [60000, 740, 20, false], expected: true }
    - { args: [60000, 650, 20, true], expected: true }
    - { args: [60000, 650, 20, false], expected: false }
    - { args: [20000, 570, 48, false], expected: false }
---

A fictional lender uses the `passesLoanPrecheck(annualIncome, score, debtPercent, hasCosigner)` function for its first loan check. Income is a whole dollar amount of zero or more. The credit score is a whole number from 300 to 850.

Debt-to-income is the share of income that goes to debt payments. Its value ranges from 0 to 100. For example, `35` means 35 percent. A cosigner is someone who agrees to help repay the loan if the applicant cannot.

The function returns `true` only if all of these conditions hold:

- The applicant earns at least 30,000 dollars a year.
- The applicant's debt-to-income percentage is 35 percent or less.
- If the applicant has no cosigner, the score must be at least 680. If the applicant has a cosigner, the score can be as low as 620.

The income and debt rules still apply when the applicant has a cosigner. If any required condition fails, the function returns `false`.

Enter test rows or write the JavaScript function `export function test(passesLoanPrecheck)`. If the result differs from what you expected, throw an error.
