---
title: The label prints the old apartment number after a saved address change. What CI result would you trust next time?
topic: fundamentals
roles: [sdet, senior]
level: senior
type: scenario
oneLine: Make the check fail on the stale label payload early enough for the developer to act.
looksFor:
  - Identifies where the apartment number stopped matching the saved address.
  - Makes the proposed check catch that wrong payload.
  - Judges whether the signal arrives before merge and stays reproducible.
  - Separates the release trend from evidence for this one defect.
trap: Writing another test that passes when the form saves but ignores the address on the shipping label.
followUps:
  - question: The warehouse receives the new apartment number, but the printed label omits it. Where should the check move?
    answer: Keep the payload check for the handoff and add an assertion on what the label service renders. The passing payload check already shows where to narrow the investigation.
sources:
  - label: ISTQB CTFL v4.0.1, section 5.3.1, test metrics
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
  - label: PIT mutation testing concepts
    url: https://pitest.org/quickstart/basic_concepts/
---

I'd replay the address change in a test and look at what checkout sends to the warehouse. If the
stale apartment number can pass, I'd add the missing assertion there. I can deliberately change
the label mapping to check that it would fail. Changed-line coverage helps point me to code the
test skipped, but executing the save code alone can't prove the label was right.

I'd run the new check in the merge suite and see whether the result arrives in time and whether
failures disappear on unchanged reruns. For the release review, I'd show which address defects we
caught before release and which reached customers, using the same follow-up window each time.

### Example

If the saved address has the new apartment number but the printed label still has the old one,
I'd add a check on the label payload and prove it fails with the stale apartment number.
