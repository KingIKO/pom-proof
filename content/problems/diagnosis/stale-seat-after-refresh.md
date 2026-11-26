---
title: A seat button goes stale after refresh
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
      - { id: sold, text: The refreshed result marks seat B12 as sold. }
      - { id: blocked, text: A loading overlay intercepts the click on the new seat. }
      - { id: detached, text: The saved WebElement points to a node removed during refresh. }
      - { id: session, text: The click is sent to an expired WebDriver session. }
  - id: fix
    type: single-choice
    prompt: Which fix targets the right seat after refresh?
    choices:
      - { id: reacquire, text: "Wait for the new seat map version, then find B12 again by its stable ID and click it." }
      - { id: sleep, text: Sleep after refreshing and click the saved WebElement. }
      - { id: retry-handle, text: Retry click on the saved WebElement if the stale exception is thrown. }
      - { id: before, text: "Click B12 before refreshing, then use the refreshed map to check the result." }
  - id: evidence
    type: multi-select
    prompt: Which observations would confirm the diagnosis?
    choices:
      - { id: stable-id, text: A fresh lookup of B12 in version 43 returns a different element reference that clicks successfully. }
      - { id: ids, text: The stable seat ID is listed in both API responses. }
      - { id: detached-node, text: A DOM capture shows the old node disconnected and a new node under the same seat ID. }
      - { id: running, text: The driver accepts a request for the current window handle. }
reference:
  cause: detached
  fix: reacquire
  evidence: [stable-id, detached-node]
decoy:
  cause: detached
  fix: sleep
  evidence: [ids, detached-node]
---

The refresh button fetches current seat availability. The map exposes the loaded version in `data-version`; the test is meant to reserve B12 from the refreshed map. No other test uses this screening.

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
