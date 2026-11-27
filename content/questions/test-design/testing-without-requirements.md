---
title: How would you start testing a feature that archives several records at once if nobody wrote down the rules?
topic: test-design
roles: [manual-qa, automation, sdet, senior]
level: mid
type: scenario
oneLine: I'd find out what users need and try the feature with test records I can discard. I'd separate what I see from what the team confirms.
looksFor:
  - Find someone or something that can tell you what should happen.
  - List the open questions and answer the ones that matter most first.
  - Explore a specific part of the feature using records you can restore or discard.
  - Keep confirmed bugs separate from open questions and assumptions.
trap: Treating what the feature does today as what every test should expect.
followUps:
  - question: How would you report a case if nobody can confirm the rule today?
    answer: I'd write down what happened and who it affects. I'd mark the case as unresolved. I'd still report the checks for behavior the team confirmed.
sources:
  - label: ISTQB CTFL v4.0.1, section 4.4.2
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd ask why users need bulk archive, which moves several records out of active use at once. I'd ask who can confirm its rules. A demo or support notes can show how people do the work today. I'd use that information to plan a short test session with records I can discard. I'd mark which results the team agrees on and which I only observed.

I'd ask early which records the action affects and how to undo it. If it could archive more records than the user meant to select, I'd check that before settling the words on the confirmation screen.

### Example

Suppose a support lead wants to archive resolved tickets and leave open ones alone. I'd set up both statuses, select a few tickets, and record which IDs move. If changing a filter keeps the earlier selection, I'd show the lead what gets archived. I'd ask whether the selection should stay when the filter changes. Once we agree, I'd keep the test so it can catch future changes to that behavior.
