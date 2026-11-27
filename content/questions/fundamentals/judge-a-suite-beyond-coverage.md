---
title: The shipping label shows the old apartment number after you save the new one. What CI result would you trust next time?
topic: fundamentals
roles: [sdet, senior]
level: senior
type: scenario
oneLine: "I'd make the test fail when the data sent for the label contains an old apartment number. I'd run it early enough for the developer to act."
looksFor:
  - Find where the apartment number first differs from the saved address.
  - Make the test fail when the data sent for the label is wrong.
  - Check whether the result arrives before the code merges and repeats on an unchanged run.
  - Tell the release trend apart from evidence about this bug.
trap: Adding another test that checks the save and ignores the shipping label address.
followUps:
  - question: If the warehouse gets the new apartment number but the label leaves it out, what should you check next?
    answer: I'd keep the check on the data sent to the warehouse. I'd add an assertion, or test check, for the label the service produces. The passing data check already tells me where to look next.
sources:
  - label: ISTQB CTFL v4.0.1, section 5.3.1, test metrics
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
  - label: PIT mutation testing concepts
    url: https://pitest.org/quickstart/basic_concepts/
---

I'd repeat the address change in a test and check the payload, the data checkout sends to the warehouse. If an old apartment number can pass, I'd add an assertion to check that number. I'd change how the code fills in the label to see whether the check fails.

Changed-line coverage tells me which changed lines the test ran or skipped. Running the code that saves the address gives me no evidence that the label is right.

I'd add the check to continuous integration (CI), the automated tests that run before code merges. I'd check whether the result comes back in time. I'd also check whether a failure disappears when I rerun with no changes. At each release review, I'd report which address bugs we caught before release and which reached customers. I'd use the same follow-up period for each release.

### Example

If the saved address shows the new number but the label shows the old one, I'd check the data sent for the label. I'd prove that the test fails when that data contains the old number.
