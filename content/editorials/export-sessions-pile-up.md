---
problem: diagnosis/export-sessions-pile-up
---

## What is going on

Each test exports the same number of rows and starts a new ChromeDriver session. The export service stays near 140 to 165 ms, but a browser click times out late in the shard. After 24 completed tests, 24 sessions are still active and runner memory has climbed to 6.8 GiB.

## The answer

1. Identify browser sessions left running by completed tests as the cause of the slowdown.

   **Why:** The resource use grows with the number of finished tests whose sessions remain open. The timeout is on a browser command, and the stable export latency gives little reason to blame increasingly slow report generation.

2. Pair the per-test setup with `@AfterEach` teardown that calls `driver.quit()` if a driver was created.

   **Why:** Teardown gets a chance to release the session even if an assertion throws and skips the rest of the test body. Quitting also closes the extra preview tab and any other windows still in that session.

3. Profile the surviving browser processes, active sessions, memory and action latency in the original run. Then rerun the same reports on the same runner with teardown and check that session count stays flat and the late slowdown disappears.

   **Why:** The profile shows what accumulates. The comparison tests whether releasing those resources changes browser latency while the workload stays the same.

## Why the tempting answer fails

The decoy names the leak correctly, but closing only the current tab leaves another window open and the session active. A fast isolated rerun hints at a suite effect without identifying what leaked, and a 200 from the report endpoint says nothing about browser latency. A longer timeout can push the failure farther down the suite while sessions still pile up.

## What the interviewer listens for

Tie cleanup to the lifetime of each session and explain how the before-and-after run separates runner contention from service performance.

## Sources

- [Selenium: quitting the browser](https://www.selenium.dev/documentation/webdriver/interactions/windows/#quitting-the-browser-at-the-end-of-a-session)
- [JUnit: `AfterEach`](https://docs.junit.org/current/api/org.junit.jupiter.api/org/junit/jupiter/api/AfterEach.html)
