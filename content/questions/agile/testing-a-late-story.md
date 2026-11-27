---
title: A story is ready to test on the final afternoon of the sprint. What do you do?
topic: agile
roles: [manual-qa, automation, senior]
level: mid
type: scenario
oneLine: Tell the team what can still be checked, test the highest-risk behavior first, and keep unfinished work out of Done.
looksFor:
  - Ask what changed and what the build already covers.
  - Pick the first checks by customer impact.
  - Tell the team exactly what has not been checked and whether a fix can be retested.
  - Work with the team and Product Owner on scope without lowering the quality bar.
trap: Calling a rushed happy-path pass enough and leaving the rest of the testing unreported.
followUps:
  - question: What evidence do you leave for the next sprint?
    answer: I record the build, the cases I ran, and their results. I also note the checks I couldn't run so the next person knows where to pick up.
  - question: What if stories arrive late in every sprint?
    answer: >-
      I'd bring sprint dates, counts of late stories, and time left to test to the retrospective.
      I'd propose thinner slices and getting the first testable build out sooner, then compare the dates.
  - question: The account shows promotional mail is off, but the order receipt never reaches the test inbox. What evidence would you take to the sprint review?
    answer: >-
      I'd bring the build, the saved preference, and the test order ID. I'd trace the order to see
      whether the mail worker queued its receipt. The unit result for saving the preference can stand;
      the required receipt still failed, so I'd leave the change out of the Increment.
sources:
  - label: Scrum Guide on sprint scope and quality
    url: https://scrumguides.org/scrum-guide.html#the-sprint
  - label: Scrum Guide on the Definition of Done
    url: https://scrumguides.org/scrum-guide.html#commitment-definition-of-done
---

I'd ask what changed in the build and what the team has already checked. Then I'd tell the team how much I can cover, including whether there is time to fix and retest a problem. I'd start with the paths where getting it wrong hurts a customer, including any existing behavior touched by the change.

If we can't meet the Definition of Done, I make that visible. We can discuss completing a smaller, usable piece with the Product Owner if that still serves the Sprint Goal. Otherwise the unfinished work stays out of the Increment.

### Example

A new order email preference arrived late. I tried saving it and placing an order with an account that had opted out of promotional email. The required order receipt never arrived. We agreed to leave the change out of the Increment, and I recorded the build and the failing account setup so we could retest the fix early next sprint.
