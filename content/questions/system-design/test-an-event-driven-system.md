---
title: Stock shows five units after a return. How would you check that a delayed copy can't make it six?
topic: system-design
roles: [sdet, senior]
level: senior
type: scenario
oneLine: I'd check what happened to both messages. I'd check the saved stock change as well as the displayed quantity.
looksFor:
  - Before trusting the final count, check that the service handled both deliveries.
  - Check that there's one saved stock change and it names the correct return.
  - Test overlapping work, retries, and messages that never succeed in the program that handles events.
  - Write down and check which message fields and versions the receiving program needs.
trap: Waiting ten seconds after sending the message and assuming a stock change happened only once.
followUps:
  - question: What would you record if the test stops waiting before it sees the result?
    answer: I'd keep the return and event IDs and the latest stock state. I'd record the last known result so I can tell delayed handling from a rejected message.
sources:
  - label: Pact message contracts
    url: https://docs.pact.io/getting_started/how_pact_works
  - label: Amazon SQS standard queue delivery and ordering
    url: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html
  - label: Amazon SQS dead-letter queues
    url: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html
---

Seeing five units tells me the first delivery worked. I'd poll the read-only inventory view and processing records, meaning I'd check them repeatedly until the agreed deadline. I'd look for evidence that the service ignored the second delivery. I'd check the stock change history for that return. I'd keep a small test on the deployed service because tests in isolation can't show that the message reached inventory.

I'd test the consumer, the program that handles messages, without waiting for those conditions in a deployed cluster. I'd make it handle retries, a late status, and an event that always fails. If the event never succeeds, I'd check dead-letter handling, where failed messages go, and make sure stock stays the same.

I'd use a message contract, a set of rules for messages, to check the sender's format version and required fields. I'd choose cases based on what the broker, the service that delivers messages, promises.

### Example

I'd start with four units and send the same accepted return twice. I'd wait to see one delivery applied and the other ignored as a duplicate. I'd expect the projection, the stock view built from events, to show five units. I'd check that the history has one stock change for the return.
