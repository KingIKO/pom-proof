---
title: "How can a feature meet its requirements and still fail users?"
topic: fundamentals
roles: [manual-qa, automation, senior]
level: junior
type: concept
oneLine: "I check whether users can finish their real task, even when the feature meets every written rule."
looksFor:
  - "Tell meeting the written rules apart from helping users do their work."
  - "Name the task the user needs to finish."
  - "Use realistic data or watch someone use the feature."
  - "Show the decision maker what the written rules missed."
trap: "Closing the issue as soon as the feature meets every rule for accepting it."
followUps:
  - question: "How would you show that the feature misses a user need?"
    answer: "I'd watch someone do their usual work with typical data. I'd record exactly where they stop or have to find another way."
sources:
  - label: "ISTQB CTFL v4.0.1, section 1.3"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I start with the task the feature is supposed to help users finish. I check the specification, or written rules, to see if the team built what we agreed. Then I watch someone try the task with data like the data they use at work.

If they can't finish the task, I show the product team where they got stuck. I ask whether the rule needs to change, even if the code follows it.

### Example

I'd look at a finance export, a file with data from the app. It might include every requested column. If the billing team needs the merchant account ID and the rules leave it out, they'd still match entries to their bank feed by hand. I'd show the gap with a sample statement and write down what the file needs.
