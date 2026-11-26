---
title: What causes a stale element reference and how do you handle it?
topic: locators-waits
roles: [automation, sdet]
level: mid
type: scenario
oneLine: Find out what replaced the element, wait for the new state, and locate the current element again.
looksFor:
  - Difference between an element reference and its locator
  - An explanation of DOM replacement or navigation
  - A fresh lookup after the correct state change
  - Care around repeating a write action
trap: Catching every stale-element error and replaying the last click regardless of what it did.
followUps:
  - question: What if the original action might have submitted an order?
    answer: I'd inspect the confirmation and order state before considering another submit, because the first attempt might already have taken effect.
sources:
  - label: Selenium troubleshooting errors
    url: https://www.selenium.dev/documentation/webdriver/troubleshooting/errors/
  - label: Selenium waits
    url: https://www.selenium.dev/documentation/webdriver/waits/
---

A Selenium `WebElement` refers to a particular element. If the app replaces that node or navigates to a new document, the old reference can no longer point to a usable element, even when the page looks unchanged. I look for what changed around the failure before deciding whether to wait or to fix the selector.

If the app refreshes a table, I'd synchronize with the refreshed result and locate the row again by its business identifier. If I switched to a different frame, I check the browsing context before looking for the element. I also check the result of any write action before replaying it.

### Example

A booking test saved a row element, changed the date filter, then clicked the saved row. I'd wait for the new date's booking to appear and find it by reservation number. That also keeps the test from editing the wrong booking after a sort.
