---
title: How would you run the profile checks concurrently without tests sharing a Selenium session?
topic: selenium
roles: [automation, sdet]
level: senior
type: tooling
oneLine: Allocate one browser and independent mutable data per test, then configure concurrency to fit the available slots.
looksFor:
  - Creates and quits a WebDriver session per test.
  - Enables concurrency in the runner.
  - Looks for leaked data and other shared state.
  - Matches CI concurrency to compatible Grid slots.
trap: Assigning every test to the same static driver and locking individual clicks.
followUps:
  - question: Alex and Blair have distinct browsers, but both jobs save their screenshot as profile.png. Where would you change the test?
    answer: I'd give each test attempt its own output path, just as I'd give it a distinct record ID if it edited a profile. Separate WebDriver sessions don't separate those files or backend records.
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

I'd start by giving each test its own driver and making sure teardown quits it. A static driver would let one test switch pages or close the browser under another test. I'd also audit what happens outside the browser, including shared accounts, cleanup jobs, and artifact paths.

The runner decides which tests start together. I'd enable its parallel mode and measure startup and queue time against the number of compatible Grid slots. If the suite still fails, I'd reproduce the smallest pair before adding workers.

### Example

The local fixture serves read-only profiles A and B with distinct page titles. The runner can execute both checks together, and each one opens and closes its own session.
