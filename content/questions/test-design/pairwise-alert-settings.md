---
title: When would you use pairwise testing for notification settings?
topic: test-design
roles: [manual-qa, automation, sdet, senior]
level: mid
type: concept
oneLine: I pick valid configurations that cover every possible pair of values. I add tests for risky interactions that involve more settings.
looksFor:
  - Name each setting and the values that represent it in the tests.
  - Record unsupported combinations as constraints.
  - Explain that each pair contains values from two different settings.
  - Add a case with more than two settings and say how its alert should arrive.
trap: Checking each value once and assuming that covers every pair of values.
followUps:
  - question: How would you generate a suite once the settings list grows?
    answer: I'd use NIST's ACTS tool to build a covering array, a set of rows that covers the pairs my constraints allow. If I edit the rows, I'd check that they still cover those pairs. I'd add the expected result for every row.
  - question: Which extra case would you add to the example?
    answer: If the French in-app daily digest has its own template, I'd add a test for it. The four cases cover every pair. That specific combination is still missing.
sources:
  - label: NIST SP 800-142, Practical Combinatorial Testing
    url: https://csrc.nist.gov/pubs/sp/800/142/final
  - label: NIST, research on the number of inputs involved in faults
    url: https://csrc.nist.gov/projects/automated-combinatorial-testing-for-software
  - label: NIST ACTS tool and constraint support
    url: https://csrc.nist.gov/Projects/automated-combinatorial-testing-for-software/downloadable-tools
---

I'd use pairwise testing if the product supports many combinations of settings that can interact. Each pair combines values from two different settings. I list the settings and values first, then mark the combinations the product does not support. My suite includes every supported pair in at least one test. I use the delivery rules to decide what should happen for each row.

NIST found that most failures in the systems it studied involved only one or two inputs. Pairwise tests can catch many of those failures without trying every combination.

Pairwise testing can miss failures that need a specific combination of more than two values. If I know a product path depends on one of those combinations, I add a test for it.

### Example

Suppose any combination of channel, schedule, and language works. The channel can be email or in-app. The schedule can be immediate or daily, and the language can be English or French. I'd use these cases to cover every pair:

- Immediate email in English
- Daily email in French
- Immediate in-app alert in French
- Daily in-app alert in English

For each case, I'd trigger one alert. I'd check its channel, delivery schedule, and language.
