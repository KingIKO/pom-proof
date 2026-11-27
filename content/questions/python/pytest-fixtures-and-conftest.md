---
title: How would you give each invoice API test its own HTTP sessions in pytest?
topic: python
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Put a function-scoped factory fixture in the API tests' conftest.py and close every session it creates.
looksFor:
  - Explains how pytest injects fixtures by argument name.
  - Picks fixture scope based on how long the resource can safely be shared.
  - Uses a factory when a test needs several independently configured sessions.
  - Closes all sessions after the test, including on assertion failure.
trap: Putting one mutable Requests session at session scope for tests that change cookies or headers.
followUps:
  - question: What happens to teardown if this fixture raises before yield?
    answer: pytest does not run the code after its yield, so any setup that can fail after acquiring a resource needs its own cleanup.
sources:
  - label: pytest fixture scopes, teardown, and factories
    url: https://docs.pytest.org/en/stable/how-to/fixtures.html
  - label: Requests session objects
    url: https://requests.readthedocs.io/en/latest/user/advanced/#session-objects
  - label: Python ExitStack
    url: https://docs.python.org/3/library/contextlib.html#contextlib.ExitStack
examples:
  - title: Build two invoice clients in one test
    variants:
      - lang: python
        label: pytest and Requests (Python)
        code: |
          from contextlib import ExitStack

          import pytest
          import requests


          @pytest.fixture
          def make_client():
              with ExitStack() as sessions:
                  def make(region):
                      session = sessions.enter_context(requests.Session())
                      session.headers["X-Region"] = region
                      return session

                  yield make


          def test_invoice_clients_keep_their_own_region(make_client):
              west = make_client("west")
              east = make_client("east")
              assert west.headers["X-Region"] == "west"
              assert east.headers["X-Region"] == "east"
---

I'd put the fixture in the API tests' `conftest.py`. A test asks for it by naming the fixture in its
arguments. pytest discovers `conftest.py` for tests in that directory and its descendants, so the
tests don't need to import the fixture.

I'd keep each Requests session at function scope because cookies and headers can change. pytest
also supports class, module, package, and session scopes. I'd use a wider scope for something the
tests can safely share, such as read-only settings. If a single test needs two clients, I'd yield a
factory that makes a new session per call. The fixture closes both when the test ends.

### Example

For this single-file example, I've kept the fixture in the test module. One invoice test builds a
west-region client and an east-region client. It checks that creating the second client leaves the
first client's header alone. The check needs no network.
