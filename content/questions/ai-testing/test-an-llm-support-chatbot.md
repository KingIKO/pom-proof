---
title: "The delivery bot promised a ticket, but the support queue is empty. What should the tests prove?"
topic: ai-testing
roles: [sdet, senior]
level: senior
type: scenario
oneLine: "I'd check that the app saved the ticket in the right queue and that it belongs to the signed-in customer."
looksFor:
  - "Check the saved ticket and its queue separately from the reply the customer sees."
  - "Check that the app enforces permissions even when the model responds differently."
  - "Use cases support has reviewed to tell backed-up promises apart from claims the app can't verify."
  - "Compare versions on the same cases and watch for missed transfers to support after release."
trap: "Approving a chatbot because it gave a good answer to one clear delivery question."
followUps:
  - question: "What would you watch for after release?"
    answer: "I'd track transfers to support and customer reports. I'd review a sample approved for privacy to look for wrong advice or missed transfers. I'd turn confirmed cases into regression examples, test cases that catch the same problem if it returns."
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

I'd test sign-in separately. I'd stub the model, meaning I'd supply a known request to open a ticket instead of waiting for the model to make one. I'd check that the app saves one ticket in the right queue under the signed-in customer's account. I'd score the reply separately for whether it follows policy and claims only things the app actually did.

I'd ask support to grade a fixed set of conversations and group the results by case type. I'd include cases where private details must stay private. I'd also check that the app treats untrusted text as data instead of instructions. The app checks permissions even if the model changes what it says. I'd use the same cases to compare prompts or models and watch for missed transfers once the bot is live.

### Example

I'd use a fictional conversation about a late parcel. If the shipping record gives no new date, the reply should acknowledge the delay without making one up. If the signed-in customer asks for a ticket, my integration test checks that the app saves it in the right queue under that account.
