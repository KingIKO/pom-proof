---
title: How would you test in staging that the catalog still works when recommendations go down?
topic: system-design
roles: [sdet, senior]
level: senior
type: concept
oneLine: I'd limit the outage to test sessions. I'd check that those sessions can still load the product list on time.
looksFor:
  - Describe what people should still be able to see and do without recommendations.
  - Compare affected sessions with a group that still gets recommendations.
  - Stop if browsing or checkout suffers and check that recommendations return afterward.
  - Before trying this in production, get approval, contain the test, and name an on-call owner.
trap: Turning off several services at once without deciding what's supposed to fail or how you'll know it recovered.
followUps:
  - question: The catalog keeps working, but checkout slows down for the test group. Would you call that a pass?
    answer: If checkout crosses the agreed limit, I'd stop. The catalog may still work without recommendations. Before testing more sessions, I'd investigate what happened to checkout.
sources:
  - label: Principles of Chaos Engineering on hypotheses and scope
    url: https://principlesofchaos.org/
  - label: AWS Fault Injection Service stop conditions
    url: https://docs.aws.amazon.com/fis/latest/userguide/stop-conditions.html
---

I'd start in staging, a test environment that resembles production. I'd test whether people can still browse when the recommendations service is unavailable. I'd agree on the fallback, what the catalog does without recommendations, and how fast browsing must be. I'd compare a cohort affected by the test with an unchanged group. A cohort is a group of sessions.

I'd limit the simulated failure to sessions created for the test. When the recommendations service recovers, I'd check that the panel returns.

I'd consider a production experiment only after staging shows I can limit and reverse the change. I'd get explicit approval and pick a group I can isolate. I'd name an on-call owner who can stop the test. I'd check that working measurements can also stop it automatically when it crosses a limit.

### Example

I'd have a test service reply that it's unavailable for one group in staging. I'd expect the list to load within its time limit and hide the recommendations panel. If browsing gets slower than we agreed to allow, I'd stop the test. I'd check that browsing and recommendations both recover.
