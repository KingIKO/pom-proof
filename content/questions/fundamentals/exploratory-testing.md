---
title: "How would you run a useful exploratory testing session?"
topic: fundamentals
roles: [manual-qa, automation, senior]
level: mid
type: scenario
oneLine: "Start with a risk and a charter, adjust the tests as you learn, and leave evidence someone else can act on."
looksFor:
  - "Defines a scope and a question for the session."
  - "Adapts next steps to findings."
  - "Records data, observations, and unanswered questions."
  - "Follows up on reproducible or high-impact discoveries."
trap: "Opening the application and clicking around with no record of what was tried."
followUps:
  - question: "What belongs in the debrief?"
    answer: "The charter, parts exercised, a useful set of observations, and a decision on which issues or gaps deserve another pass."
sources:
  - label: "ISTQB CTFL v4.0.1, section 4.4.2"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I write a short charter that names the risk and the part of the product I want to learn about. I set aside enough time to follow what I find. During the session I record the starting data and what happened, particularly when an observation changes what I try next. At the end I sort repeatable defects from questions and note what I didn't get to.

### Example

For a draft editor, I'd explore how edits survive a brief disconnect. If a tab recovers the text but the status label stays on “Saving,” I'd reload and open the draft in a second tab to check which version the service actually retained. That result tells me whether to file a display problem or a data loss issue.
