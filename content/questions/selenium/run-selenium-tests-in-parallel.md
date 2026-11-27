---
title: How would you run profile tests at the same time without sharing a Selenium session?
topic: selenium
roles: [automation, sdet]
level: senior
type: tooling
oneLine: I'd give each test its own browser and separate data to change. I'd set the number of tests running together to fit the available slots.
looksFor:
  - Start and quit a WebDriver session for each test.
  - Set the test runner to start more than one test at a time.
  - Check whether a test can affect another test's data or files.
  - Limit jobs running together to the Grid slots that have the browsers they need.
trap: Giving every test one shared driver and locking each click to try to prevent interference.
followUps:
  - question: Alex and Blair use different browsers, but both jobs save a screenshot as `profile.png`. What would you change?
    answer: I'd give each attempt its own file path. If a test edits a profile, I'd give it a separate record ID too. Separate WebDriver sessions don't keep files or server records apart.
sources:
  - label: Selenium test isolation
    url: https://www.selenium.dev/documentation/test_practices/encouraged/avoid_sharing_state/
  - label: Selenium Grid slots
    url: https://www.selenium.dev/documentation/grid/components/
  - label: JUnit 5 parallel execution
    url: https://docs.junit.org/5.14.5/writing-tests/parallel-execution.html
  - label: pytest-xdist worker count
    url: https://pytest-xdist.readthedocs.io/en/stable/distribution.html
  - label: pytest fixture teardown
    url: https://docs.pytest.org/en/stable/how-to/fixtures.html
examples:
  - title: Give every profile check a separate browser session
    variants:
      - lang: java
        label: Selenium 4 and JUnit 5 (Java)
        code: |
          import static org.junit.jupiter.api.Assertions.assertEquals;
          import org.junit.jupiter.api.Test;
          import org.junit.jupiter.api.parallel.Execution;
          import org.junit.jupiter.api.parallel.ExecutionMode;
          import org.openqa.selenium.chrome.ChromeDriver;

          @Execution(ExecutionMode.CONCURRENT)
          class ProfileTest {
            // Set junit.jupiter.execution.parallel.enabled=true in junit-platform.properties.
            @Test
            void readsProfileA() { checkTitle("A", "Alex"); }

            @Test
            void readsProfileB() { checkTitle("B", "Blair"); }

            private void checkTitle(String id, String name) {
              var driver = new ChromeDriver();
              try {
                driver.get("http://localhost:3000/profiles/" + id);
                assertEquals(name, driver.getTitle());
              } finally {
                driver.quit();
              }
            }
          }
      - lang: python
        label: Selenium and pytest (Python)
        code: |
          import pytest
          from selenium import webdriver

          # With pytest-xdist installed, run pytest -n 2.
          @pytest.fixture
          def driver():
              with webdriver.Chrome() as browser:
                  yield browser

          @pytest.mark.parametrize("profile,title", [("A", "Alex"), ("B", "Blair")])
          def test_profiles(driver, profile, title):
              driver.get(f"http://localhost:3000/profiles/{profile}")
              assert driver.title == title
---

I'd start a WebDriver session, the connection that controls the browser, for each test. I'd have cleanup quit the session. If I use one static driver, every test shares it. One test could change pages or close the browser another test uses. I'd also check for shared accounts, cleanup jobs that affect other tests, and file paths used by more than one test.

I'd turn on parallel mode so the test runner can start more than one test at a time. I'd count compatible Grid slots, places to run the browsers my jobs ask for. I'd measure time waiting for a slot and time starting a session. If the suite still fails, I'd find the smallest pair of tests that fails together before adding workers.

### Example

I'd use a local test setup with read-only profiles A and B. They have different page titles, so I can tell them apart. I'd run both checks together and make sure each opens and closes its own session.
