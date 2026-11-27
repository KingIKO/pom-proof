---
title: "How do you distinguish smoke, sanity, and regression testing?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "I'd use smoke for basic build health, sanity for a quick focused pass, and regression for existing behavior that a change might affect."
looksFor:
  - "Can describe the purpose and scope of each run."
  - "Acknowledges that teams use sanity differently."
  - "Separates proving a fix from checking nearby behavior."
  - "Chooses what to run for a concrete change."
trap: "Naming the runs without saying what each one would check."
followUps:
  - question: "What if the smoke suite can't create an order?"
    answer: "I'd record the build and error, investigate it first, and flag that downstream checkout results aren't meaningful until the path works."
  - question: The coupon works at the cutoff, but a gift card now changes the shipping total. What would you record?
    answer: >-
      I'd mark the original coupon failure as fixed and record the gift-card total as a separate
      regression, with the build and expected shipping charge. I'd add that pricing case to the
      repeatable checks for the next change.
sources:
  - label: "ISTQB glossary, smoke test"
    url: https://glossary.istqb.org/en_US/term/smoke-test
  - label: "ISTQB CTFL v4.0.1, section 2.2.3"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I'd confirm what the team calls these runs because sanity can mean different things. I use smoke for a short check of basic health before spending time on deeper tests. I use sanity for a focused pass over a change. Regression tests check for unwanted effects in behavior that was already working. If there's a bug fix, I also rerun its original failing case to see whether the fix itself worked.

### Example

After a coupon fix, smoke would confirm I can open the store, add an item, and complete an order. For the focused pass I'd try the corrected coupon and its cutoff case. I'd regress gift cards and shipping totals because they use the same pricing logic.
