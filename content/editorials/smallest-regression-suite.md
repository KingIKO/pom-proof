---
problem: code/smallest-regression-suite
---

Explore subsets of the available tests and track which required labels each subset covers. For each test, try including it, then try skipping it. Once you have a complete suite, remember its size. You can stop exploring any incomplete suite that is already as large as the best complete one, because adding another test cannot improve it.

The shortcut repeatedly picks the test with the greatest immediate gain. It finds a cover when one exists, but that cover can be larger than necessary. One test might cover four of six labels and leave two labels that require different tests. Two tests covering three labels each can cover all six by themselves. The large first choice would turn that two-test suite into three.

An interviewer may ask why equal-size results are deterministic. Sorted IDs and include-first traversal visit equal-size subsets in list order, so keep the first complete suite of that size. Skipping a test that adds no coverage is safe because removing it produces the same coverage with fewer tests. The small fixture size keeps exact search practical.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
