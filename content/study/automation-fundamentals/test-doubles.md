---
title: Test doubles
module: automation-fundamentals
order: 8
level: core
summary: A test double stands in for something the code depends on. It lets you control what that dependency does during a test.
minutes: 3
prerequisites: [testing-foundations/test-levels-and-types]
outcomes:
  - Tell a dummy, stub, spy, mock and fake apart by what each one does.
  - Choose when to keep a real dependency and when to use a stand-in.
useWhen:
  - You need a response that would be slow or unreliable to get from the real service.
avoidWhen:
  - The goal is to see whether two actual systems work together.
practiceTopics: [test-isolation]
questionTopics: [framework-design, api]
examples:
  - title: Show a message when the shipping service is down
    variants:
      - lang: ts
        label: Playwright Test
        code: |
          import { expect, test } from '@playwright/test';

          test('checkout shows an unavailable shipping quote', async ({ page }) => {
            await page.route('https://shipping.example/quote', route => route.fulfill({
              status: 503,
              headers: { 'access-control-allow-origin': '*' },
            }));
            await page.setContent(`
              <p role="status">Loading quote</p>
              <script>
                fetch('https://shipping.example/quote').then(response => {
                  document.querySelector('[role="status"]').textContent =
                    response.ok ? 'Quote ready' : 'Shipping quote unavailable';
                });
              </script>
            `);
            await expect(page.getByRole('status')).toHaveText('Shipping quote unavailable');
          });
sources:
  - { label: "Playwright: Mock APIs", url: "https://playwright.dev/docs/mock", type: primary }
  - { label: "Playwright: Best practices", url: "https://playwright.dev/docs/best-practices", type: primary }
  - { label: "Martin Fowler: Test Double", url: "https://martinfowler.com/bliki/TestDouble.html", type: practitioner }
  - { label: "Martin Fowler: Mocks Aren't Stubs", url: "https://martinfowler.com/articles/mocksArentStubs.html", type: practitioner }
  - { label: "Google Testing Blog: Don't overuse mocks", url: "https://testing.googleblog.com/2013/05/testing-on-toilet-dont-overuse-mocks.html", type: practitioner }
  - { label: "Software Engineering at Google: Test doubles", url: "https://abseil.io/resources/swe-book/html/ch13.html", type: practitioner }
expertsDisagree:
  - question: Should a test use real dependencies or mocks?
    note: Decide what the test has to prove and what it can afford to run.
    positions:
      - view: Google prefers realism over isolation. Fowler's classical school also uses real dependencies when practical and often checks the resulting state.
        holdsWhen: The real dependency is fast and reliable enough, and seeing it run makes the result more useful.
        source:
          - https://abseil.io/resources/swe-book/html/ch13.html
          - https://martinfowler.com/articles/mocksArentStubs.html
      - view: Fowler's mockist school uses mocks for dependencies with meaningful behaviour and checks which calls they receive.
        holdsWhen: The call to another component is part of the behaviour you need to verify, or you need to isolate the unit.
        source: https://martinfowler.com/articles/mocksArentStubs.html
---
## What it is

A dependency is something the code uses to do its work, such as a rate service that supplies shipping prices. A test double replaces that dependency during a test. People often call all replacements mocks. In the stricter naming below, a mock checks that specific calls happen.

## How it works

Pass the replacement where the code would normally get the real dependency. Gerard Meszaros names five types. Pick the type based on what the test needs.

- A dummy fills a required argument that this test never uses.
- A stub returns a prepared answer, such as a shipping price of five dollars.
- A spy stores calls so the test can inspect them afterwards.
- A mock gets expectations up front, such as which postcode the code must send.
- A fake works like the real thing in a simpler way. An example is a rate store kept in memory.

You can also replace a network response. In Playwright, register the route before the browser sends the request. The browser gets the reply you supply instead of hitting the real service. Playwright calls this network mocking. If all the route does is return a fixed reply, it serves as a stub.

## Why it helps

Playwright advises keeping browser checks focused on the parts of the app you control. A stand-in for a third-party service lets you decide when that service appears to fail. The example uses `page.route` to return a `503` response, which means the service is unavailable. The check shows what the customer sees when checkout cannot get a shipping quote.

## When not to use it

Keep a test with the real service if you need to know whether your app and the service can talk to each other. A stub can keep returning an old response after the provider has changed its format. Too many mocks also make tests harder to read and maintain. A test can break when the calls change even though the customer still gets the right result.
