---
title: "Tell me how you handled more bug reports than you had time to investigate."
topic: behavioral
roles: [manual-qa, automation, sdet]
level: junior
type: behavioral
oneLine: "I sort reports by harm to customers and urgency for the release. I make clear which reports still need work."
looksFor:
  - "Explain how you set priorities and what you did first."
  - "Say who took the less urgent reports and what they'd do next."
  - "Give the counts and the time you had."
  - "Explain what you learned about sorting reports."
trap: "Checking reports in arrival order and treating every open issue as equally risky."
followUps:
  - question: "How did you check whether your first priorities were right?"
    answer: "I asked the people who owned support and release. They knew which customers and planned deployments the issues affected."
---

During a two-hour release check, I got 11 reports about settings. I needed to tell the release owner which ones needed attention that day. I grouped reports by what customers saw and checked whether any stopped a customer from completing an account action. I found four reports about the same failure to save notification choices.

I reproduced that bug first and attached exact steps. The team gave me a fix with time left to retest. I reviewed the other reports far enough to give each one an owner and a next step. The release owner had one clear problem to solve instead of 11 unsorted messages. I learned to group reports before picking one to investigate.

### Example

I saw both a spacing problem and a failed save that looked recent. I put the failed save first because only that bug left customers getting notifications they'd tried to turn off.
