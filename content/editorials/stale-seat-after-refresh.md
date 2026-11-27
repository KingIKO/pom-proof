---
problem: diagnosis/stale-seat-after-refresh
---

## What is going on

The test must reserve B12 from the refreshed map. The version 43 wait succeeds, and the response still lists B12 as available. The click is sent on reference `9f7a`, which the test saved from version 42.

## The answer

1. Identify the saved `WebElement` as a reference to a node removed during refresh.

   **Why:** Refresh replaces the map children. The new B12 can have the same `data-seat` value while the saved reference still identifies the disconnected node. Using that reference causes Selenium to report it as stale.

2. Keep the `By` for B12. Wait for version 43, then find the seat in that refreshed map and click the fresh element. If the map can be replaced again, look up the seat again in the appropriate loaded map and recheck its identity.

   **Why:** The stable ID describes which seat to find, and each lookup obtains a reference to the node present at that point. Retrying the click on the original reference cannot restore its node.

3. Confirm a fresh lookup in version 43 returns a different reference and clicks successfully. Capture the old node disconnected and the new node under the same seat ID.

   **Why:** The new click establishes B12 is actionable after refresh; the DOM evidence shows exactly what changed between lookups.

## Why the tempting answer fails

The decoy names the stale reference and correctly asks for a DOM capture. Sleeping before clicking the saved element leaves the same reference stale. Finding B12 in both responses only shows the business ID survived. It cannot show that the browser kept the same node.

## What the interviewer listens for

Explain why a locator can find the right seat after refresh even though a saved element for that same seat can no longer be used.

## Sources

- [Selenium: stale element references](https://www.selenium.dev/documentation/webdriver/troubleshooting/errors/#staleelementreferenceexception)
