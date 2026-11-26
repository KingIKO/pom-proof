---
title: Check loan prequalification rules
kind: test-design
topic: decision-tables
difficulty: hard
minutes: 14
roles: [manual-qa, sdet, senior]
exportName: passesLoanPrecheck
params:
  - { name: annualIncome, type: number, label: Annual income (dollars) }
  - { name: score, type: number, label: Credit score }
  - { name: debtPercent, type: number, label: Debt-to-income percentage }
  - { name: hasCosigner, type: boolean, label: Has cosigner }
implementation: |
  export function passesLoanPrecheck(annualIncome, score, debtPercent, hasCosigner) {
    return annualIncome >= 30000 && debtPercent <= 35
      && (score >= 680 || (score >= 620 && hasCosigner));
  }
mutants:
  - name: excludes-income-floor
    teaches: Use the minimum eligible income while making all other conditions pass.
    implementation: |
      export function passesLoanPrecheck(annualIncome, score, debtPercent, hasCosigner) {
        return annualIncome > 30000 && debtPercent <= 35
          && (score >= 680 || (score >= 620 && hasCosigner));
      }
  - name: excludes-debt-ceiling
    teaches: Use the maximum eligible debt-to-income percentage with other conditions met.
    implementation: |
      export function passesLoanPrecheck(annualIncome, score, debtPercent, hasCosigner) {
        return annualIncome >= 30000 && debtPercent < 35
          && (score >= 680 || (score >= 620 && hasCosigner));
      }
  - name: excludes-solo-score-floor
    teaches: Use the minimum score for applicants who qualify without a cosigner.
    implementation: |
      export function passesLoanPrecheck(annualIncome, score, debtPercent, hasCosigner) {
        return annualIncome >= 30000 && debtPercent <= 35
          && (score > 680 || (score >= 620 && hasCosigner));
      }
  - name: excludes-cosigned-score-floor
    teaches: Try a cosigned application exactly at the lower score threshold.
    implementation: |
      export function passesLoanPrecheck(annualIncome, score, debtPercent, hasCosigner) {
        return annualIncome >= 30000 && debtPercent <= 35
          && (score >= 680 || (score > 620 && hasCosigner));
      }
  - name: cosigner-waives-score-floor
    teaches: Try a cosigned application with a score below the cosigned minimum.
    implementation: |
      export function passesLoanPrecheck(annualIncome, score, debtPercent, hasCosigner) {
        return annualIncome >= 30000 && debtPercent <= 35
          && (score >= 680 || hasCosigner);
      }
  - name: omits-cosigner-condition
    teaches: Try a score between the two thresholds with no cosigner.
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

A fictional lender uses `passesLoanPrecheck(annualIncome, score, debtPercent, hasCosigner)` for a first screening step. Income is a nonnegative whole dollar amount, score is a whole number from 300 to 850, and debt-to-income is a number from 0 to 100, where `35` means 35 percent.

The function returns `true` only if all of these conditions hold:

- Annual income is at least 30,000 dollars.
- Debt-to-income is at most 35 percent.
- The score is at least 680 without a cosigner. With a cosigner, the score may be as low as 620.

Return `false` otherwise. The income and debt rules apply even with a cosigner. Enter test rows or write a JavaScript `export function test(passesLoanPrecheck)` that throws on an unexpected result.
