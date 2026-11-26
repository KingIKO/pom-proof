---
title: Tell me about a quality metric you owned and what the team did with it.
topic: behavioral
roles: [manual-qa, automation, sdet, senior]
level: mid
type: behavioral
oneLine: Define a metric around a decision, then show how you checked its limits and acted on it.
looksFor:
  - Your personal role in defining and collecting the numbers
  - A meaningful denominator and time window
  - A decision prompted by the evidence
  - What the metric could not show
trap: Naming a dashboard that nobody used or taking credit for an improvement with no comparison.
followUps:
  - question: Would you use this to rank testers?
    answer: No. I used it to identify a process gap; individual rankings would hide differences in risk and reporting.
---

Release meetings were using the number of bugs found in testing as the health signal. I wanted a measure that helped us decide which release risks to cover next. I counted customer-reported checkout defects in the first seven days after each release, deduplicated reports, and wrote down how I classified them.

Across the first six releases I counted 9 defects; 5 involved coupon and shipping interactions. I took those cases to planning and added checks for them. Across the next six releases I counted 4 defects, with 1 in that area. The sample was small and checkout traffic changed, so I treated it as a lead. I learned to attach counts and context whenever I shared the chart.

### Example

I counted 12 support tickets about the same total calculation as one defect, and kept the ticket count separately as an impact measure.
