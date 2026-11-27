---
title: "Billing has more reported bugs, and system tests caught more of them. What would you check?"
topic: bug-reports
roles: [manual-qa, senior]
level: mid
type: concept
oneLine: "I use defect density to compare bugs with product size. I use detection percentage to see what share a test stage caught."
looksFor:
  - "Name what you're measuring, the time period, and the test stage."
  - "Explain how both measures can rise together."
  - "Check whether reporting or the range of testing changed."
  - "Use comparable counts to pick an area to investigate within one product."
trap: "Assuming both numbers can't rise together or ranking teams that count bugs differently."
followUps:
  - question: "If support files four tickets for one broken invoice rule, how would you count them?"
    answer: "I'd count one confirmed bug in the measure. I'd keep the four customer reports separate to show the impact."
sources:
  - label: ISTQB glossary v4.6.2, defect density and defect detection percentage (Swedish Software Testing Board)
    url: https://sstb.se/wp-content/uploads/2025/12/Glossary-ENSV-2025-12-11.pdf
---

I'd check that both sets of numbers cover the same billing code and time period. I'd divide the known bugs in that work by its size to get defect density. System testing checks the product as a whole. To get its defect detection percentage, I'd divide the bugs found there by the bugs found there or later. Then I'd multiply by 100.

If both measures rise, I'd look at which new bugs the team found and how it found them. Better system tests can find a group of bugs nobody had reported. Teams measure size and report bugs differently, so I'd avoid ranking teams this way.

### Example

I'd take 10,000 lines of billing code and count bugs through a 30-day cutoff after release. Suppose I count 24 in system testing and six later, with no earlier bugs included. I'd report a density of three per thousand lines. System testing caught 24 of 30, or 80 percent.
