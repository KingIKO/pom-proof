---
title: How would you retry a temporary error when a Python test reads a shipment receipt?
topic: python
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Retry the specific transient exception on the read, increase the wait each time, and let the last failure through.
looksFor:
  - Configures the exception types and attempt count.
  - Waits between attempts and re-raises the last exception on exhaustion.
  - Uses functools.wraps and forwards positional and keyword arguments.
  - Keeps retries away from failed assertions and unsafe writes.
trap: Decorating an entire flaky test to retry any exception and treating a later pass as proof of correctness.
followUps:
  - question: How would you check the backoff without slowing down the test?
    answer: Inject a delay function that records the requested waits, then assert those waits and the number of calls.
sources:
  - label: Python functools.wraps
    url: https://docs.python.org/3/library/functools.html#functools.wraps
  - label: Python exception handling and re-raising
    url: https://docs.python.org/3/tutorial/errors.html
  - label: Python time.sleep
    url: https://docs.python.org/3/library/time.html#time.sleep
  - label: Tenacity retry, stop, and wait policies
    url: https://tenacity.readthedocs.io/en/latest/
examples:
  - title: Retry a receipt read twice before it succeeds
    variants:
      - lang: python
        label: Python 3
        code: |
          from functools import wraps
          from time import sleep


          def retry(errors, *, attempts, first_wait, pause=sleep):
              if attempts < 1 or first_wait < 0:
                  raise ValueError("Need at least one attempt and a nonnegative wait")

              def decorate(read):
                  @wraps(read)
                  def wrapped(*args, **kwargs):
                      delay = first_wait
                      for attempt in range(1, attempts + 1):
                          try:
                              return read(*args, **kwargs)
                          except errors:
                              if attempt == attempts:
                                  raise
                              pause(delay)
                              delay *= 2

                  return wrapped

              return decorate


          waits = []
          replies = iter([None, None, "packed"])


          @retry((TimeoutError,), attempts=3, first_wait=0.25, pause=waits.append)
          def read_receipt(shipment_id):
              """Read the status for a shipment."""
              status = next(replies)
              if status is None:
                  raise TimeoutError(shipment_id)
              return status


          assert read_receipt("S-18") == "packed"
          assert waits == [0.25, 0.5]
---

I'd wrap the receipt read, since repeating a read leaves the shipment alone. The decorator takes
the exception types we expect to be transient, a total attempt count, and a starting delay. It
waits between failed attempts, growing the delay each time. Once the attempts run out, a bare
`raise` keeps the last error and its traceback. Any unlisted error goes straight back to the caller.

`functools.wraps` preserves the function's name and docstring. If the shipping service needs
this policy too, I'd configure Tenacity's stop and wait rules rather than ship a second retry loop.
I'd keep the assertion outside the wrapper so it checks the first receipt the read returns.

### Example

A stub receipt read times out twice and then reports `packed`. The test records the two requested
waits instead of sleeping, so it can check the backoff directly.
