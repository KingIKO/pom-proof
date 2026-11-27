---
title: Why doesn't awaiting a Cypress query give you the receipt text?
topic: cypress
roles: [automation, sdet]
level: mid
type: concept
oneLine: Use values when the command queue yields them, and wrap a real promise only at the right point in that queue.
looksFor:
  - Distinguishes queued commands from JavaScript promises.
  - Uses a callback or alias to read the yielded subject.
  - Creates a real promise when the queued flow reaches it.
  - Explains why Cypress orders actions and queries this way.
trap: Storing the chain in a variable and immediately treating it as the DOM element.
followUps:
  - question: What's the difference between then and should for reading something that updates?
    answer: I use a retrying should assertion to wait for a known state. I use then to work once with the value after it's ready.
sources:
  - label: Cypress command queue
    url: https://docs.cypress.io/app/core-concepts/introduction-to-cypress
  - label: Cypress then callbacks
    url: https://docs.cypress.io/api/commands/then
  - label: Cypress wrapping promises
    url: https://docs.cypress.io/api/commands/wrap
  - label: Cypress HTTP requests
    url: https://docs.cypress.io/api/commands/request
  - label: Cypress variables and aliases
    url: https://docs.cypress.io/app/core-concepts/variables-and-aliases
examples:
  - title: Read the receipt and compare it with audit data
    variants:
      - lang: js
        label: Cypress (JavaScript)
        code: |
          it('shows the receipt recorded by the audit API', () => {
            cy.visit('http://localhost:3000/receipts/R42');
            cy.get('[data-testid="receipt-number"]').should('have.text', 'R42').as('receipt');
            cy.window().then((win) => {
              return cy.wrap(win.fetch('/api/receipt-audit/current').then((response) => {
                expect(response.status).to.equal(200);
                return response.json();
              }));
            }).then(({ receiptNumber }) => {
              cy.get('@receipt').should('have.text', receiptNumber);
            });
          });
---

Calling a Cypress command queues work that runs later. The value returned at that moment is a command chain. `await` doesn't turn it into a receipt element. Cypress runs commands in order and controls which queries and assertions it retries, so one command can reliably provide the subject for the next.

I'd use `then` to read the resolved subject once or an alias to refer to it later. For a real promise, I'd start it inside a queued callback if it depends on earlier commands, then return a `cy.wrap` chain to wait for the result.

I'd normally use `cy.request` for a direct HTTP check. The example uses `cy.wrap` to show how an existing promise fits into the command queue.

### Example

The local receipt page displays R42. Only after that text appears does the check ask the browser to fetch the audit endpoint, which should report the same receipt number.
