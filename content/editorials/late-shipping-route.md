---
problem: diagnosis/late-shipping-route
---

## What is going on

The checkout test expects `Evening delivery` from a stub, a fixed shipping quote supplied by the test. The Playwright trace records when each event happened. The Toronto click sent a request at `10:34:01.119`. The server replied with `Standard delivery` at `.138`. The test set up its route, a rule for catching a matching request, at `.144`.

## The answer

1. The test sets up the route after the quote request it needs to catch.

   **Why:** The browser already had the server's reply by the time the test set up the route. That reply explains the option on screen. A slow page is unnecessary to explain it. So is a wrong accessible name, the label assistive tools read.

2. Set up the route with the fixed quote before selecting Toronto.

   After selecting Toronto, check that the page shows the `Evening delivery` radio option, a control for choosing one value.

   **Why:** The route is then ready to answer the request that the click sends. Checking the radio option shows that the customer gets the choice from the test's quote.

   ```ts
   await page.route('**/api/shipping/quote?city=toronto', (route) =>
     route.fulfill({ json: { options: [{ label: 'Evening delivery' }] } }),
   );
   await page.getByRole('button', { name: 'Toronto', exact: true }).click();
   await expect(page.getByRole('radio', { name: 'Evening delivery' })).toBeVisible();
   ```

   If the corrected test still fails, compare the recorded URL with the route pattern. JSON is the text format that carries the reply's data. Check that the JSON has the fields and format the shipping panel expects.

## Why the tempting answer fails

The decoy treats the failure as a slow check for the radio option. It still clicks Toronto before setting up the stub. Waiting longer cannot change a response the browser already received. The radio option check is useful once the route is in place before the click. As written, the decoy checks for a label that never arrived.

## What the interviewer listens for

Point to the route setup in the trace. Explain why it must happen before the click that sends the request.

## Sources

- [Playwright: mock API requests](https://playwright.dev/docs/mock)
