---
title: A seat button click fails after the map refreshes
kind: diagnosis
topic: selenium
difficulty: medium
minutes: 6
roles: [automation, sdet]
items:
  - id: cause
    type: single-choice
    prompt: What makes the click fail?
    choices:
      - { id: sold, text: The refreshed seat data marks seat B12 as sold. }
      - { id: blocked, text: A loading overlay catches the click meant for the new seat. }
      - { id: detached, text: "The saved `WebElement` points to a node that the refresh removed." }
      - { id: session, text: The click is sent to an expired WebDriver session. }
  - id: fix
    type: single-choice
    prompt: Which fix clicks the right seat after the refresh?
    choices:
      - { id: reacquire, text: "Once the new map version loads, find B12 again by its stable ID and click it." }
      - { id: sleep, text: "Sleep after the refresh, then click the saved `WebElement`." }
      - { id: retry-handle, text: "If the stale element exception is thrown, retry the click on the saved `WebElement`." }
      - { id: before, text: "Click B12 before the refresh, then use the refreshed map to check the result." }
  - id: evidence
    type: multi-select
    prompt: Which observations would confirm the diagnosis?
    choices:
      - { id: stable-id, text: "When the test finds B12 in version 43, it gets a new element reference. The click works." }
      - { id: ids, text: "The API responses cover the map before and after refresh. Both responses list the same stable seat ID." }
      - { id: detached-node, text: "A snapshot of the DOM shows the old element detached. Its replacement has the same seat ID." }
      - { id: running, text: "The driver receives a request for the current window handle, its ID for the window. It accepts the request." }
reference:
  cause: detached
  fix: reacquire
  evidence: [stable-id, detached-node]
decoy:
  cause: detached
  fix: sleep
  evidence: [ids, detached-node]
---

The refresh button asks the server which seats are available. The seat map shows its loaded version in the `data-version` attribute, a field on the page. The test must reserve B12 from the refreshed map. No other test uses this screening.

The DOM is the browser's tree of page elements. A `WebElement` is Selenium's saved reference to one node, or element, in that tree. Selenium calls a reference stale when its node is no longer in the page. WebDriver sends commands between the test and the browser. The API is the interface the page uses to request seat data.

```java
By seat = By.cssSelector("[data-seat='B12']");
WebElement b12 = driver.findElement(seat);
driver.findElement(By.id("refresh-seats")).click();
wait.until(ExpectedConditions.attributeToBe(
    By.id("seat-map"), "data-version", "43"));
b12.click();
assertEquals("B12", driver.findElement(By.id("selected-seat")).getText());
```

```text
seat-map version 42: B12 available
GET /api/seats response: version=43, B12 available
DOM update: replaced seat-map children
seat-map version 43 observed
org.openqa.selenium.StaleElementReferenceException: stale element reference
  at SeatPickerTest.reserveFromRefreshedMap(SeatPickerTest.java:37)
  command: clickElement on reference 9f7a
```
