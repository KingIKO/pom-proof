---
title: "The pottery class is full. What should the waitlist scenario check?"
topic: bdd
roles: [manual-qa, automation, sdet]
level: mid
type: concept
oneLine: "I'd check that the learner gets a waitlist confirmation and that the app doesn't reserve a seat."
looksFor:
  - "Tell a waitlist confirmation apart from a reserved seat."
  - "Say that the class is full and the learner chooses to join the waitlist."
  - "Keep the usual click sequence in step code so a layout change doesn't change the scenario."
  - "Describe the steps the learner must be able to follow if that sequence is part of the requirement."
trap: "Removing the code that finds the controls but leaving a list of menu clicks in the scenario."
followUps:
  - question: "The learner must now give consent before joining. What should the scenario say?"
    answer: "I'd say the learner must consent before joining. I'd add a separate case where they decline. I'd leave the choice of control in the step code."
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

I'd show the organizer what the learner sees and what the system does. The class is full. When the learner joins the waitlist, they get a confirmation and still have no seat. I'd call this declarative because it says what happens without naming the clicks.

An imperative version spells out how to get there. It might name the Classes menu, the third card, and the button. I'd keep those clicks in the code for the step. If the learner must be able to tab from class details to Join waitlist, I'd describe that movement in its own check.

### Example

I'd start the scenario with a full pottery class and check what the learner actually gets. If the app moved Join waitlist to another page, I'd keep the same rule in the scenario.
