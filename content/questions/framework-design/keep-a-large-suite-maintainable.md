---
title: "A set of claims tests has doubled in size. What would you keep, move, or remove?"
topic: framework-design
roles: [sdet, senior]
level: senior
type: concept
oneLine: "I keep the browser test for submitting a claim. I move eligibility checks to a test that doesn't need a browser."
looksFor:
  - "Name the mistake each case catches before changing which tests you run."
  - "Use tags to tell submission tests apart from eligibility tests."
  - "Give tests separate starting claims so moving one won't change the others."
  - "Name who tracks tests that make the required run fail for the wrong reason."
trap: "Testing every allowed filing date in the browser because the cases use the same form."
followUps:
  - question: "The eligibility test passes at the service. What would let you remove the browser tests for filing dates?"
    answer: "I'd make a test build accept a date just outside the allowed range and run both tests against it. If the service test catches it and the browser submission test still covers the form, I'd remove the duplicate cases."
---

I'd measure each test's run time and how often it passes on the first attempt. I'd group checks by the mistake they catch. I might need a browser to test claim submission. I don't need to repeat the same screens for every combination of rules that decide whether a claim qualifies. I'd keep actions on the page separate from checks for business results.

I'd give tests their own data so moving one doesn't affect the others. I'd name a suite owner and track the share of required runs that fail because of known problems in the tests. Agreed tags and review rules help the owner keep the required release checks small and dependable. If I remove a test, I'd record why. I'd show how another test covers the risk or record why it no longer matters.

### Example

I'd keep one browser test for a successful claim and move filing date cases to the service. Before removing duplicate browser tests, I'd show the replacement catches a date just outside the allowed range.
