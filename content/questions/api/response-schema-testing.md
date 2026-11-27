---
title: "What does a response schema test catch, and what would you check separately?"
topic: api
roles: [automation, sdet]
level: mid
type: concept
oneLine: "I'd use the schema to check the shape and allowed values of the reply. I'd check separately whether the reply is right for my request."
looksFor:
  - "Check the required fields and their agreed value types."
  - "Decide what happens if an optional field is missing or an extra field appears."
  - "Check the actual business result as well as the schema."
  - "Cover success, errors, and empty replies."
trap: "Treating a schema pass as proof that the service did the math correctly or returned the right person's data."
followUps:
  - question: "Should the test fail if the response includes an extra field?"
    answer: "I'd fail it only if the API forbids that field or another rule rejects it. One example is a field that reveals private data."
sources:
  - label: "JSON Schema, object reference"
    url: https://json-schema.org/understanding-json-schema/reference/object
---

I use a schema, a description of the fields and allowed values, to catch changes a client might notice. A required field might disappear, or a whole number might become text. I'd decide whether to allow extra fields so an addition that works with the client doesn't break the test. I'd use known inputs to check the actual result. An amount can be a valid whole number but belong to the wrong invoice.

### Example

I'd check that every statement entry has a date and an amount in minor units, such as cents. In a separate test, I'd add a charge and its reversal. I'd check the exact entries and expect the two amounts to add up to zero. I'd also check the promised empty reply for an account with no entries.
