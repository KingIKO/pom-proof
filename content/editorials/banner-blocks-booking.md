---
problem: diagnosis/banner-blocks-booking
---

## What is going on

On the narrow layout, dismissing the welcome banner starts its exit animation. The booking button is already visible and enabled. That's all Selenium's Java condition `elementToBeClickable` checks. When WebDriver sends a browser click, the button's center within the visible page also has to be clear.

## The answer

1. The dismissed banner still covers the booking button's click point during its exit animation.

   **Why:** The error at 51 ms names the banner as the element covering `(280, 724)`. The app removes the banner at 293 ms. Until then, the banner can catch a click even though the button is visible and enabled.

2. After dismissal, wait for the banner to leave the DOM, the browser's tree of page elements.

   Wait on the selector `#welcome-banner`. Once the banner is gone, find the booking button and click it with WebDriver. If another version hides the banner instead, wait for it to be hidden and check that it no longer catches pointer input.

   **Why:** In this app, removal means the banner can no longer cover the button. A JavaScript click can bypass a banner that still blocks a customer.

3. Check that a hit test returns the banner just before failure. Add only the removal wait and check that a normal click reaches the button when the animation ends.

   **Why:** A hit test at the reported coordinates shows which element would receive the click. Changing only the wait shows whether removing that element solves the problem.

## Why the tempting answer fails

The decoy correctly names the banner and uses the hit test. A fixed wait based on today's animation may fail if its timing changes. Checking that the button is enabled tells you nothing about what's covering the click point. A missing booking POST, the request that submits the booking, could have several causes.

## What the interviewer listens for

Explain what the visibility and enabled checks prove. Name the evidence that shows where a real pointer click lands.

## Sources

- [Selenium: intercepted clicks](https://www.selenium.dev/documentation/webdriver/troubleshooting/errors/#elementclickinterceptedexception)
- [Selenium: Java wait conditions](https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/support/ui/ExpectedConditions.html)
