---
title: "How would you check that an API returns each matching record once across all pages?"
topic: api
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: "I'd set up sorted records with equal sort values. I'd fetch every page and compare the collected IDs with the expected order."
looksFor:
  - "Set up the exact records and know what order their IDs should appear in."
  - "Check equal sort values and the final page."
  - "Look for an ID that appears twice or not at all."
  - "Say what the API promises if the data changes between requests."
trap: "Checking only the first page and assuming the later pages work."
followUps:
  - question: "What if a record arrives between page requests?"
    answer: "I'd follow the API's promise about changes between pages. If it takes a fixed copy of the data, I might expect a different order than if it reads the live list."
  - question: "How would you test the inputs that control which page the API returns?"
    answer: "I'd leave size out and check the documented default. I'd try the maximum and one above it. I'd also try a size of zero and a negative page. For each, I'd check the promised behavior, including whether an oversized request is rejected or reduced to the maximum."
---

I'd create more records than fit on one page. I'd put two equal values for the main sort field near a page boundary. I'd fetch pages the way a client does and compare the collected IDs in order. I'd include any documented tie-breaker, the rule that sorts records when the main values match.

I'd check an empty result and a list that exactly fills its last page. Both tell me when the API stops. I'd test records that change between page requests separately, using what the API promises about that case.

### Example

I'd use a report sorted first by update time and then by ID when timestamps match. With a page size of two, I'd put two records with the same timestamp on either side of the first break. Checking the count alone would miss one ID showing up twice in place of a missing one.
