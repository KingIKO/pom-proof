---
title: The July tax rate changed on the wrong date. What would you add to the release review?
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: Check the boundary on the invoice and require the approved effective date on the next rate change.
looksFor:
  - Checks the date on both sides of the rate change.
  - Identifies the approved rate sheet as evidence.
  - Distinguishes checking an invoice from changing how the team reviews rate changes.
  - Gives an example of prevention before a build exists.
trap: Calling the final test run the team's entire quality assurance process.
followUps:
  - question: A June 30 invoice shows $6 in tax. Which record would you bring to the review?
    answer: I'd bring the approved rate sheet and the invoice date. They give us a way to check the bill and show what the release review should have required.
sources:
  - label: ISTQB CTFL v4.0.1, sections 1.1 and 1.2.2
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd ask for the approved rate sheet and compare its start date with the first invoice charged at
the new rate. Inspecting an existing invoice is quality control. Running the invoice generator
with dates on both sides of July 1 is a test and another way to check the product.

I'd use what we learn to change the review itself. If the effective date was never checked, I'd
require the next rate change to point to its approved source and start date before implementation.
That's quality assurance: it changes how the team works before anyone needs a test invoice.

### Example

When a rate rises from 5 to 6 percent on July 1, I want the change review to require a named rate
source and effective date. I'd also generate a $100 invoice dated on each side of the change and
check that the tax comes out to $5 and $6, respectively.
