---
title: Billing has more reported bugs, but more were found in system testing. What would you investigate?
topic: bug-reports
roles: [manual-qa, senior]
level: mid
type: concept
oneLine: Use defect density to compare defect counts against product size, and detection percentage to see where they were caught.
looksFor:
  - Keeps the work product, window, and test level explicit.
  - Explains how the two metrics can rise together.
  - Checks for changes in reporting or test scope.
  - Uses comparable numbers to choose where to look within one product.
trap: Treating two rising numbers as contradictory, or using them to rank teams with different reporting practices.
followUps:
  - question: Support filed four tickets for one faulty invoice rule. How would you count them?
    answer: Count one confirmed defect for the metric, and keep the four customer reports as a separate measure of impact.
sources:
  - label: ISTQB glossary v4.6.2, defect density and defect detection percentage (Swedish Software Testing Board)
    url: https://sstb.se/wp-content/uploads/2025/12/Glossary-ENSV-2025-12-11.pdf
---

I'd check whether we're comparing the same billing code and the same reporting window. Defect
density divides known defects in that scope by its size. Defect detection percentage for system
testing divides the defects found at that level by those found there or later, then multiplies by 100.

If both numbers rise, I'd look at which new defects were found and how. Better system tests
can uncover a cluster of previously unreported defects. Different sizing and reporting habits
make this a poor way to rank teams.

### Example

For 10,000 lines of billing code, say we find 24 defects in system testing and six later, with a
30-day post-release cutoff and no earlier defects in this example's count. The density is three
per thousand lines. System testing found 24 of 30, or 80 percent.
