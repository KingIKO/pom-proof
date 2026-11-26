---
problem: diagnosis/review-export-status-only
---

Mark lines 8 and 12. Line 12 would pass even if the endpoint returned the same incorrect column list for every preset. Line 8 puts all three cases in one test. An assertion in that loop stops the function at the first failure, which leaves CI with no result for the remaining presets.

Use `pytest.mark.parametrize` to give each preset a named case. In each case, check status 200, parse the JSON and compare `body['columns']` to `list(columns)`. List equality checks the specified order as well as the values. Keep the status check so a failure response with JSON cannot accidentally satisfy the test.

Adding a body assertion inside the existing loop improves correctness but leaves reporting incomplete. Conversely, parametrizing the current test gives a separate result for every status while still missing a column regression. The more serious issue is the false green when every payload is wrong.

An interviewer will value a check with two broken presets: both should be reported, and the unbroken case should still pass.

[pytest: parametrization](https://docs.pytest.org/en/stable/how-to/parametrize.html) · [Requests: response status and JSON](https://requests.readthedocs.io/en/latest/user/quickstart/)
