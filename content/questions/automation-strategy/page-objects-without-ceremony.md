---
title: When does a page object help, and when does it get in the way?
topic: automation-strategy
roles: [automation, sdet]
level: mid
type: concept
oneLine: Put repeated interactions behind clear names and keep each test's business claim easy to read.
looksFor:
  - A concrete interaction shared by multiple tests
  - A reason to prefer a small component object
  - Test-specific expectations visible in the spec
  - A sign that an abstraction should be removed
trap: Building a base class and wrapping every browser method before writing the first feature test.
followUps:
  - question: Can a page object contain an assertion?
    answer: I'd use a narrow readiness check inside a helper when its caller needs that guarantee. I keep business outcomes in the spec.
sources:
  - label: Playwright page object models
    url: https://playwright.dev/docs/pom
---

I'd extract a page object when multiple tests need the same interaction and a name like `applyCoupon` describes it better than a sequence of clicks. If the same coupon widget appears on two pages, I'd model that widget instead of duplicating it in two large classes.

A page object starts to hurt when reading the test means opening four more files or when one method does setup, interaction, and assertions for every caller. I want to see the expected price in the test. If there's one caller and the interaction already reads well, I'd keep it there until there's a reason to extract it.

### Example

On returns, I'd add a small return form object with `chooseReason` and `submit`. The test for an expired return would still assert that the screen explains the deadline. A valid return can reuse `submit` and check for a confirmation number.
