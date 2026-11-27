---
title: After you turn off the new invoice screen, can customers export an invoice they created with it?
topic: system-design
roles: [sdet, senior]
level: senior
type: concept
oneLine: I'd create an invoice on the new screen and switch back without redeploying. I'd check that the old screen can still open and export it.
looksFor:
  - Check that changes made with the flag on are still there when it's off.
  - Set the invoice and PDF switches separately for each test.
  - Try the combinations that affect the invoice and measure recovery on the deployed build.
  - Say when you can remove the old code path and the tests for switching back.
trap: Checking only the new screen because customers have already used the old one.
followUps:
  - question: The PDF test and the test for switching back share an account. How would you separate their setup?
    answer: In deployed tests, I'd set the flags separately for each test account. In component tests, I'd give each test setup its own flag values. I'd turn off the new screen without changing what the PDF test sees.
sources:
  - label: OpenFeature targeting and evaluation context
    url: https://openfeature.dev/specification/sections/evaluation-context/
  - label: Unleash flag lifecycle and cleanup
    url: https://docs.getunleash.io/concepts/feature-flags
---

I'd save an invoice on the new screen. I'd turn off its feature flag, a switch that controls what customers see without deploying again. I'd reopen the invoice on the same build. Switching back only helps if the old screen can read the data. I'd check that customers get the old screen back within the agreed recovery time.

The PDF flag affects the same flow, so I'd test the combinations of those two flags. I'd leave unrelated flags alone. I'd set both values through a fixture, the test's setup, or set them for individual accounts. When the release owner retires the old screen, I'd remove the temporary flag and the tests for switching back.

### Example

The two screens share a PDF export flag. I'd test all four combinations of the screen flag and the export flag. With export on, I'd turn off the new screen for a test account. I'd check that the account can still open and export the invoice it created on the new screen.
