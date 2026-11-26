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
  - question: What could change the priority while the defect stays the same?
    answer: A customer rollout moves up and puts the affected feature in use this week. The defect can cause the same harm, but we need to address it sooner.
  - question: What if you don't know how many customers are affected?
    answer: I'd describe the impact I reproduced, make clear that reach is unknown, and ask for usage or support data before treating the priority as settled.
sources:
  - label: ISTQB CTFL syllabus, section 5.5 (Defect Management)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I use severity to describe what happens to someone who hits the defect. Can they finish the task? Is anything lost? For priority, I ask when the team needs to act. I'd bring what I know about the affected users, workarounds, and upcoming releases to that discussion.

### Example

Say a new bulk archive action moves records outside the selected date range. That's serious for anyone who relies on those records staying visible. If the feature is still off for all customers, I'd keep it off and fix it before rollout, without interrupting the current release. I'd fix a spelling error in the company name on the signup page first if a paid campaign starts tomorrow. The typo doesn't block registration, but fixing it has a deadline.
