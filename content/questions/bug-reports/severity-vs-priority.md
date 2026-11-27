---
title: What's the difference between defect severity and priority?
topic: bug-reports
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: I use severity to describe the harm a defect causes. I use priority to say how soon the team should fix it.
looksFor:
  - Explain how much harm the defect causes.
  - Explain how soon the team should fix the defect compared with other work.
  - Give examples where the impact and the urgency differ.
  - Name evidence that could change what you recommend.
trap: Using the severity rating alone to decide when to fix the defect.
followUps:
  - question: How do reach and rollout timing affect priority?
    answer: >-
      If a rollout moves up, the same defect can become urgent. If I don't know how many people
      it affects, I'd say what I reproduced. Before settling on a priority, I'd ask for usage or support data.
  - question: Teams gave the same archive bug different ratings. What should the ticket say before triage?
    answer: >-
      I'd write that records disappear from the active view and show how to reproduce the defect.
      I'd note separately that the feature is off for customers. The team can use the observed
      defect to rate its severity. It can use the rollout status to decide when to fix it.
  - question: What would a simple severity scale look like?
    answer: >-
      I'd call a defect blocking when people can't complete a task, and major when they lose important functionality.
      I'd use minor for limited impact and cosmetic for appearance only. A safe, practical workaround may reduce
      the impact. It cannot restore lost data.
sources:
  - label: ISTQB CTFL syllabus, section 5.5 (Defect Management)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

When I rate severity, I ask whether someone can finish the task and whether they lose anything. When I recommend a priority, I ask when the team needs to act. I'd share what I know about the affected users, any workarounds, and upcoming releases.

### Example

Suppose a new bulk archive action also moves records that fall outside the selected date range. That's serious for anyone who relies on those records staying visible. If the feature is still off for all customers, I'd leave it off. I'd fix it before rollout and keep the current release moving.

If a paid campaign starts tomorrow, I'd fix a misspelling of the company name on the signup page first. People can still register, but fixing the typo has a deadline.
