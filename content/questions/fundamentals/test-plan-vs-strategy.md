---
title: "How does a test plan differ from a test strategy?"
topic: fundamentals
roles: [manual-qa, automation, senior]
level: junior
type: concept
oneLine: "A strategy gives the testing approach; a plan applies it to a specific scope with people, timing, and evidence."
looksFor:
  - "Explains reusable testing decisions."
  - "Names what changes with a release or project."
  - "Connects the two with one feature."
  - "Does not require two separate documents."
trap: "Calling a list of test cases a complete plan when it omits environment, ownership, and completion criteria."
followUps:
  - question: "What changes first if the release date moves up?"
    answer: "I'd update the plan with revised timing and scope, then flag any risks we can no longer cover under the existing approach."
sources:
  - label: "ISTQB CTFL v4.0.1, section 5.1.1"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I use strategy to mean how we intend to test and why. It can cover things like which checks belong at service level and when we need a real dependency. A plan says what that means for the work in front of us: which risks we will cover, who prepares the data, when we can run the tests, and how we decide we've done enough. On a small team I'd be happy to capture both in one place.

### Example

A team strategy might call for one real sandbox check whenever a payment provider contract changes. The plan for this week's refund release would name the provider environment, the amount and currency cases, the person responsible, and the point at which a failed reconciliation blocks the release.
