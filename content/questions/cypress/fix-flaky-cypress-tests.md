---
title: A saved-filter test fails when Cypress sees a replaced row. How would you fix it?
topic: cypress
roles: [automation, sdet]
level: senior
type: scenario
oneLine: Use first-attempt evidence to distinguish a changing DOM, slow state, shared data, or an actual feature bug.
looksFor:
  - Reproduces with first-failure evidence and test-owned data.
  - Requeries after actions that trigger a render.
  - Uses an alias or retrying assertion rather than a fixed delay.
  - Treats test retries as evidence for investigation.
trap: Setting a longer sleep or relying on retries for every detached-element failure.
followUps:
  - question: What if the assigned filter still disappears after the request succeeds?
    answer: I'd check whether the app rendered the wrong response or lost the saved state and report a product issue if I can observe it outside the test.
sources:
  - label: Cypress query retrying and detached elements
    url: https://docs.cypress.io/app/core-concepts/retry-ability
  - label: Cypress avoiding unnecessary waits
    url: https://docs.cypress.io/app/core-concepts/best-practices
  - label: Cypress test retries
    url: https://docs.cypress.io/app/guides/test-retries
  - label: Cypress request aliases
    url: https://docs.cypress.io/api/commands/intercept
examples:
  - title: Query the replacement filter row after refreshing
    variants:
      - lang: js
        label: Cypress (JavaScript)
        code: |
          it('shows the active filter after refreshing the list', () => {
            cy.intercept('GET', '/api/filters').as('filters');
            cy.visit('http://localhost:3000/filters/sample');
            cy.wait('@filters');
            cy.contains('button', 'Refresh filters').click();
            cy.wait('@filters').its('response.statusCode').should('eq', 200);
            cy.get('[data-testid="filter-active"]').should('have.text', 'Active customers');
          });
---

I'd keep the first failed attempt and see whether the action completed and which element Cypress was holding. After a re-render, I'd query again rather than carry a row reference across a click. I use a retrying assertion for changing text, and wait on a specific request alias when the response helps explain the result. A one-time check inside `then` won't keep reading as the page updates.

I'd rerun with data this test owns and check for collisions if it fails only alongside other tests. A passing whole-test retry tells me the result varies. It doesn't tell me why.

### Example

The local sample page starts with a seeded active filter. Refresh fetches the list again and replaces its rows. I wait for that response, then query the active row from the updated page.
