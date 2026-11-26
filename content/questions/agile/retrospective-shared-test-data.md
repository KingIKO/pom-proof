---
title: Tell me about a sprint retrospective where you changed how the team tested.
topic: agile
roles: [senior, sdet]
level: senior
type: behavioral
oneLine: Bring a recurring testing problem with evidence, agree on one change the team can try, and check whether it helped.
looksFor:
  - Show a recurring problem with examples from actual test work.
  - Separate the likely cause from the visible symptom.
  - Pick an improvement with an owner that fits the next sprint.
  - Compare the result against the baseline and use it to decide what to keep.
trap: Ending the retrospective with a commitment to communicate better and no change anyone can check.
followUps:
  - question: What if the first experiment doesn't help?
    answer: I'd look at which failures remain. If they still come from shared state, I'd trace who writes it before expanding the experiment. If blocked time hasn't improved, I'd ask the team whether to stop paying for the extra setup.
sources:
  - label: Scrum Guide on the Sprint Retrospective
    url: https://scrumguides.org/scrum-guide.html#sprint-retrospective
---

Our export checks kept failing in the shared test environment, but they'd pass when someone ran them alone. I compared the failure timestamps with the runs that edited the same customer account. That gave us something specific to act on at the retrospective.

I proposed changing one group of checks first. A teammate owned creating a fresh customer account per run, and I owned tracking how often a collision blocked testing. We agreed to review the results at the next retrospective before extending it.

### Example

Two report tests changed the same account's billing country, so one run could export rows for the wrong country. Before the change, we lost time to two collisions in one sprint. With separate accounts, we saw no collisions in the next sprint with a similar number of runs. We kept the setup for reports and left unrelated suites alone.
