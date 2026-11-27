---
title: How would you test search on a small product catalogue?
topic: test-design
roles: [manual-qa, automation, sdet]
level: junior
type: scenario
oneLine: Seed a catalogue with known matches and near misses, then check results, filters, and what users see when a search cannot finish.
looksFor:
  - Uses records with predictable matches and exclusions.
  - Confirms which matching and ordering rules the product promises.
  - Distinguishes a valid empty result from an unavailable search.
  - Checks that displayed results match the current query and filters.
trap: Searching a live catalogue and passing the test whenever at least one result appears.
followUps:
  - question: How would you catch the wrong list appearing after a quick query change?
    answer: I'd have the first search finish after the second in a controlled test. I'd check that the final list still belongs to the second query.
  - question: How would you exercise unusual input and verify ranking?
    answer: >-
      Try a query beyond the length limit, one with punctuation, and one that looks like markup.
      Expect safe text handling or a clear rejection and no server error. For ranking, seed an exact
      match and a lower-ranked partial match and check their order against the promised rule.
sources:
  - label: ISTQB CTFL v4.0.1, section 4.2.1, choosing representatives by expected behavior
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
  - label: OWASP input validation and free-form text
    url: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
  - label: OWASP output encoding for untrusted text
    url: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
---

I'd set up a small catalogue so I know which records should come back and which should stay out. I'd use a query with several matches, one with no matches, and a query that exercises a promised matching rule. I'd ask about things like partial words or accents before setting expectations. If the feature promises an order, I'd check that too.

Filters matter because a good result for an unfiltered query can still be wrong after the user changes a filter. I'd also check that the app tells me the difference between no matches and a temporary search failure.

### Example

For a bike parts shop, I'd seed two cable locks, a chain lock, and a brake cable. With name search and a Locks category filter, searching for `cable` should return the two cable locks and exclude both the chain lock and the brake cable.
