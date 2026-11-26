---
title: Report exports slow down late in the suite
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
      - { id: report-size, text: Each report exports more rows than the one before it. }
      - { id: leaked, text: Each test leaves a browser session running and those sessions compete for runner resources. }
      - { id: capacity, text: A slower export endpoint delays every browser by the same amount. }
      - { id: stale, text: A cached element reference is reused from the first test. }
  - id: fix
    type: single-choice
    prompt: How should the suite handle these sessions?
    choices:
      - { id: close-tab, text: Close the current tab after each test and let the suite end the driver sessions. }
      - { id: increase, text: Increase the export test timeout as the suite progresses. }
      - { id: quit, text: Quit each driver in per-test teardown so failed assertions still release the session. }
      - { id: restart, text: Retry late failures on a newly provisioned runner. }
  - id: evidence
    type: multi-select
    prompt: Which checks link session count to the slowdown?
    choices:
      - { id: fast-rerun, text: A single late test finishes quickly when run alone. }
      - { id: session-profile, text: Runner metrics show completed tests' browser processes still alive and taking up memory as action latency rises. }
      - { id: after-cleanup, text: "On the same runner with the same reports, teardown keeps the session count flat and removes the late slowdown." }
      - { id: report-http, text: The last successful export endpoint call returns 200. }
reference:
  cause: leaked
  fix: quit
  evidence: [session-profile, after-cleanup]
decoy:
  cause: leaked
  fix: close-tab
  evidence: [fast-rerun, report-http]
---

Each parameter runs the same export flow on a seeded 25-row report. The CI runner executes this class serially. The class has no teardown, and each test opens an extra preview tab as part of the export flow.

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
