---
title: A banner catches the booking click
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
      - { id: stale, text: The booking form replaced the button after the lookup. }
      - { id: offscreen, text: The button is still outside the viewport after scrolling. }
      - { id: cover, text: The dismissed banner still covers the click point during its exit animation. }
      - { id: disabled, text: The button is disabled until a price is available. }
  - id: fix
    type: single-choice
    prompt: Which fix preserves a user-style click?
    choices:
      - { id: fixed, text: Sleep for the current animation duration before clicking. }
      - { id: retry, text: Retry the whole test without waiting for the banner to leave. }
      - { id: jquery, text: Use a JavaScript click on the booking button through the overlay. }
      - { id: wait, text: "Wait until the banner is removed, then locate the booking button and use WebDriver click." }
  - id: evidence
    type: multi-select
    prompt: Which observations would confirm interception by the banner?
    choices:
      - { id: enabled, text: The booking button is enabled before the click. }
      - { id: hit, text: A hit test at the reported click point returns the banner just before failure. }
      - { id: no-requests, text: There is no booking POST in the failed browser log. }
      - { id: after, text: "With just the wait for banner removal added, a normal click reaches the button as the animation ends." }
reference:
  cause: cover
  fix: wait
  evidence: [hit, after]
decoy:
  cause: cover
  fix: fixed
  evidence: [hit, enabled]
---

On a narrow viewport, a welcome banner sits above the booking action. Dismissing it starts an exit animation; the app removes `#welcome-banner` when the animation finishes. The button is already displayed and enabled.

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
