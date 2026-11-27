---
title: Report exports slow down late in the test suite
kind: diagnosis
topic: selenium
difficulty: hard
minutes: 8
roles: [sdet, senior]
items:
  - id: cause
    type: single-choice
    prompt: What best explains the slowdown?
    choices:
      - { id: report-size, text: Each report exports more rows than the report before it. }
      - { id: leaked, text: "Each test leaves a browser session running, and the sessions compete for runner resources." }
      - { id: capacity, text: A slower export endpoint delays every browser by the same amount. }
      - { id: stale, text: The tests reuse a cached element reference from the first test. }
  - id: fix
    type: single-choice
    prompt: How should the suite handle these sessions?
    choices:
      - { id: close-tab, text: "Close the current tab after each test, and let the suite end the driver sessions." }
      - { id: increase, text: Raise the export test's timeout as the suite gets further along. }
      - { id: quit, text: Quit each driver in per-test teardown so that failed assertions still release the session. }
      - { id: restart, text: Retry the late failures on a runner that was just set up. }
  - id: evidence
    type: multi-select
    prompt: Which checks link the number of sessions to the slowdown?
    choices:
      - { id: fast-rerun, text: A test from late in the suite finishes quickly when it is the only test running on the runner. }
      - { id: session-profile, text: Runner metrics show browser processes from finished tests using memory as actions slow down. }
      - { id: after-cleanup, text: "With the same runner and reports, teardown keeps session counts steady and ends the slowdown." }
      - { id: report-http, text: The response to the last successful request to the report export endpoint has HTTP status 200. }
reference:
  cause: leaked
  fix: quit
  evidence: [session-profile, after-cleanup]
decoy:
  cause: leaked
  fix: close-tab
  evidence: [fast-rerun, report-http]
---

The test runs once for each parameter value. Each run follows the same export flow on a seeded 25-row report. Seeded means the data is created before the test starts. The CI runner runs the tests in this class one at a time.

Each test starts its own driver session, which is a browser that the test controls through ChromeDriver. The class has no teardown, which is the cleanup code that runs after each test. As part of the export flow, each test also opens an extra preview tab.

```java
@BeforeEach
void startBrowser() {
    driver = new ChromeDriver();
}

@ParameterizedTest
@ValueSource(strings = {"orders", "refunds", "returns", "adjustments"})
void exportsReport(String kind) {
    openExportPreview(driver, kind);
    driver.findElement(By.id("export-csv")).click();
    assertEquals(25, readDownloadedCsv(kind).dataRowCount());
}
```

```text
entire shard uses the same setup for 36 data rows across report classes
after test 3:   active driver sessions=3   runner memory=1.9 GiB
after test 24:  active driver sessions=24  runner memory=6.8 GiB
test 35:        browser click command timed out
report service: export request latency stayed between 140 and 165 ms
```
