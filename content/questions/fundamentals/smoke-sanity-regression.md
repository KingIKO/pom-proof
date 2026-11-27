---
title: "How do smoke, sanity, and regression tests differ?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "I'd use smoke tests for basic checks and sanity tests for a quick check of the change. I'd use regression tests to check existing behavior the change might affect."
looksFor:
  - "Say what each run checks and why."
  - "Note that teams use the word sanity in different ways."
  - "Tell checking a fix apart from checking what else the change might affect."
  - "Pick tests for a specific change."
trap: "Listing the types of runs without describing any of their checks."
followUps:
  - question: "If the smoke tests can't create an order, what would you do?"
    answer: "I'd record the app version and the error, then look into that first. Until order creation works, I'd flag any results from tests that depend on it as unreliable."
  - question: If the coupon works at the cutoff but a gift card now changes the shipping total, what would you write down?
    answer: >-
      I'd mark the coupon bug as fixed. I'd report the gift card total as a separate regression,
      which is a new failure in behavior that worked before. I'd include the app version and
      the expected shipping charge. I'd add a pricing test we can run again after the next change.
sources:
  - label: "ISTQB glossary, smoke test"
    url: https://glossary.istqb.org/en_US/term/smoke-test
  - label: "ISTQB CTFL v4.0.1, section 2.2.3"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I'd ask what the team calls each run because sanity can mean different things. I use smoke tests to check that a version works well enough for more detailed tests. I use sanity tests to check the change quickly. With regression tests, I look for anything the change broke in behavior that already worked. If the change fixes a bug, I also repeat the test that originally failed.

### Example

After a coupon fix, I'd run a smoke test from opening the store to placing an order with one item. For a sanity test, I'd try the corrected coupon and check what happens at the cutoff. I'd also test gift cards and shipping totals again because they use the same rules to set prices.
