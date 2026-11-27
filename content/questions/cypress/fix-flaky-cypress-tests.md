---
title: "Cypress loses a saved-filter row when the app replaces it. How would you fix the test?"
topic: cypress
roles: [automation, sdet]
level: senior
type: scenario
oneLine: "I start with the first failure. I check for a replaced element, a slow update, shared data, or a feature bug."
looksFor:
  - "Use evidence from the first failure and data only this test controls."
  - "Look for the element again after an action changes the page."
  - "Use a request alias or a retrying assertion instead of waiting a fixed time."
  - "Keep retries as evidence that the result varies."
trap: "Adding a longer wait or relying on whole-test retries for every detached-element failure."
followUps:
  - question: "What if the saved filter is still missing after the request succeeds?"
    answer: "I'd check whether the app used the wrong response or lost the saved filter. If I can see it outside the test, I'd report a product bug."
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

I'd save the first failure and check if the action finished and which element Cypress had found. If the app replaces a row in the DOM, the browser's tree of page elements, I'd look for it again. The reference from before the click may point to a detached element, a row the app removed.

For changing text, I'd use a retrying assertion. Cypress repeats this check until the expected result appears or time runs out. If the response helps explain the result, I'd wait for its alias, a name I gave that request. A check inside `then` runs once instead of rereading the page as it updates.

I'd rerun with data only this test uses. If it fails only with other tests, I'd check if they change the same data. A passing retry shows me the result varies. I'd still need to find the cause.

### Example

I'd start my local test page with an active filter already saved. When I click Refresh, the page fetches the list again and replaces the rows. I'd wait for that reply and then find the active row on the updated page.
