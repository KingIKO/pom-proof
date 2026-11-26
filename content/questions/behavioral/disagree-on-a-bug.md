---
title: Tell me about a time a developer disagreed that something was a bug.
topic: behavioral
roles: [manual-qa, automation, sdet]
level: junior
type: behavioral
oneLine: Turn the disagreement into a shared reproduction and agree on what the customer should see.
looksFor:
  - Your calm and specific reply
  - Evidence someone else can reproduce
  - A clear decision about the intended behavior
  - The result and what you learned from it
trap: Treating the bug discussion as something to win and escalating before sharing useful evidence.
followUps:
  - question: What if the requirement is genuinely unclear?
    answer: I'd write down the two interpretations and ask the product owner which to test, with the customer impact of each.
---

A developer closed my report about a booking calendar because it showed the right date on their machine. I wanted to find the difference between our setups. I sent a synthetic reservation ID and compared the local time zones. The date changed when I switched my environment back to theirs, so I invited them to reproduce both cases with me.

I asked product whether appointments should display in the venue's time zone or the customer's. Product confirmed venue time and added that rule to acceptance criteria. I verified the fix in four time zones. I learned to put environment details directly in every date-related bug report.

### Example

The reservation was July 12 at 12:30 a.m. venue time. The affected view displayed July 11 for a customer in a different time zone.
