---
title: A banner blocks the booking click
kind: diagnosis
topic: selenium
difficulty: medium
minutes: 6
roles: [automation, sdet]
items:
  - id: cause
    type: single-choice
    prompt: Why does WebDriver reject the click?
    choices:
      - { id: stale, text: The booking form replaced the button after the test found it. }
      - { id: offscreen, text: The button is still outside the viewport after scrolling. }
      - { id: cover, text: The dismissed banner still covers the click point while its exit animation runs. }
      - { id: disabled, text: The button stays disabled until a price is available. }
  - id: fix
    type: single-choice
    prompt: Which fix still clicks the way a user would?
    choices:
      - { id: fixed, text: "Sleep for as long as the current animation lasts, then click the button." }
      - { id: retry, text: Retry the whole test without waiting for the banner to leave the page. }
      - { id: jquery, text: Use a JavaScript click to reach the booking button through the overlay. }
      - { id: wait, text: "Wait for banner removal, then find and click the button with WebDriver." }
  - id: evidence
    type: multi-select
    prompt: Which observations would confirm that the banner intercepts the click?
    choices:
      - { id: enabled, text: The booking button is already enabled before the test clicks it. }
      - { id: hit, text: A hit test at the reported click point returns the banner just before the failure. }
      - { id: no-requests, text: The browser log from the failed run contains no booking POST request. }
      - { id: after, text: "With only the wait for banner removal added, a normal click reaches the button when the animation ends." }
reference:
  cause: cover
  fix: wait
  evidence: [hit, after]
decoy:
  cause: cover
  fix: fixed
  evidence: [hit, enabled]
---

The viewport is the visible area of the browser window. On a narrow viewport, a welcome banner sits above the booking button. Dismissing the banner starts an exit animation. When the animation finishes, the app removes `#welcome-banner`. The booking button is already displayed and enabled.

WebDriver is the interface that Selenium uses to control the browser. A hit test asks the browser which element sits at a given point on the page.

```java
driver.findElement(By.id("dismiss-welcome")).click();
WebElement reserve = wait.until(
    ExpectedConditions.elementToBeClickable(By.id("reserve-slot")));
reserve.click();
assertEquals("Booking confirmed",
    driver.findElement(By.id("booking-status")).getText());
```

```text
  0 ms  dismiss-welcome click
 32 ms  reserve-slot displayed=true enabled=true
 51 ms  ElementClickInterceptedException at (280, 724)
        Other element would receive the click: <div id="welcome-banner">
293 ms  animationend: welcome-banner removed
```
