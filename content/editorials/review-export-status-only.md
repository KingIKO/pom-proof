---
problem: diagnosis/review-export-status-only
---

## What is going on

The export endpoint is the URL the test calls for each preset. Its response has a `columns` field in JSON, a text format for data. Orders, refunds and returns each have their own expected column list. The team needs a separate result for each preset when the automated CI jobs run the tests. The fixtures, reusable test setup, already supply the base URL and request headers that prove the test is signed in.

## The answer

1. Mark the loop on line 8 and the status check on line 12.

   **Why:** Line 8 loops over all the presets inside one test. The first failed assertion, or check, stops the test, so CI gets no result for later presets. Line 12 checks only the HTTP status, the code that reports whether the request succeeded. Every preset could return 200 with the same wrong column list and still pass.

2. The status-only assertion can pass even when the columns are wrong.

   Give each preset its own named case using `pytest.mark.parametrize`, which runs the same test once per set of inputs. Check for status 200. Read the JSON response and compare `body['columns']` with `list(columns)`.

   **Why:** Separate cases give CI one result per preset, even if another case fails. The status check keeps an error response with matching JSON from passing. The list comparison checks both the values and their order.

## Why the tempting answer fails

The decoy correctly marks line 12 because it ignores the columns. It skips line 8, so CI still cannot report the presets separately. If you check the response body inside the loop, you can catch wrong columns. The test still stops at the first failure. If you split the old status check into separate cases, CI reports every preset but still misses wrong columns in successful responses.

## What the interviewer listens for

Describe a run with two broken presets. One returns the right column names in the wrong order. CI should report both failures and still show a pass for the preset that works.

## Sources

- [pytest: parametrization](https://docs.pytest.org/en/stable/how-to/parametrize.html)
- [Requests: response status and JSON](https://requests.readthedocs.io/en/latest/user/quickstart/)
- [Python: sequence comparisons](https://docs.python.org/3/library/stdtypes.html#comparisons)
