---
title: "An incident summary reads well but gives the wrong delivery count. How should the evaluation catch that?"
topic: ai-testing
roles: [sdet]
level: senior
type: concept
oneLine: "I'd make the wrong count fail by itself. I'd score how clearly the summary explains the incident separately."
looksFor:
  - "Check facts against the record and give them their own pass condition."
  - "Accept different wording when it still matches the record."
  - "Test whether the model grader favors longer answers or one position in a pair."
  - "Save the cases and scoring rules so each release faces the same evaluation."
trap: "Letting a single score from a model hide a wrong fact."
followUps:
  - question: "Both summaries say seven deliveries moved, but the grader favors the longer one. Would you trust the score?"
    answer: "I'd ask reviewers whether the extra words clarify the cause or the schedule change. I'd check the same facts at both lengths. I'd also swap the order before relying on the grader's preference."
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

I'd make delivery count a required field, so the response must include it. I'd compare its value directly with the incident record. If the count is wrong, the check fails even when the rest reads well. In the free-text summary, I'd accept different words if they convey every fact the reviewer marked as necessary.

I'd use a rubric, a set of scoring rules, for judgments such as how clearly the summary gives the cause. I'd compare a model grader's decisions with people's scores on a sample of passes and failures. I'd score both releases with the same saved cases and rubric. I'd use the same reference answers, the expected answers I grade against.

### Example

The record says a van broke down and seven deliveries moved to the following day. I'd check the count against the record. I'd ask a reviewer or a grader checked against human scores to judge how clearly the summary explains the cause and schedule change. I wouldn't award extra points for length.
