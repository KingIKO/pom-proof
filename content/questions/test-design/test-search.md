---
title: How would you check that search returns the right products from a small catalogue?
topic: test-design
roles: [manual-qa, automation, sdet]
level: junior
type: scenario
oneLine: I'd set up products that should match and ones that shouldn't. I'd check the lists with and without filters and what the app shows if search fails.
looksFor:
  - Use test records so you know what should match and what should stay out.
  - Check the rules for what matches and how results sort.
  - Tell a search with no matches apart from a search that failed.
  - Check that the list on screen matches the latest search text and filters.
trap: Searching a live catalogue and passing the test whenever anything comes back.
followUps:
  - question: How would you check that editing a search quickly doesn't bring back the old list?
    answer: I'd make the first search finish after the second. I'd check that the final list still matches the second search.
  - question: How would you test unusual search text and the order of results?
    answer: >-
      I'd try text past the length limit, with punctuation, or resembling markup, the text used to structure a page.
      I'd expect safe text handling or a clear rejection, with no server error.
      I'd set up an exact match and a partial match that should rank lower.
      I'd check their order against the promised rule.
sources:
  - label: ISTQB CTFL v4.0.1, section 4.2.1, choosing representatives by expected behavior
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
  - label: OWASP input validation and free-form text
    url: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
  - label: OWASP output encoding for untrusted text
    url: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
---

I'd set up a small catalogue so I know which products belong in each list. I'd try search text with several matches and text with none. I'd also test a matching rule the product promises. I'd ask how the app treats partial words or accents before I decide what counts as a match. If the product promises an order, I'd check it too.

After changing a filter, I'd check the list again because the old results may no longer be right. I'd also check that the app tells me whether nothing matched or search is temporarily unavailable.

### Example

For a bike parts shop, I'd set up two cable locks, a chain lock, and a brake cable. I'd search names for `cable` with the Locks filter on. I'd expect both cable locks and neither the chain lock nor the brake cable.
