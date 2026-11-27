---
title: "A claims model catches more damage overall but misses more claims without photos. Would you release it?"
topic: ai-testing
roles: [sdet, senior]
level: senior
type: concept
oneLine: "I'd test both versions on the same claims they didn't train on. I'd keep the results for claims without photos separate when deciding."
looksFor:
  - "Use claims without photos that reviewers labeled to check whether the model misses more damage."
  - "Weigh missed damage claims against unnecessary manual reviews."
  - "Use known model results to test where claims go and judge variable model output by its decision."
  - "Tell a change in incoming claims apart from a drop in measured accuracy after release."
trap: "Approving a model on overall accuracy without counting the damage claims it missed."
followUps:
  - question: "More claims arrive without photos after launch, but nobody has labeled them. What can you report?"
    answer: "I'd report how the share of claims without photos changed from before. Before saying the model misses damage more often, I'd ask reviewers to label a sample of those claims."
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

I'd compare the current and proposed models on the same labeled claims that we kept out of training. Recall tells me what share of claims with real damage the model catches. If recall for claims without photos falls below the agreed minimum, I'd hold the release. I'd also check precision, the share of flagged claims that really have damage. Too many unrelated claims sent to review create extra work.

I'd stub the model by giving the app known results so I can separately test which results it accepts and where it sends claims. If explanations can vary, I'd grade the routing decision without matching the explanation word for word.

After launch, I'd track how the mix of incoming claims changes. I'd use new reviewer labels to check whether accuracy actually fell.

### Example

I'd score claims with photos separately from claims with only descriptions. If the new model improves overall but falls below the recall minimum for claims without photos, I'd hold the release.
