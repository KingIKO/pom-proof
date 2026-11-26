---
title: "How would you agree on useful entry and exit criteria?"
topic: fundamentals
roles: [sdet, senior]
level: senior
type: scenario
oneLine: "Agree on what makes results meaningful before a run and what evidence is needed afterward to make a decision."
looksFor:
  - "Makes start conditions observable."
  - "Uses risk-focused exit criteria rather than a pass percentage alone."
  - "Separates blocked, failed, and unrun tests."
  - "Explains what happens if the criteria cannot be met."
trap: "Signing off because the overall pass rate is high while the highest-risk checks are blocked."
followUps:
  - question: "Would you ever start testing without meeting all entry criteria?"
    answer: "I'd run an independent slice that can produce valid evidence, mark blocked coverage explicitly, and avoid presenting the full run as started."
sources:
  - label: "ISTQB CTFL v4.0.1, section 5.1.3"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I write entry criteria around what a test needs to mean anything: the right build, approved test data, and the relevant dependencies working. Exit criteria come from the decision the run needs to support. A pass rate isn't enough if the missing tests include the one case that can lose user data. I agree in advance who decides about a remaining gap and what evidence they'll need.

### Example

Before starting a scheduling migration run, I'd require an environment seeded with future appointments and a way to inspect notification delivery. I'd finish once we had evidence that existing appointments retained their local times and sent the correct reminders. If notification checks were blocked, I'd bring that gap to the release owner instead of treating those tests as passes.
