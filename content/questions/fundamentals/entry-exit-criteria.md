---
title: "How would you agree on useful entry and exit criteria for testing?"
topic: fundamentals
roles: [sdet, senior]
level: senior
type: scenario
oneLine: "Before a run, I agree on what we need for trustworthy results. I also agree on what those results must show to support a decision."
looksFor:
  - "State start conditions the team can check."
  - "Base the decision to stop on evidence about the risks, beyond the percentage that passed."
  - "Report separately which tests failed, which were blocked, and which the team never ran."
  - "Explain what to do if the team cannot meet the conditions."
trap: "Giving approval because most tests passed even though the team could not run the most important ones."
followUps:
  - question: "If you haven't met all the entry criteria, when would you still run some tests?"
    answer: "I'd run a separate group of tests if their results would still be valid. I'd name the tests I couldn't run and make clear that the full run hasn't started."
sources:
  - label: "ISTQB CTFL v4.0.1, section 5.1.3"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I write entry criteria, or conditions we must meet before testing, around what makes the results useful. I ask for the right version, approved test data, and working services the tests depend on.

I choose exit criteria, or conditions for ending the run, based on the decision we need to make. If a missing test covers the one case where users can lose data, a high pass rate tells me too little. I agree in advance on who will decide what to do about any gaps and what evidence they'll need.

### Example

I'd test a scheduling migration, a move of scheduling data to a new system. Before I start, I'd need a test environment with future appointments and a way to check which reminders arrive. I'd finish once I had evidence that existing appointments kept their local times and the system sent the right reminders. If I couldn't run the reminder checks, I'd report the gap to the release owner and mark those checks as blocked.
