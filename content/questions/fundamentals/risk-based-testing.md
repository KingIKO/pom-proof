---
title: "How do you choose what to test for a risky change when you know little about it?"
topic: fundamentals
roles: [sdet, senior]
level: senior
type: scenario
oneLine: "I rank plausible failures by how bad they would be and how likely they are. I pick evidence for each and name who owns any remaining risk."
looksFor:
  - "Name specific failures and what would happen if they occurred."
  - "Say what you know for sure and what you estimate."
  - "Choose how closely to test based on how risky the failure is and whether the team can recover."
  - "Tell the person who decides on release what risks are still open."
trap: "Giving risks scores without showing the evidence for the scores or which tests the scores affect."
followUps:
  - question: "What would you do if nobody knows how likely a failure is?"
    answer: "I'd mark the chance as unknown and look for data from recent failures or live use. If a failure is plausible and could cause serious harm, I'd still test for it."
sources:
  - label: "ISTQB CTFL v4.0.1, section 5.2"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

In risk-based testing, I give more attention to failures that are likely or costly. I start with a specific, plausible failure, one I have reason to think could happen. I ask who it would affect and how often it might occur. I also ask whether we could undo the damage.

I rank the risks using recent failures and what I know about the change. If the harm could be large but I don't know the chance, I say so. Then I pick tests or ways to control who gets the change that could affect the release decision. I give the release owner the evidence and explain why any risk is still uncertain.

### Example

If we move billing data to a new system, I'd first test whether an active subscription can renew twice. I'd check the billing scheduler, which starts renewals, and the ledger, which records them, against the moved data. I'd also test the recovery steps. If a trial succeeds with one account, I'd still need evidence for what happens when both schedulers run.
