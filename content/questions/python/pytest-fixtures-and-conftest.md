---
title: How would you set up separate HTTP sessions for each invoice API test in pytest?
topic: python
roles: [automation, sdet]
level: mid
type: tooling
oneLine: I'd use a fixture in `conftest.py` to give each test a way to create its own sessions. The fixture would close them when the test ends.
looksFor:
  - Explain how pytest matches an argument name to a fixture.
  - Choose how long the fixture lasts based on what tests can safely share.
  - Give a test a function to create sessions if it needs several with different settings.
  - Close every session when the test ends, even if a check fails.
trap: Sharing one Requests session across the run when tests change cookies or headers.
followUps:
  - question: What happens to cleanup if the fixture fails before `yield`?
    answer: Pytest won't run the code after `yield`. If setup can fail after opening a session, I'd add cleanup for that failure.
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

I'd put the fixture, which sets up what a test needs, in the API tests' `conftest.py` file. A test asks for the fixture by naming it as an argument. Pytest finds `conftest.py` for tests in that folder and its subfolders. I don't have to import the fixture in each test.

I'd use function scope, which gives each test its own setup, because a Requests session's cookies and headers can change. Pytest also offers class, module, package, and session scopes for sharing setup. I'd use a wider scope for things tests can safely share, such as settings they only read.

If one test needs two clients, I'd give it a factory, a function that opens a fresh session every time I call it. The fixture hands it over with `yield` and closes both sessions when the test ends, even after a failed check.

### Example

For a single-file example, I'd keep the fixture in the test file. I'd create one client for the west region and one for the east region. I'd check that creating the second client leaves the first client's header unchanged. I don't need the network for this check.
