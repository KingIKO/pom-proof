---
title: The catalog can hide recommendations during an outage. What would let you try that failure in staging?
topic: system-design
roles: [sdet, senior]
level: senior
type: concept
oneLine: Limit the outage to a synthetic cohort and check that its product list still loads on time.
looksFor:
  - Defines what a usable product list looks like when recommendations are absent.
  - Compares the affected sessions with a cohort that still gets recommendations.
  - Stops on harm to browsing or checkout and confirms the panel returns afterward.
  - Requires production approval, isolation, and an on-call owner before widening scope.
trap: Turning off several dependencies at once without deciding what failure or recovery looks like.
followUps:
  - question: The catalog stays up but checkout slowdowns appear in the experiment group. Did it pass?
    answer: I'd stop if the agreed checkout guardrail trips. The fallback may work for catalog pages, but I'd investigate the checkout impact before expanding the experiment.
sources:
  - label: Principles of Chaos Engineering on hypotheses and scope
    url: https://principlesofchaos.org/
  - label: AWS Fault Injection Service stop conditions
    url: https://docs.aws.amazon.com/fis/latest/userguide/stop-conditions.html
---

I'd start in staging. My hypothesis is that people can still browse the catalog when the
recommendations service is unavailable. I'd agree on the expected fallback and acceptable
browse latency, then compare those outcomes between a test group and an unchanged group.
I'd keep the simulated failure confined to synthetic sessions and verify that recommendations
return when the dependency recovers.

I'd consider a production experiment only after the staging run proves we can contain and
reverse the change. I'd want explicit approval, a target we can isolate, an on-call owner who
can abort, and working telemetry tied to an automatic stop condition.

### Example

For one staging cohort, a test dependency returns unavailable. The product list should still
load within its target and hide the recommendations panel. If browse latency crosses the
agreed limit, the experiment stops and I check that both browsing and recommendations recover.
