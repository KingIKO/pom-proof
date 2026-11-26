---
title: "What can response schema tests catch, and what do they miss?"
topic: api
roles: [automation, sdet]
level: mid
type: concept
oneLine: "A schema can catch differences in structure or allowed values; separate checks establish whether the response is correct for the request."
looksFor:
  - "Checks required fields and agreed value types."
  - "Decides how to handle optional and additional fields."
  - "Uses business assertions alongside schema checks."
  - "Accounts for success, error, and empty responses."
trap: "Treating a schema pass as proof that calculations or data ownership are correct."
followUps:
  - question: "Should a response with an extra field fail?"
    answer: "Only if the contract disallows it or the field violates a separate rule, such as returning private data."
sources:
  - label: "JSON Schema, object reference"
    url: https://json-schema.org/understanding-json-schema/reference/object
---

I use schema checks to detect changes a client might notice, like a required field disappearing or an integer becoming a string. I set the policy for additional fields deliberately so a compatible addition doesn't break a test. Then I assert the business result with known inputs. An amount can be an integer and still belong to the wrong invoice.

### Example

For a statement endpoint I'd check that every entry has a date and an amount in minor units. A separate test would seed a charge and its reversal, then confirm the exact entries and that their net contribution is zero. I'd also cover the documented empty response on an account with no entries.
