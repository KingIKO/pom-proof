---
title: How would you test a new payroll export in waterfall, V-model, or agile delivery?
topic: fundamentals
roles: [manual-qa, automation]
level: junior
type: concept
oneLine: I'd review the requirements early in any model. I'd adjust when and how often I run the software to get test results.
looksFor:
  - Tell early reviews in waterfall apart from running tests on a working build.
  - Show how the V-model pairs each kind of development work with a test level.
  - Give an example of getting results sooner by delivering work in short cycles.
  - Keep the pairing without making teams wait for one step to finish before the next can start.
trap: Assuming a team can do no testing until the end of a waterfall or V-model project.
followUps:
  - question: If your team releases every week, what would you keep from the V-model?
    answer: I'd name the evidence each design decision needs. If two parts exchange a file, I'd check that they agree on what the file must contain.
sources:
  - label: ISTQB CTFL v4.0.1, sections 2.1.1, 2.1.2 and 2.2.1
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

In waterfall, the team builds the product in stages. I'd review the payroll requirements and design tests early. I'd get most results from running the full export after the team builds its parts and connects them.

In the V-model, I'd pair each kind of development work with a matching test. For acceptance checks, I'd use business needs to judge whether the product is ready to use. For system checks, I'd use requirements for the whole app. For integration checks, I'd use the design for how parts work together. For unit checks, I'd use the detailed design for each individual part.

If I plan those checks early, I may spot a gap in the design before I can run the tests. In iterative delivery, which builds the product in small cycles, I'd agree on one small part that works. I'd test that part in the same cycle to get results sooner. When the next part is ready, I can rerun the earlier tests. I'd still use the V-model's pairing to see where I test each risk.

### Example

For an overtime column in a payroll export, I'd review the formula early in waterfall. In V-model design, I'd plan to check that the part receiving the file gets the format it expects. In agile delivery, I'd try one pay period as soon as the team has the first small piece working.
