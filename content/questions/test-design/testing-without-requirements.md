---
title: How would you start testing a bulk archive feature with no written requirements?
topic: test-design
roles: [manual-qa, automation, sdet, senior]
level: mid
type: scenario
oneLine: Find what users need the feature to do, explore with safe data, and keep observations separate from agreed behavior.
looksFor:
  - Finds people or existing evidence that can establish the intended outcome.
  - Lists unknown rules and clarifies the ones with the highest impact.
  - Runs a focused exploratory session with reversible test data.
  - Records confirmed defects separately from questions and assumptions.
trap: Writing the feature's current behavior into test cases as the expected result.
followUps:
  - question: What if nobody can confirm what should happen today?
    answer: I'd record the observed outcome and who is affected, then flag that scenario as unresolved. I can still report coverage for the behavior we did confirm.
sources:
  - label: ISTQB CTFL v4.0.1, section 4.4.2
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd ask the team why users need bulk archive and who can confirm the rules. A demo or notes from support can tell me how people work today. I'd turn that into a short session with disposable records and write down which results are agreed and which are just what I observed.

I'd ask about scope and recovery early. If there's a chance the action affects more records than the user intended, that matters more than settling the copy on the confirmation screen.

### Example

A support lead wants to archive resolved tickets without touching open ones. I'd seed both statuses, select a few tickets, and record which IDs moved. If changing a filter keeps earlier selections, I'd show the lead what gets archived and ask whether selection should persist across filters. Once we agree, I'd turn that case into a regression check.
