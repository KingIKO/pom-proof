---
title: A claims model improved overall but misses more damage reports without photos. Would you ship it?
topic: ai-testing
roles: [sdet, senior]
level: senior
type: concept
oneLine: Compare both versions on the same held-out claims and keep the no-photo cases visible in the release decision.
looksFor:
  - Uses labeled no-photo claims to judge the reported regression.
  - Weighs missed damage against the number of unnecessary manual reviews.
  - Tests routing with known outputs and judges variable model output by the required decision.
  - Separates an input shift from a measured drop in accuracy after release.
trap: Approving a model on overall accuracy without checking how many damaged claims it misses.
followUps:
  - question: After launch, more claims arrive without photos and reviewers haven't labeled them. What can you report today?
    answer: >-
      I'd report how much the no-photo share changed against the baseline. I'd ask reviewers to
      label a sample of those claims before saying whether the model misses damage more often.
sources:
  - label: Google Rules of ML, infrastructure tests and holdout data (accessed 2026-11-27)
    url: https://developers.google.com/machine-learning/guides/rules-of-ml?hl=en
  - label: Google ML Crash Course, data slices and monitoring (accessed 2026-11-27)
    url: https://developers.google.com/machine-learning/crash-course/production-ml-systems/monitoring?hl=en
  - label: Google ML Glossary, precision and recall (accessed 2026-11-27)
    url: https://developers.google.com/machine-learning/glossary?hl=en
  - label: Google Cloud Model Monitoring, input drift (accessed 2026-11-27)
    url: https://docs.cloud.google.com/gemini-enterprise-agent-platform/machine-learning/model-monitoring/overview
  - label: OpenAI, evaluating variable outputs (accessed 2026-11-27)
    url: https://developers.openai.com/api/docs/guides/evaluation-best-practices
  - label: NIST AI RMF Playbook, performance limits and test sets (accessed 2026-11-27)
    url: https://airc.nist.gov/airmf-resources/playbook/measure/
---

I'd hold the release if the no-photo group falls below its agreed minimum recall. I'd compare
the current model and the candidate on the same labeled claims held out from training. Recall
tells me how many true damage claims we catch. I'd also check precision, since sending too many
unrelated claims to review creates work for the team.

I'd stub model results to test validation and routing independently. If the model can give
different wording for the same claim, I'd grade whether it made the right routing decision
instead of matching its explanation word for word. Once live, I'd watch the incoming mix and
use new reviewer labels to check whether performance actually fell.

### Example

I split the evaluation by claims with photos and claims with only descriptions. The new model
catches more damage overall but misses more claims without photos. If recall for that slice falls
below the agreed minimum, I hold the release even though the total improved.
