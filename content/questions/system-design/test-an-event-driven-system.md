---
title: Stock shows five units after a return. What would prove a delayed duplicate cannot make it six?
topic: system-design
roles: [sdet, senior]
level: senior
type: scenario
oneLine: Account for both deliveries and check the committed stock movement as well as the displayed quantity.
looksFor:
  - Waits for evidence that both deliveries were handled before trusting the final count.
  - Checks that the stock movement is recorded once and references the expected return.
  - Moves race and retry cases into the consumer tests, including permanently failing events.
  - Uses a message contract to protect fields and versions the consumer depends on.
trap: Sleeping for ten seconds after publishing and treating a stock change as proof it happened only once.
followUps:
  - question: What do you capture if polling times out?
    answer: I'd capture the return and event IDs, latest inventory state, and the last known processing outcome so the failure distinguishes delayed handling from a rejected event.
sources:
  - label: Pact message contracts
    url: https://docs.pact.io/getting_started/how_pact_works
  - label: Amazon SQS standard queue delivery and ordering
    url: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html
  - label: Amazon SQS dead-letter queues
    url: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html
---

Five units tells me the first delivery worked. I'd poll a read-only inventory view and
processing records up to the agreed deadline and require evidence that the second delivery
was ignored. Then I'd check the movement history once for that return. I'd keep a small
deployed test for routing, since the isolated tests can't prove the event reached inventory.

I can make the consumer handle retries, a late status, and a permanently failing event
without waiting for those conditions in a cluster. I'd check dead-letter handling and no
stock change in the last case. A message contract can cover the producer's schema version
and required fields. I'd account for the broker's guarantees when choosing the cases.

### Example

I start with four units and send the same accepted return twice. I wait for evidence of
both handling outcomes, one applied and one ignored as a duplicate. The projection should
then show five units and the stock movement history should have one entry for the return.
