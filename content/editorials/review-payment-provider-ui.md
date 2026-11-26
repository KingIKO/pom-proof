---
problem: diagnosis/review-payment-provider-ui
---

Mark lines 9 through 11. The wait on line 9 guesses how long a vendor form takes to appear. Lines 10 and 11 introduce dependencies on a provider form name and a field label. The test's promise is to verify the handoff. Line 8 already proves the merchant took the customer to the expected session URL on a controlled response.

End the test at the URL assertion. If the merchant needs to test its own behavior after payment, use a controlled callback or return response and check the merchant page separately. If a real integration check is needed, use the provider's sandbox and assert the agreed integration behavior rather than treating its form labels as a merchant requirement.

The tempting fix is to remove only the sleep and wait for the vendor field with a locator. Here the stub intentionally omits that field. A better wait still targets content outside the test's scope.

In an interview, describe which part of checkout the team owns and what the existing URL assertion proves.

[Playwright: third-party dependencies](https://playwright.dev/docs/best-practices#avoid-testing-third-party-dependencies)
