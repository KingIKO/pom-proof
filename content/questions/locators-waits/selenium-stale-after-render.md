---
title: What causes a stale element reference in Selenium, and how would you handle it?
topic: locators-waits
roles: [automation, sdet]
level: mid
type: scenario
oneLine: I find out what replaced the element and wait for the new state. Then I locate the current element again.
looksFor:
  - Tell an element reference apart from the locator used to find it.
  - Explain DOM replacement or navigation as the cause.
  - Look up the element again after the correct state change.
  - Take care before repeating an action that writes data.
trap: Catching every stale-element error and replaying the last click no matter what it did.
followUps:
  - question: What would you do if the first action might already have submitted the order?
    answer: I'd inspect the confirmation and the order state before I consider another submit. The first attempt might already have taken effect.
sources:
  - label: Selenium troubleshooting errors
    url: https://www.selenium.dev/documentation/webdriver/troubleshooting/errors/
  - label: Selenium waits
    url: https://www.selenium.dev/documentation/webdriver/waits/
---

A Selenium `WebElement` refers to one particular element in the DOM, the browser's tree of page elements. If the app replaces that element or navigates to a new document, Selenium can't use the old reference. That's a stale element reference, even if the page looks unchanged. Before I decide whether to wait or fix the selector, I look for what changed around the failure.

If the app refreshes a table, I'd wait for the refreshed result. Then I'd locate the row again by its business identifier, the value people use to name that record. If I switched to a different frame, I check the browsing context before I look for the element. The browsing context is the document Selenium is currently searching. Before I replay any write action, I also check its result.

### Example

A booking test saved a row element and changed the date filter. Then it clicked the saved row. I'd wait for the booking for the new date to appear. Then I'd find that booking by its reservation number. That also keeps the test from editing the wrong booking after a sort.
