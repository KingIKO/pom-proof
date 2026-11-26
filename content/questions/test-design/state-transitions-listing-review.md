---
title: How would you test the state changes in a listing approval workflow?
topic: test-design
roles: [manual-qa, automation, sdet]
level: mid
type: concept
oneLine: Model what each event can do from each state, then check the state and side effects after every step.
looksFor:
  - Defines the starting states, events, and any conditions on those events.
  - Covers different ways to leave the same state.
  - Gives an invalid transition its own test from a known state.
  - Checks stored status and public visibility after each relevant step.
trap: Visiting every status once and calling that proof that every allowed move works.
followUps:
  - question: Why put only one invalid transition in a test?
    answer: If the first invalid action changes the state or ends the flow, the rest of the test can give misleading results. Start each invalid case from a known state.
sources:
  - label: ISTQB CTFL v4.0.1, section 4.2.4
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd write down the states a listing can be in and, for each event, ask what should happen from each state. For every allowed move I'd record the state we land in and what else should change. I can cover several moves in one test sequence, but I want a check after each step. Just seeing the final state could hide a bad intermediate one.

I'd cover the allowed moves first, then try important disallowed moves from a fresh starting state. For those I check that the action is rejected and that neither the saved status nor public visibility changes.

### Example

A marketplace listing starts as a draft and goes into review on submission. A review can send it back to draft or publish it. I'd submit, return for edits, resubmit, and approve, checking that it becomes public only after approval. I'd separately check that the workflow rejects approval on a draft that was never submitted.
