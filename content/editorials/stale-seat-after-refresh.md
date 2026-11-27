---
problem: diagnosis/stale-seat-after-refresh
---

## What is going on

The test must reserve B12 from the refreshed map. The wait for version 43 passes. The response still lists B12 as available. The test sends the click to element reference `9f7a`, the handle it saved for the button in version 42.

## The answer

1. The saved `WebElement`, Selenium's handle for a specific element, points to the button that refresh removed.

   **Why:** The log shows that refresh replaces the elements inside the map. The new B12 button can have the same `data-seat` attribute value without being the same element. Selenium reports a stale element reference because the old element is no longer on the page.

2. Once version 43 loads, use the saved `By` locator, the rule for finding B12, to find the button in the refreshed map.

   Click the button using the fresh reference. If the app can replace the map again, find the seat in the appropriate loaded map and check that it is still B12.

   **Why:** The stable ID tells Selenium which seat to find. Each lookup gets a reference to the element the map contains at that moment. Retrying the original click cannot restore the old button.

3. Confirm that a fresh lookup in version 43 returns a different reference and that clicking it works.

   Capture the DOM, the browser's tree of page elements. It should show the old element detached and a new one under the same seat ID.

   **Why:** A successful click confirms that the refreshed map still offers B12. The DOM shows exactly what changed between lookups even though the seat ID stayed the same.

## Why the tempting answer fails

The decoy correctly names the stale reference and asks to capture the DOM. Waiting before clicking the saved element leaves the reference stale. Finding B12 in both responses shows only that the seat ID still exists. It does not show whether the browser kept the same element for the seat.

## What the interviewer listens for

Explain why the locator still finds the right seat after refresh. Show why the old reference to that seat can no longer be used.

## Sources

- [Selenium: stale element references](https://www.selenium.dev/documentation/webdriver/troubleshooting/errors/#staleelementreferenceexception)
