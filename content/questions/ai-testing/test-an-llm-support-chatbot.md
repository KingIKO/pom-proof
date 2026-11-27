---
title: The delivery bot promised a ticket, but the support queue is empty. What should the tests prove?
topic: ai-testing
roles: [sdet, senior]
level: senior
type: scenario
oneLine: Check that the promise corresponds to a ticket the signed-in customer actually owns.
looksFor:
  - Separates the visible reply from evidence of a saved ticket and correct queue.
  - Checks that the application enforces permissions even when model output varies.
  - Uses support-reviewed cases to distinguish accurate promises from unsupported ones.
  - Compares versions on the same cases and watches for missed handoffs after release.
trap: Signing off because one well-worded delivery question got a good answer.
followUps:
  - question: What would you monitor after launch?
    answer: >-
      I'd track handoffs and customer reports, then review a privacy-approved sample for incorrect
      advice and missed escalations. I'd turn confirmed cases into regression examples.
sources:
  - label: OpenAI, evaluation design and continuous evaluation (accessed 2026-11-27)
    url: https://developers.openai.com/api/docs/guides/evaluation-best-practices
  - label: OpenAI, safety testing and output review (accessed 2026-11-27)
    url: https://developers.openai.com/api/docs/guides/safety-best-practices
  - label: OWASP, prompt injection defenses and least privilege (accessed 2026-11-27)
    url: https://genai.owasp.org/llmrisk/llm01-prompt-injection/
  - label: NIST AI RMF Playbook, post-deployment monitoring (accessed 2026-11-27)
    url: https://airc.nist.gov/airmf-resources/playbook/manage/
---

I'd test sign-in on its own and stub the model's request to open a ticket. Then I'd check for one
saved ticket in the right queue under the signed-in customer's account. A reply can be graded
separately for policy accuracy and for claiming only actions the app actually completed.

I'd work with support to grade a fixed set of conversations, group the results by case type, and
include cases where private details must stay private or untrusted text must stay data. The app
still owns permission checks. I'd use the cases to compare prompt or model changes and watch for
missed handoffs in production.

### Example

In a synthetic conversation, the shipping record shows a parcel is late but gives no revised
arrival date. A good reply acknowledges the delay without inventing a date. If the customer asks
for a ticket after signing in, my integration test checks the new ticket's queue and confirms
that it belongs to the signed-in account.
