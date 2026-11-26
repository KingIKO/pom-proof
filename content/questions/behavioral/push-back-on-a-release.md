---
title: Tell me about a time you pushed back on a release.
topic: behavioral
roles: [manual-qa, automation, sdet, senior]
level: mid
type: behavioral
oneLine: Bring reproducible customer impact and a release option the decision owner can act on.
looksFor:
  - Your specific evidence and recommendation
  - A clear release decision owner
  - A measured outcome from the chosen option
  - What you learned about setting release criteria
trap: Saying QA blocked the release without explaining the impact or what alternatives you offered.
followUps:
  - question: What if the release owner had shipped anyway?
    answer: I'd record the accepted risk and agree on a monitor, rollback trigger, and owner before the rollout.
---

Two hours before a release, I found that changing the shipping address after applying a coupon could leave the confirmation total higher than the cart total. I needed to give the release owner a clear recommendation before the deployment window closed. I reproduced it on two accounts, saved both totals, and verified the previous checkout flow didn't have the issue.

I recommended shipping the rest of the release with the new checkout flag off. The release owner agreed. I checked the fallback in the candidate build, then verified the fix before the flag went back on two days later. I learned to check fallback options before release day.

### Example

My issue included a cart total of $42 and a confirmation of $49 for the same order. The screenshots and steps let the release owner verify the difference without waiting for a meeting.
