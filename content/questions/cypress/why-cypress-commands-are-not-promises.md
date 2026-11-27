---
title: "Why doesn't `await` on a Cypress query give you the receipt text?"
topic: cypress
roles: [automation, sdet]
level: mid
type: concept
oneLine: "I read values when the Cypress command queue hands them to me. I wrap a real promise only at the point in the queue where I need its result."
looksFor:
  - "Explain the difference between a Cypress command and a JavaScript promise."
  - "Use a callback or an alias to read the value a command gives you."
  - "Start a real promise when the queued commands reach that point."
  - "Explain why Cypress runs actions and searches in that order."
trap: "Saving the command chain in a variable and treating it as the page element right away."
followUps:
  - question: "How do `then` and `should` differ when the value changes?"
    answer: "I use `should` to keep trying a check until the expected result appears or time runs out. I use `then` to work once with a value once it is available."
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

A Cypress command adds work to a queue, a list that runs in order. I get back a command chain, not the receipt element, so `await` doesn't give me the element. Cypress decides which searches and checks to repeat. One command can pass its subject, the value it found, to the next command.

I'd use `then` to read that value once. To refer to it later, I'd give it an alias, a name Cypress can look up. A promise represents a result JavaScript will receive later. If a promise depends on earlier commands, I'd start it inside a callback, a function Cypress calls when it gets there. I'd return a `cy.wrap` chain so Cypress waits for the result.

### Example

I normally use `cy.request` to check an HTTP reply directly. Here I use `cy.wrap` to show how an existing promise fits in the queue. After the local page shows R42, I ask the browser to fetch the audit address. I expect the same receipt number in its reply.
