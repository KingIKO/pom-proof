---
title: "When did a sprint retrospective change how your team tested?"
topic: agile
roles: [senior, sdet]
level: senior
type: behavioral
oneLine: "I brought evidence of a problem that kept coming back. We tried one change and checked whether it helped."
looksFor:
  - "Show the repeating problem with examples from actual test runs."
  - "Explain what you think caused the failures."
  - "Choose a change someone can own in the next sprint."
  - "Compare the new results with the earlier runs before deciding what to keep."
trap: "Agreeing to communicate better without choosing a change anyone can test."
followUps:
  - question: "What if the first change doesn't help?"
    answer: "I'd look at which failures are left. If runs still interfere with each other, I'd trace which runs change the same data before trying the change elsewhere. If the team still loses as much time, I'd ask whether to drop the extra setup."
sources:
  - label: Scrum Guide on the Sprint Retrospective
    url: https://scrumguides.org/scrum-guide.html#sprint-retrospective
---

Our export checks kept failing in the shared test environment. They passed when someone ran them alone. I compared when the checks failed with when other runs edited the same customer account. I took that evidence to our retrospective, the meeting where we look back at a sprint and decide what to change.

I proposed trying the change with one group of checks first. A teammate set up a fresh customer account for each run. I kept track of how often runs blocked each other. We agreed to check the results at the next retrospective before trying the change elsewhere.

### Example

Two report tests changed the same account's billing country. A run could export rows for the wrong country. I counted two collisions in one sprint. With separate accounts, I saw none the next sprint with about as many runs. We kept separate accounts for the report tests and left the other suites alone.
