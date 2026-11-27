---
title: "Tell me about a quality metric you owned. How did the team use it?"
topic: behavioral
roles: [manual-qa, automation, sdet, senior]
level: mid
type: behavioral
oneLine: "I pick a quality metric, a number that tells the team something about product quality. I explain what decision it helped us make and what it couldn't tell me."
looksFor:
  - "Explain how you chose what to count and collected the numbers."
  - "Say what total the counts come from and what period they cover."
  - "Name a decision the team made based on the numbers."
  - "Explain what the numbers couldn't show."
trap: "Naming an unused dashboard or taking credit for an improvement without giving a comparison."
followUps:
  - question: "Would you use this measure to rank individual testers?"
    answer: "No. I used it to find a gap in our process. Individual rankings would hide differences in risk and reporting."
---

In release meetings, we counted the bugs we found during testing to judge product quality. I wanted a measure that helped us decide which risks to test next. I counted the checkout defects customers reported in the first seven days after each release. I counted repeat reports only once and wrote down how I put defects into groups.

Across the first six releases I counted 9 defects. Of those, 5 involved how coupons and shipping worked together. I took those cases to planning and added tests. Across the next six releases, I counted 4 defects, with 1 involving coupons and shipping. I treated that as a clue because the sample was small and checkout traffic changed.

### Example

I counted 12 support tickets about the same total as one defect. I kept the ticket count separate to show the impact. I learned to share the counts and explain where they came from whenever I showed the chart.
