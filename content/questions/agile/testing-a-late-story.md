---
title: "A story is ready to test on the sprint's last afternoon. What do you do?"
topic: agile
roles: [manual-qa, automation, senior]
level: mid
type: scenario
oneLine: "I'd tell the team what I can still test and start with the biggest customer risks. I'd keep unfinished work out of the completed product."
looksFor:
  - "Ask what changed and which checks already ran on this build."
  - "Start with the checks that matter most to customers."
  - "Tell the team what you couldn't check and whether there's time to retest a fix."
  - "Agree on what can still be finished with the team and Product Owner without dropping any required quality checks."
trap: "Passing the usual success case in a rush and leaving the other checks unreported."
followUps:
  - question: "What do you record for the next sprint?"
    answer: "I record the build, the cases I ran, and what happened. I list the checks I couldn't run so the next person knows where to start."
  - question: "What if stories arrive late every sprint?"
    answer: "I'd bring the sprint dates, the number of late stories, and the time left to test to the retrospective. I'd propose smaller pieces of work and an earlier testable build. Then I'd compare the dates."
  - question: "The account has promotional mail turned off, but the receipt never arrives. What would you show at the Sprint Review?"
    answer: "I'd bring the build, the saved preference, and the test order ID. I'd trace the order to see if the mail worker put the receipt in the send queue. The unit check for saving the preference can still pass. Since the required receipt failed, I'd leave the change out of the Increment."
sources:
  - label: Scrum Guide on sprint scope and quality
    url: https://scrumguides.org/scrum-guide.html#the-sprint
  - label: Scrum Guide on the Definition of Done
    url: https://scrumguides.org/scrum-guide.html#commitment-definition-of-done
---

I'd ask what changed in the story, a piece of work for the user. I'd ask what the team has already checked in the build. I'd tell the team what I can test in the time left. I'd say whether there's time to fix and retest a problem. I'd start where a failure could hurt a customer, including existing behavior the change could break.

If we can't meet the Definition of Done, our shared quality requirements, I'd tell the team. We could discuss finishing a smaller, usable piece with the Product Owner if it still serves the Sprint Goal. Otherwise I'd keep the unfinished work out of the Increment, the usable product work we completed.

### Example

An order email preference arrived late. I saved the preference and placed an order on an account that had opted out of promotional email. The required receipt never arrived. We agreed to keep the change out of the Increment. I recorded the build and the account setup so we could retest early next sprint.
