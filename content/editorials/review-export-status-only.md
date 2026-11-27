---
problem: diagnosis/review-export-status-only
---

## What is going on

The endpoint returns a JSON `columns` field. Orders, refunds and returns have different expected column lists, and the team also needs a separate CI result for each preset. The URL and authentication fixtures already supply the setup this check needs.

## The answer

1. Mark line 8, which loops over the presets inside one test, and line 12, which asserts only the HTTP status.

   **Why:** At line 8, the first failed assertion stops the function and leaves CI with no result for the remaining presets. At line 12, every response could return the same wrong column list and still pass with status 200.

2. Choose the status-only assertion as the cause of the false green. Give each preset a named `pytest.mark.parametrize` case. Check status 200, parse the JSON and compare `body['columns']` with `list(columns)`.

   **Why:** Separate cases give CI an outcome for each preset. List equality checks the values in order, and keeping the status check prevents an error response with a matching JSON shape from looking successful.

## Why the tempting answer fails

The decoy correctly names the ignored column list and marks line 12. Leaving line 8 unmarked misses the separate reporting requirement. Adding a body assertion inside the loop improves what the check can detect but still stops at the first failure. Parametrizing the old assertion alone reports every status and still misses wrong columns in successful responses.

## What the interviewer listens for

Describe a run with two broken presets, one of which returns the right values in the wrong order. Both failures should be reported and the unbroken preset should still pass.

## Sources

- [pytest: parametrization](https://docs.pytest.org/en/stable/how-to/parametrize.html)
- [Requests: response status and JSON](https://requests.readthedocs.io/en/latest/user/quickstart/)
- [Python: sequence comparisons](https://docs.python.org/3/library/stdtypes.html#comparisons)
