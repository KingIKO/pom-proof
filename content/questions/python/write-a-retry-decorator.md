---
title: How would you make a Python test retry a shipment receipt read after a temporary error?
topic: python
roles: [automation, sdet]
level: mid
type: tooling
oneLine: I'd retry only the read and only for expected temporary errors. I'd wait longer between attempts and report the last error if they all fail.
looksFor:
  - Set which errors to retry and how many attempts are allowed.
  - Wait between attempts and raise the last error again if no attempt succeeds.
  - Use `functools.wraps` and pass through arguments supplied by position and by name.
  - Keep retries separate from failed checks and writes that aren't safe to repeat.
trap: Retrying an entire unreliable test for any error and treating a later pass as proof it works.
followUps:
  - question: How would you check the waits between attempts without making the test slower?
    answer: I'd supply a delay function that records each requested wait without sleeping. I'd check the recorded waits and the number of attempts.
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

I'd use a decorator, a wrapper that adds behavior to a function, around just the receipt read. Repeating the read leaves the shipment alone. I'd give the decorator the types of temporary errors it can retry, the total number of attempts, and the first delay. I'd increase the wait after each failed attempt. If the attempts run out, a bare `raise` keeps the last error and its traceback, the record of where it happened.

If an error isn't on the list, I'd let it go straight back to the caller.

I'd use `functools.wraps` to keep the wrapped function's name and docstring, the text that describes it. If the shipping service needs the same policy, I'd set the stop and wait rules in Tenacity, a retry library. That saves writing another retry loop. I'd keep my check outside the wrapper so it checks the first receipt the read returns.

### Example

I'd use a stub, a stand-in for the real read, that times out twice and then returns `packed`. I'd record the two requested waits instead of sleeping. I'd check the backoff, the way the waits increase between attempts.
