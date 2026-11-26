---
problem: diagnosis/banner-blocks-booking
---

The button is displayed and enabled, which satisfies Selenium's Java `elementToBeClickable` condition. The actual click can still fail. WebDriver attempts it at the element's in-view center, where the welcome banner is still above the button. The error names the banner, and the trace records its removal after the failed click.

After dismissing the banner, use an explicit wait for the condition the app exposes: the banner node is gone. Then find the button and use a standard WebDriver click. If a different version hides the banner instead of removing it, wait for the appropriate hidden state and confirm it no longer intercepts pointer input.

A sleep based on today's animation can turn green until timing changes. A JavaScript click can bypass the overlay, leaving the test green even if a customer still cannot click the button.

In an interview, explain the difference between displayed, enabled and able to receive the click. A hit test and a passing standard click after removal show which difference matters. The missing booking request alone could have several causes.

[Selenium: intercepted clicks](https://www.selenium.dev/documentation/webdriver/troubleshooting/errors/#elementclickinterceptedexception) · [Selenium: Java wait conditions](https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/support/ui/ExpectedConditions.html)
