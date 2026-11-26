---
title: When would you use pairwise testing for notification settings?
topic: test-design
roles: [manual-qa, automation, sdet, senior]
level: mid
type: concept
oneLine: Pick valid configurations that cover every feasible pair of values, then add cases for risky interactions involving more settings.
looksFor:
  - Identifies what the parameters and representative values are.
  - Handles unsupported combinations as constraints in the model.
  - Explains that pairwise coverage is about a pair of values from two different parameters.
  - Adds a targeted higher-order case and defines its expected delivery.
trap: Testing each setting value once and treating that as coverage of every pair.
followUps:
  - question: How would you generate a suite once the settings list grows?
    answer: NIST's ACTS tool can generate a covering array from parameters and constraints. I'd check that the rows still cover the intended pairs after any edits and add the expected outcome for each row.
  - question: Which extra case would you add to the example?
    answer: I'd add the French in-app daily digest if that path has its own template. Every pair appears in the four cases, but that exact combination doesn't.
sources:
  - label: NIST SP 800-142, Practical Combinatorial Testing
    url: https://csrc.nist.gov/pubs/sp/800/142/final
  - label: NIST ACTS tool and constraint support
    url: https://csrc.nist.gov/Projects/automated-combinatorial-testing-for-software/downloadable-tools
---

I'd use it when we support a lot of combinations and need good coverage of settings that can interact. Pick the parameters and values, write down the combinations the product doesn't support, and build a suite where every feasible pair shows up in at least one test. I'd then decide what to check in each case. The rows tell me which settings to use; I still need the delivery rules to tell me what should happen.

Pairwise can miss a failure that needs a particular combination of more than two values. I'd add targeted cases for those if I know the product has a path that depends on them.

### Example

Say we support email or in-app, immediate or daily, and English or French in any combination. Email immediate in English, email daily in French, in-app immediate in French, and in-app daily in English cover every pair. For each case I'd trigger one alert and check the selected channel, delivery schedule, and language.
