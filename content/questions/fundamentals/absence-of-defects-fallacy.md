---
title: "How can a feature meet its spec and still fail customers?"
topic: fundamentals
roles: [manual-qa, automation, senior]
level: junior
type: concept
oneLine: "A feature can satisfy its written rules and still leave users unable to finish the task that matters to them."
looksFor:
  - "Distinguishes specification conformance from usefulness."
  - "Identifies the actual user goal."
  - "Uses realistic data or observation."
  - "Takes a specification gap back to the decision maker."
trap: "Closing the issue as soon as the implementation matches every acceptance criterion."
followUps:
  - question: "What would count as evidence of the gap?"
    answer: "Watch someone try their normal workflow with representative data and record exactly where they have to stop or use a workaround."
sources:
  - label: "ISTQB CTFL v4.0.1, section 1.3"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I'd look at the job the feature was meant to help with. Checking the written rules tells me whether the team built what was agreed. I also want to see a user try to finish their task with realistic inputs. If they can't, I'll show product where the workflow breaks and ask whether we need to change the requirement, even if the code works as written.

### Example

A finance export might include every requested column. If the billing team needs the merchant account ID to match entries to their bank feed and the spec never asked for it, they'd still reconcile by hand. I'd show that with a sample statement and document what a usable export needs.
