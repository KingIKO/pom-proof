---
title: How would the delivery model change testing for a new payroll export?
topic: fundamentals
roles: [manual-qa, automation]
level: junior
type: concept
oneLine: Start reviewing early in any model and change when and how often you collect evidence from running software.
looksFor:
  - Separates early reviews from execution of a build in waterfall.
  - Pairs development work with corresponding test levels in the V-model.
  - Gives an example of shorter feedback in iterative delivery.
  - Keeps the useful test-level mapping without imposing sequential handoffs.
trap: Saying no one tests anything until the end of a waterfall or V-model project.
followUps:
  - question: What would you keep from the V-model on a team that ships weekly?
    answer: Name the evidence each design decision needs, such as an integration check for a file contract.
sources:
  - label: ISTQB CTFL v4.0.1, sections 2.1.1, 2.1.2 and 2.2.1
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

In a waterfall project, I'd review the payroll requirements and design tests early. Most feedback
from running the full export comes later, once the parts are built and integrated. The V-model makes
the pairing explicit: business needs inform acceptance checks, system requirements inform system
checks, interface design informs integration checks, and detailed component design informs unit checks.
Planning those checks early can catch holes in the design even before they can run.

In iterative delivery, I'd agree on a narrow working slice and run checks on it within the iteration.
That gets feedback from running software sooner, and I can rerun checks from earlier slices when
the next one arrives. I'd keep the V-model's pairing as a way to ask where each risk gets checked.

### Example

For an overtime column, I'd review the formula up front in waterfall, define the handoff check against
the file format during V-model design, or try a single pay period in the first working agile slice.
