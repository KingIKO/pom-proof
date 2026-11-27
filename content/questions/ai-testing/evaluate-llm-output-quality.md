---
title: A polished incident summary gets the delivery count wrong. How would you make that fail the evaluation?
topic: ai-testing
roles: [sdet]
level: senior
type: concept
oneLine: Make a wrong count fail on its own and reserve subjective scoring for how well the summary explains the incident.
looksFor:
  - Gives verifiable facts their own pass condition.
  - Tells acceptable paraphrases from factual disagreement with the record.
  - Tests a model grader with cases that expose length or order preferences.
  - Uses a recorded set of cases and rubric to compare releases on equal terms.
trap: Letting a model's single overall score hide an incorrect fact.
followUps:
  - question: Two summaries correctly say seven deliveries moved, but the grader prefers the one with extra wording. Would you trust that score?
    answer: >-
      I'd ask reviewers to judge whether the extra wording makes the cause or reschedule clearer.
      I'd test the same facts at both lengths and swap the order of the pair before treating the
      grader's preference as evidence.
sources:
  - label: JSON Schema, object properties and required fields (accessed 2026-11-27)
    url: https://json-schema.org/understanding-json-schema/reference/object
  - label: OpenAI, string, similarity, and model graders (accessed 2026-11-27)
    url: https://developers.openai.com/api/docs/guides/graders
  - label: OpenAI, human judgment and continuous evaluation (accessed 2026-11-27)
    url: https://developers.openai.com/api/docs/guides/evaluation-best-practices
  - label: Zheng and colleagues, model judge bias in MT-Bench (accessed 2026-11-27)
    url: https://arxiv.org/abs/2306.05685
---

I'd make delivery count a required field and compare it directly with the incident record.
That check fails even if the narrative reads well. For the free-text summary, different wording
is fine as long as it conveys the same facts the reviewer marked as necessary.

I'd use the rubric for decisions that aren't exact matches, like whether the cause is clear.
I'd compare model grader decisions with human labels and sample both passes and failures.
To see what a new prompt or model changed, I'd score both releases against the same recorded
cases, references, and rubric.

### Example

The source record says a van broke down and seven deliveries moved to the following day. I'd
check the count against the record. A reviewer or calibrated grader can assess whether the
summary makes the cause and schedule change clear without getting credit for extra wording.
