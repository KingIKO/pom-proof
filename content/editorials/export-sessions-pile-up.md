---
problem: diagnosis/export-sessions-pile-up
---

## What is going on

Each test exports the same number of rows and starts a new ChromeDriver session, a connection that controls a browser. The export service takes 140 to 165 ms throughout the run. The CI runner is the machine that runs these tests automatically. A browser click hits its time limit late in the shard, the group of tests assigned to this runner.

After 24 tests have finished, 24 sessions are still active. The runner is using 6.8 GiB of memory.

## The answer

1. Finished tests leave browser sessions running, and those sessions compete for the runner's resources.

   **Why:** The runner uses more resources as more tests finish without closing their sessions. The timed-out command was a click in the browser. The export service responds in about the same time throughout the run. That gives little reason to suspect that report generation is slowing down.

2. If the test created a driver, call `driver.quit()` in JUnit's `@AfterEach` teardown, the cleanup step that runs after each test.

   **Why:** If an assertion fails, the test skips the rest of its checks. Teardown still gets a chance to release the session. Quitting ends the session and closes the extra preview tab and any other windows in that session.

3. Measure the buildup of browser sessions and the slowdown in the original run.

   Record browser processes that stay alive, active sessions, memory use and how long browser actions take. On the same runner, repeat the same reports with teardown as the only change. Check that the session count stays flat and the late slowdown disappears.

   **Why:** The first run shows which resources build up as tests finish. The comparison shows whether freeing those resources removes the slowdown under the same workload.

## Why the tempting answer fails

The decoy correctly names the leak: completed tests keep using resources. Closing only the current tab leaves another window open and the session active. If the test runs quickly on its own, the suite may contribute to the slowdown. That check can't tell you which resources were left open.

A 200 response from the report endpoint, the URL the test calls to export the report, says nothing about browser latency. A longer timeout may delay the failure while sessions keep piling up.

## What the interviewer listens for

Explain when each test should close its session. Show how the two runs tell you whether the browsers are competing for runner resources or the export service is slowing down.

## Sources

- [Selenium: quitting the browser](https://www.selenium.dev/documentation/webdriver/interactions/windows/#quitting-the-browser-at-the-end-of-a-session)
- [JUnit: `AfterEach`](https://docs.junit.org/current/api/org.junit.jupiter.api/org/junit/jupiter/api/AfterEach.html)
