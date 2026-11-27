---
problem: diagnosis/late-shipping-route
---

## What is going on

The checkout test wants to see `Evening delivery` from a shipping stub. The trace shows that the Toronto click sent a request at `10:34:01.119`. The server replied with `Standard delivery` at `.138`, before the test registered its route at `.144`.

## The answer

1. Diagnose route registration after the quote request as the cause of the failure.

   **Why:** The real response had already completed when the interceptor was installed. The UI had received real data, and that data explains the option on screen without needing a slow render or a broken accessible name.

2. Register the route with a fixed quote first, select Toronto second, and assert that the displayed radio option is `Evening delivery` third.

   **Why:** Installing the route before the click lets the handler fulfill that request with the test data. The final assertion then checks that the customer-facing control reflects the data the test supplied.

   ```ts
   await page.route('**/api/shipping/quote?city=toronto', (route) =>
     route.fulfill({ json: { options: [{ label: 'Evening delivery' }] } }),
   );
   await page.getByRole('button', { name: 'Toronto', exact: true }).click();
   await expect(page.getByRole('radio', { name: 'Evening delivery' })).toBeVisible();
   ```

   If the corrected test still fails, compare the recorded URL with the route pattern, then check the returned JSON against the shipping panel's response contract.

## Why the tempting answer fails

The decoy blames assertion speed and still clicks Toronto before registering the stub. Increasing the timeout cannot change a response the browser already received. The decoy's final radio assertion is useful in the corrected order; with late interception, it expects a label that was never sent.

## What the interviewer listens for

Point out where the route registration sits in the trace and explain why it must precede the action that sends the request.

## Sources

- [Playwright: mock API requests](https://playwright.dev/docs/mock)
