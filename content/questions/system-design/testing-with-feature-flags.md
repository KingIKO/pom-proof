---
title: You turned off the new invoice screen. Can customers still export an invoice created while it was on?
topic: system-design
roles: [sdet, senior]
level: senior
type: concept
oneLine: Create an invoice on the new path, switch back without redeploying, and prove the old path still handles it.
looksFor:
  - Tests whether changes made while the flag was on survive turning it off.
  - Sets the invoice and PDF flag states independently for each test.
  - Covers meaningful flag interactions and measures recovery on the deployed build.
  - Names when the old branch and its temporary checks can be removed.
trap: Testing only the enabled path because the old screen has already shipped.
followUps:
  - question: The PDF check and the fallback check both use the same test account. Which fixture would you change?
    answer: I'd give each check its own targeted account in deployed tests, or inject separate flag values into component fixtures. The fallback check can turn off the new screen without changing what the PDF check sees.
sources:
  - label: OpenFeature targeting and evaluation context
    url: https://openfeature.dev/specification/sections/evaluation-context/
  - label: Unleash flag lifecycle and cleanup
    url: https://docs.getunleash.io/concepts/feature-flags
---

I'd save an invoice using the new screen, turn the flag off on the same deployed build, and
reopen it. A flag can separate deploying code from showing it to customers, but a fallback
only helps if the old screen can use the data. I'd check that it returns within the agreed
recovery window.

The PDF flag affects that same flow, so I'd cover its combinations with the new screen and
skip unrelated flags. I'd set states explicitly through a fixture or account targeting. When
the release owner retires the old screen, I'd remove the temporary flag and the tests specific
to the switch.

### Example

The new invoice screen shares a PDF export flag with the old screen. I'd test all four
combinations for that pair. With export enabled, I'd turn off the new screen for a test account
and confirm that it can still open and export the invoice it created on the new screen.
