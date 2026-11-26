---
title: What does Selenium Grid 4 do, and when is it worth running?
topic: selenium
roles: [automation, sdet, senior]
level: mid
type: tooling
oneLine: Grid routes remote browser sessions to compatible slots; the test runner still decides how much work to send.
looksFor:
  - A remote WebDriver session and requested browser capabilities
  - Distinction between Grid scheduling and test-runner concurrency
  - A real cross-browser or capacity need
  - Queue time, infrastructure ownership, and diagnosis
trap: Installing a larger Grid to fix a suite that holds one shared account and cannot run concurrently.
followUps:
  - question: What would you check if new sessions queue for minutes?
    answer: I'd check for matching browser slots, current session usage, unusual session duration, and whether the test runner is sending more work than Grid can serve.
sources:
  - label: Selenium Grid overview
    url: https://www.selenium.dev/documentation/grid/
  - label: Selenium Grid components
    url: https://www.selenium.dev/documentation/grid/components/
---

I'd use Grid when I need remote browser sessions for a real support matrix or more capacity than a single machine can provide. A test asks for a browser through remote WebDriver. Grid 4 manages new session requests and selects a compatible slot on a node. My runner still decides which tests start together and how many sessions to request.

I'd start with the smallest deployment that meets the need and measure queue time and run time separately. If tests share state or are mostly waiting on a slow service, more Grid slots won't fix the cause. Someone also has to own browser images, capacity, and logs.

### Example

For a Java suite I'd send one tested browser configuration per supported environment to Grid, then compare session startup and completion times across those configurations before expanding the matrix.
