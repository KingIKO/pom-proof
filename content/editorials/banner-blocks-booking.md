---
problem: diagnosis/banner-blocks-booking
---

## What is going on

On the narrow layout, dismissing the banner starts its exit animation. The booking button is already displayed and enabled, which satisfies Selenium's Java `elementToBeClickable` condition. The actual WebDriver click still has to reach the button's in-view center.

## The answer

1. Identify the exiting banner as the element intercepting the booking click.

   **Why:** The 51 ms error names the banner at `(280, 724)`, and the banner is removed at 293 ms. The button can be ready in its own right while another element still receives pointer input there.

2. After dismissal, wait explicitly for `#welcome-banner` to leave the DOM. Then find the booking button and click it with WebDriver.

   **Why:** Removal marks the end of the overlay in this app. If a different version hides the banner instead, wait for that hidden state and verify it no longer intercepts pointer input. A JavaScript click can go through an overlay that still blocks a customer.

3. Hit-test the reported coordinates just before failure and confirm they return the banner. Then add only the removal wait and check that a normal click reaches the button as the animation ends.

   **Why:** The hit test identifies the receiver. Changing only the wait tests whether removing that receiver resolves the failure.

## Why the tempting answer fails

The decoy gets the cause and the hit test right. A sleep based on today's animation can fail whenever its timing changes. An enabled button can still be covered, so checking whether it is enabled adds no evidence about the click point. A missing booking POST alone could have several causes.

## What the interviewer listens for

Explain what being displayed and enabled proves, then name the separate evidence that shows where a real pointer click lands.

## Sources

- [Selenium: intercepted clicks](https://www.selenium.dev/documentation/webdriver/troubleshooting/errors/#elementclickinterceptedexception)
- [Selenium: Java wait conditions](https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/support/ui/ExpectedConditions.html)
