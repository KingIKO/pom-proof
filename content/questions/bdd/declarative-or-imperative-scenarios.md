---
title: The pottery class is full. What should its waitlist scenario promise the learner?
topic: bdd
roles: [manual-qa, automation, sdet]
level: mid
type: concept
oneLine: Make the waitlist confirmation and the absence of a seat reservation visible in the scenario.
looksFor:
  - Lets the class organizer distinguish a place on the waitlist from a booked seat.
  - Names the full class and the learner's decision to join.
  - Keeps the click path in step code so the scenario survives a layout change.
  - Keeps the sequence visible when the user's ability to follow it is the requirement.
trap: Removing the selectors but leaving the scenario as a list of menu operations.
followUps:
  - question: The pottery class now requires consent before joining the waitlist. What belongs in the scenario?
    answer: I'd write that the learner must consent before joining and add a case where they decline. The control used to record consent can stay in step code.
sources:
  - label: Cucumber, writing better Gherkin
    url: https://cucumber.io/docs/bdd/better-gherkin/
  - label: Cucumber, Gherkin steps
    url: https://cucumber.io/docs/gherkin/reference/#steps
examples:
  - title: A sold-out class offers a waitlist place
    variants:
      - lang: gherkin
        label: Gherkin (Cucumber)
        code: |
          Feature: Waitlist for sold-out classes
            Scenario: A learner joins the waitlist for a sold-out class
              Given the pottery class has no seats left
              When a learner joins its waitlist
              Then the learner receives a waitlist confirmation
              But the learner receives no seat reservation
---

I'd show the organizer the two outcomes in plain language: the learner gets a waitlist
confirmation and still has no seat. The full pottery class is the starting state, and
joining its waitlist is the action. That's the declarative version.

The imperative version walks through the Classes menu, the third card and the button. I'd
keep that navigation in step code. If the requirement says the learner must be able to tab
from the class details to Join waitlist, I'd spell out that movement in its own check.

### Example

The rewritten scenario starts with a full pottery class and checks what the learner actually
receives. It would still describe the same rule if the app moved the waitlist control to a
different page.
