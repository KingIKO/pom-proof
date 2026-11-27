---
title: When should a Playwright test use two browser contexts?
topic: playwright
roles: [automation, sdet]
level: mid
type: tooling
oneLine: I'd use two browser contexts when the test needs separate browser sessions that can still use the same server.
looksFor:
  - Explain why two tabs can share a sign-in and cart.
  - Open checkout for each customer in a separate browser context.
  - Set up shared stock and check what each customer sees after checkout.
trap: Opening a second tab and treating it as a separate customer session.
followUps:
  - question: How would you test two customers trying to book the last pickup slot?
    answer: I'd set up one slot and check that both customers see it. I'd send both requests without waiting for either checkout to finish first.
  - question: How would you check that the service booked the slot only once?
    answer: I'd check that one customer sees a confirmation and the other sees that the slot is unavailable. I'd use a reservation API I'm allowed to call to count confirmed reservations for that slot.
sources:
  - label: Playwright browser context isolation
    url: https://playwright.dev/docs/browser-contexts
  - label: Playwright creating extra contexts
    url: https://playwright.dev/docs/api/class-browser#browser-new-context
  - label: Playwright API setup and cleanup
    url: https://playwright.dev/docs/api-testing
  - label: Playwright polling assertions
    url: https://playwright.dev/docs/test-assertions#expectpoll
examples:
  - title: Race two guests for a test-owned pickup slot
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { expect, test, type BrowserContext } from '@playwright/test';

          const app = 'http://localhost:3000';

          test('only one guest can reserve the last slot', async ({ browser, request }) => {
            const created = await request.post(`${app}/api/test/pickup-slots`);
            expect(created.status()).toBe(201);
            const { id } = await created.json();
            const contexts: BrowserContext[] = [];
            try {
              contexts.push(await browser.newContext());
              contexts.push(await browser.newContext());
              const pages = await Promise.all(contexts.map((context) => context.newPage()));
              await Promise.all(pages.map((page) => page.goto(`${app}/pickup/${id}`)));
              const reserves = pages.map((page) => page.getByRole('button', { name: 'Reserve' }));
              await Promise.all(reserves.map((reserve) => expect(reserve).toBeEnabled()));
              await Promise.all(reserves.map((reserve) => reserve.click()));

              const results = pages.map((page) => page.getByTestId('reservation-outcome'));
              await expect.poll(async () => {
                const messages = await Promise.all(results.map((result) => result.textContent()));
                return messages.sort();
              }).toEqual(['Reservation confirmed', 'Slot unavailable']);

              const result = await request.get(`${app}/api/test/pickup-slots/${id}/reservations`);
              expect(result.ok()).toBe(true);
              expect(await result.json()).toHaveLength(1);
            } finally {
              await Promise.all(contexts.map((context) => context.close()));
              expect((await request.delete(`${app}/api/test/pickup-slots/${id}`)).ok()).toBe(true);
            }
          });
---

I'd use `browser.newContext()`, the Playwright method that starts a separate browser session, for each customer. I'd open checkout inside each context. Two pages in the same context can share cookies, which can hold a sign-in. They can also share origin storage, data the browser saves for the same site. If checkout supports guests, I could use two separate guests instead of two test accounts.

Both contexts still use the same server. I'd create a pickup slot just for this test. Before submitting, I'd make sure both customers see the slot as available. After submitting, I'd check both results.

### Example

For the last pickup slot at a store, I'd submit one checkout per context. I'd expect one confirmation and one message saying the slot is unavailable. I'd check that the server saved exactly one confirmed reservation for the slot.

I'd use the local test API to set up one slot per call and list confirmed reservations. I'd point both guest pages at the same slot. During cleanup, I'd use the API to remove that slot and its records.
