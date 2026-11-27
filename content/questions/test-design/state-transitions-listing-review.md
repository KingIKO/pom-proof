---
title: How would you test state changes in a listing approval workflow?
topic: test-design
roles: [manual-qa, automation, sdet]
level: mid
type: concept
oneLine: I'd write down what each action should do in each state. After each step, I'd check the new state and anything else that should change.
looksFor:
  - List the possible states, what can happen in each, and any conditions on those actions.
  - Test the different ways a listing can leave the same state.
  - Give each disallowed change its own test with a known starting state.
  - After each relevant step, check the saved status and whether the public can see the listing.
trap: Seeing every status once and assuming you tested every allowed move between them.
followUps:
  - question: Why test one invalid transition at a time?
    answer: If the first action changes the state or ends the flow, I'd get misleading results from later steps. I'd start each disallowed case from a known state.
sources:
  - label: ISTQB CTFL v4.0.1, section 4.2.4
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd list the states, or statuses, a listing can have. For each state, I'd write what should happen when an event occurs, such as someone submitting the listing. A change from one state to another is a transition. I'd record where each allowed transition ends and what else should change.

I can cover several transitions in one test sequence. I'd check every step because a correct final state can hide a wrong result along the way.

I'd cover the allowed moves first. I'd try important disallowed moves from a fresh starting state. I'd check that the app rejects each action. The saved status and public visibility should both stay the same.

### Example

I'd start with a marketplace draft and submit it for review. A reviewer can return it for edits or approve it for publication. I'd return the listing to draft and submit it again. I'd approve it and check that it goes public only then. In a separate test, I'd try approving a draft nobody submitted and expect the app to reject it.
