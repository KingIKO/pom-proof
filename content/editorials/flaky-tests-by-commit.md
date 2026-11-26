---
problem: code/flaky-tests-by-commit
---

Store pass and fail evidence under both the test name and commit. Each new observation updates one pair. When that pair has both outcomes, add the name to an ordered collection of qualifying tests. A test that proves flaky on another commit later keeps its original place in the result.

The shortcut groups by test name alone. It detects mixed results, but it can treat an ordinary fix as evidence of flakiness. If a test fails on the last broken commit and passes only on the next commit, there is no mixed outcome for either commit. That counterexample helps explain why the commit belongs in the key.

In an interview, describe the moment when the report first has enough evidence to add a test. The first row for the test and the row that proves flakiness can be far apart. Test the output order with two interleaved test names. You can keep two flags per pair instead of a set, as long as skips never set either flag.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
