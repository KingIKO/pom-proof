---
title: "How would you set coverage for a high-risk change with limited evidence?"
topic: fundamentals
roles: [sdet, senior]
level: senior
type: scenario
oneLine: "Rank plausible failures by impact and likelihood, choose evidence for each, and state who owns the remaining risk."
looksFor:
  - "Names concrete failure modes and consequences."
  - "Distinguishes what is known from what is estimated."
  - "Matches test depth to the risk and ability to recover."
  - "Makes residual risk visible to the release decision maker."
trap: "Assigning numeric scores without explaining either their evidence or the testing decisions they change."
followUps:
  - question: "What if nobody can estimate the likelihood?"
    answer: "I'd mark it unknown, seek data from recent failures or production use, and keep a plausible high-impact failure in scope."
sources:
  - label: "ISTQB CTFL v4.0.1, section 5.2"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I start with failures people can picture. Who is affected, how often might it happen, and can the team undo the damage? I use recent incident data and the change itself to rank the risks. If the impact is large and the likelihood is unclear, I say so. Then I pick the checks or rollout controls that will change the decision. I give the release owner the evidence and a specific reason for anything we're still unsure about.

### Example

For a billing migration I'd first test whether active subscriptions can be renewed twice. I'd compare the scheduler and ledger against a migrated dataset and test the recovery procedure. A successful dry run on one account wouldn't establish what happens while both schedulers are active.
