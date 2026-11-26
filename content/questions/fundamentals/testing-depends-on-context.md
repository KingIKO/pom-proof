---
title: "Why would you test two similar features differently?"
topic: fundamentals
roles: [manual-qa, automation, senior]
level: mid
type: scenario
oneLine: "The right test approach depends on what can fail, who is affected, and how easily the team can recover."
looksFor:
  - "Compares the consequences of a failure."
  - "Adapts test depth and evidence to the feature."
  - "Checks recovery options."
  - "Retains a defensible minimum for the lower-risk feature."
trap: "Copying the same checklist to both features because they share a UI component."
followUps:
  - question: "What if both features share the same backend?"
    answer: "I'd reuse checks for the shared behavior and add feature-specific checks where policy, data, or user impact differs."
sources:
  - label: "ISTQB CTFL v4.0.1, section 1.3"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I decide how much evidence I need by looking at what the button does after it's clicked. A reversible preference change and an action that affects a payment can use the same controls. The work behind them calls for different checks. I want to know who can act, how many people a mistake affects, and what support can do after the fact.

### Example

For pausing marketing email, I'd check that the change sticks, takes effect in the next send, and can be undone. For pausing automatic billing, I'd also check requests either side of the billing cutoff and verify whether the next invoice and any customer notice agree. I'd use a test ledger so the checks don't affect real accounts.
