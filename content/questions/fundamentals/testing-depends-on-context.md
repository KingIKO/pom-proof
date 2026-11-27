---
title: "When would two features that look alike need different tests?"
topic: fundamentals
roles: [manual-qa, automation, senior]
level: mid
type: scenario
oneLine: "I choose tests based on what might break and who it would affect. I also consider how easily the team can recover."
looksFor:
  - "Compare what would happen if each feature failed."
  - "Choose how closely to test each feature and what the results need to show."
  - "Check what the team can do if something goes wrong."
  - "Keep enough checks to explain why the less risky feature is ready."
trap: "Using the same checklist for both features because they share a control on the page."
followUps:
  - question: "What if both features use the same service behind the page?"
    answer: "I'd reuse checks for what both features do. If the rules, data, or effects on users differ, I'd add tests for those differences."
sources:
  - label: "ISTQB CTFL v4.0.1, section 1.3"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I look at what the software does after the user clicks a button. An option users can undo and an action that changes a payment can use the same controls. I'd choose different tests because the actions have different effects.

I ask who can take each action. I also ask how many people a mistake might affect and what support can do to help afterward.

### Example

If I pause marketing emails, I'd check that the app saves the change. I'd check that the next send skips the account and that I can turn emails back on. If I pause automatic billing, I'd also test requests on both sides of the last time customers can pause it. I'd check that the next invoice agrees with any notice we send. I'd use a test ledger, a record of charges, so the tests don't affect real accounts.
