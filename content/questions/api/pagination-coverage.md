---
title: "How would you test that a paginated endpoint returns every matching record once?"
topic: api
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: "Seed an ordered dataset with ties, traverse to the end, and compare the combined identifiers with the expected sequence."
looksFor:
  - "Sets up exact expected identifiers and sort order."
  - "Tests ties and the final page."
  - "Detects duplicates and omissions."
  - "Clarifies what happens when data changes mid-traversal."
trap: "Checking the size of the first page and assuming every later page works."
followUps:
  - question: "What if a record arrives between page requests?"
    answer: "I'd test according to the consistency promise. A snapshot and a live list may legitimately produce different sequences."
  - question: "What would you check about the page parameters themselves?"
    answer: "I'd compare an omitted size with the documented default, test the maximum and one over it, and send a zero size and a negative page. I'd assert the promised behavior for each, including whether an oversized request is clamped or rejected."
---

I'd seed more records than fit on one page and include a tie in the main sort field near a page break. I fetch pages the way a client does and compare the collected IDs in order against the expected dataset, including any documented tie-breaker. I'd cover no results and an exact page multiple to exercise the end condition. I'd test changing data separately using the endpoint's consistency guarantees.

### Example

A report returns records sorted by update time, then by ID for matching timestamps. I'd use page size two and place two records with identical timestamps on either side of the first break. Checking just the total would miss an ID that appears twice in place of one that's missing.
