---
title: The app started using July's tax rate on the wrong date. What would you add to the release review?
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: I'd check invoices just before and after the rate takes effect. For the next rate change, I'd require the approved start date.
looksFor:
  - Check invoices from both sides of the rate change.
  - Use the approved rate sheet as evidence.
  - Tell checking an invoice apart from changing how the team reviews rate changes.
  - Give an example of how to prevent the mistake before the team builds the change.
trap: Treating the final test run as the whole process for preventing and checking quality problems.
followUps:
  - question: Which records would you bring if an invoice dated June 30 shows $6 in tax?
    answer: I'd bring the invoice date and the approved rate sheet. I'd use them to check the bill and show what evidence the review should have required.
sources:
  - label: ISTQB CTFL v4.0.1, sections 1.1 and 1.2.2
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd compare the approved start date with the date of the first invoice that used the new rate. That's quality control: I check the finished product. If I run the invoice generator with dates on both sides of July 1, I'm testing the product another way.

I'd use what I learn to change the release review, where the team checks whether a change is ready. If nobody checked the effective date, or day the rate starts, I'd ask for the approved source and date before anyone codes the next change. That's quality assurance: I change how the team works before anyone needs a test invoice.

### Example

If the rate goes from 5 to 6 percent on July 1, I'd require the review to name the source and the effective date. I'd also generate one $100 invoice before the change and check for $5 in tax. I'd generate another $100 invoice after the change and check for $6.
