---
title: What's the difference between defect severity and priority?
topic: bug-reports
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: Severity describes the impact of the defect; priority describes how soon it should be fixed.
looksFor:
  - Explain severity in terms of the harm the defect causes.
  - Explain priority in terms of urgency and the order of work.
  - Give realistic examples where severity and priority differ.
  - Show what new evidence could change the recommendation.
trap: Treating the severity rating as the place the ticket must take in the queue.
followUps:
  - question: How do reach and rollout timing affect priority?
    answer: >-
      Moving up a rollout can make the same defect urgent. If reach is unknown, I'd state what I
      reproduced and ask for usage or support data before treating the priority as settled.
  - question: Teams gave the same archive bug different ratings. What should the ticket say before triage?
    answer: >-
      I'd write that records disappear from the active view and show how to reproduce it. I'd
      separately record that the feature is off for customers. The team can apply its severity
      scale to the first fact and use the second to set the fix order.
  - question: What would a simple severity scale look like?
    answer: >-
      Use blocking for a task people can't complete, major for a serious loss of function, minor
      for limited impact, and cosmetic for appearance only. A safe, practical workaround may reduce
      the impact. It doesn't undo lost data.
sources:
  - label: ISTQB CTFL syllabus, section 5.5 (Defect Management)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I use severity to describe what happens to someone who hits the defect. Can they finish the task? Is anything lost? For priority, I ask when the team needs to act. I'd bring what I know about the affected users, workarounds, and upcoming releases to that discussion.

### Example

Say a new bulk archive action moves records outside the selected date range. That's serious for anyone who relies on those records staying visible. If the feature is still off for all customers, I'd keep it off and fix it before rollout, without interrupting the current release. I'd fix a spelling error in the company name on the signup page first if a paid campaign starts tomorrow. The typo doesn't block registration, but fixing it has a deadline.
