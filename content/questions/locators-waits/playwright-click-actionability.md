---
title: Why can a visible Playwright button still time out on click?
topic: locators-waits
roles: [automation, sdet]
level: junior
type: tooling
oneLine: A visible button may still be moving, disabled, or covered, so inspect the check that kept the click from happening.
looksFor:
  - A single matching element
  - Visibility, stability, enabled state, and receiving events
  - A reason a real user would also be blocked
  - A useful alternative to a sleep or forced click
trap: Forcing the click before finding out whether a loading overlay blocks users too.
followUps:
  - question: Is a successful click proof that the form saved?
    answer: No. I would check a user-facing confirmation or the resulting saved state after the click.
sources:
  - label: Playwright actionability
    url: https://playwright.dev/docs/actionability
---

For `locator.click()`, Playwright waits for a single match that is visible, stable, enabled, and able to receive events at the click point. A button can be painted on the screen but sit behind a spinner that intercepts the click. Other actions have their own set of checks, so I'd look at the call log for the actual action that timed out.

I find what the user is waiting for and decide whether it should have happened. If the overlay is stuck because a request failed, I want the failure to point there. Forcing the click can bypass checks that were telling me about the bug.

### Example

On a shipping form, I'd inspect the pending rate lookup and look for the chosen delivery option. Once a normal click works, I'd still assert the updated order summary before calling the test a pass.
