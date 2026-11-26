---
title: How do you manage browser drivers for Selenium in local and CI runs?
topic: selenium
roles: [automation, sdet]
level: junior
type: tooling
oneLine: Use Selenium Manager where automatic resolution fits, and make browser and driver versions reproducible in CI.
looksFor:
  - Selenium Manager as the built-in fallback when no driver is supplied
  - Awareness of browser and driver compatibility
  - A plan for restricted CI networks
  - Startup evidence that distinguishes driver issues from test failures
trap: Keeping an untracked driver binary on each laptop and having no record of what version the CI job used.
followUps:
  - question: What if CI cannot reach driver download sites?
    answer: I'd use an approved image or cache with the matching browser and driver, and verify session startup in that environment.
sources:
  - label: Selenium Manager
    url: https://www.selenium.dev/documentation/selenium_manager/
---

I'd let Selenium Manager resolve the driver on an ordinary development machine when the binding has no driver supplied. It can discover a compatible driver and download and cache it when needed. I'd check what the job actually ran rather than assume an automatic setup means every machine got the same pair.

On CI I prefer a repeatable browser and driver combination. In a restricted environment I can use an approved image with a matched pair instead of depending on a download at job startup. I record versions when the session starts, so someone looking at a failed job knows whether it even reached the application.

### Example

If a Chrome session refuses to start after an image update, I'd compare the browser and driver versions with the last good job and try opening a session before rerunning the whole suite.
