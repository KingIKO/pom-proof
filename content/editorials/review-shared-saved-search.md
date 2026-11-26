---
problem: diagnosis/review-shared-saved-search
---

Mark lines 3, 6 and 12. The module variable makes a value available outside the test that creates it. The sharing test writes that value, and the removal test reads it as though the record belonged to its own setup. Run removal by itself and neither the ID nor the record is available.

Have the removal test create its own search through the fixture and use the returned ID locally. The sharing test can keep its existing local `id`. Each test then owns a separate record and fixture cleanup has the right lifetime. Run each alone and run both together to check that their outcomes are independent.

A candidate may flag the variable declaration and the later navigation while leaving the assignment unmarked. The assignment is the handoff that creates the dependency. Serial execution is also tempting, but the fixture removes the first test's search after that test ends. A new test context cannot make a deleted database record reappear.

An interviewer will look for who owns the record and when cleanup runs. The answer should make the removal test self-contained.

[Playwright: test fixtures](https://playwright.dev/docs/test-fixtures) · [Playwright: test isolation](https://playwright.dev/docs/best-practices#make-tests-as-isolated-as-possible)
