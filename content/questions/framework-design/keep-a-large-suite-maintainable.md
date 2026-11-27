---
title: A claims suite has doubled in size. What would you keep, move, or retire?
topic: framework-design
roles: [sdet, senior]
level: senior
type: concept
oneLine: Keep the browser submission check and move claims eligibility cases where they can run without opening a browser.
looksFor:
  - Maps each claims case to the mistake it catches before changing coverage.
  - Uses tags to distinguish claim submission from eligibility.
  - Keeps independently seeded claims so moving a case doesn't change its neighbors.
  - Assigns someone to track cases that turn the required run red for the wrong reason.
trap: Leaving every date eligibility row in the browser just because it uses the same claim form.
followUps:
  - question: The eligibility test passes at the service layer. What result would let you remove the browser cases for filing dates?
    answer: I'd run both versions against a test build that starts accepting a date just outside the allowed range. If the service test catches it and the browser submission still covers the form itself, I'd remove the duplicate cases.
---

I'd collect time and first-attempt reliability per test, then group the checks by the risk they cover. A claims workflow may need a browser check for submission, but every permutation of its underwriting rules doesn't need to repeat the same screens. I'd keep page interactions separate from business assertions and use test-owned data so moving coverage doesn't change how neighboring tests behave.

I'd give the suite a named owner and track what fraction of required runs goes red for known test defects. Agreed tags and review rules help that owner keep a small, reliable release gate. A removal needs a documented reason and either replacement evidence or a conscious decision that the risk no longer matters.

### Example

I'd preserve one browser test for a successful claim and move the date eligibility table lower. I'd remove the repeated browser cases after showing the replacement catches the boundary error.
