---
title: When should a Playwright test use two browser contexts?
topic: playwright
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Use separate browser contexts when the test needs two independent sessions that can still interact with the same backend.
looksFor:
  - Explain why two tabs can share login and cart state.
  - Create each customer in a separate browser context.
  - Seed shared inventory and assert what each customer sees after checkout.
trap: Opening a second tab and assuming it represents a second customer.
followUps:
  - question: How would you make both customers compete for the same last pickup slot?
    answer: Seed one slot, check that both sessions see it, and coordinate the two submit requests so neither waits for the other checkout to finish.
  - question: How do you check that only one reservation was created?
    answer: Check that one customer receives a confirmation and the other sees an unavailable message, then use a permitted reservation API to count confirmed records for the seeded slot.
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

I'd use `browser.newContext()` for each customer and open the checkout page inside each context. Two pages in the same context can share cookies and origin storage, so I wouldn't use a second tab to stand in for a second login. I would give each context a different test account or start each as a separate guest, depending on what the checkout supports.

The contexts still talk to the same server. I'd seed a slot that this test owns, make sure each customer sees it as available, and check both outcomes after submitting.

### Example

For the last pickup slot at a store, I would submit one checkout per context and expect one confirmation and one unavailable message. Then I'd check that the server recorded exactly one confirmed reservation for the slot.

The local test API provisions one slot per call, lists its confirmed reservations, and removes it with its records at cleanup. Both guest pages target that same slot.
