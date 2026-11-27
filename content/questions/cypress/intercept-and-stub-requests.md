---
title: "How would you test the message when two people try to reserve the same desk?"
topic: cypress
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "I catch the reservation call before it goes out. I check what it sends and what the page shows after a reply I control."
looksFor:
  - "Match the exact request method and address before clicking submit."
  - "Wait for the named request instead of using a fixed delay."
  - "Check what the call sends and whether the desk conflict appears on screen."
  - "Explain what a test with a made-up reply can't prove."
trap: "Setting up the intercept after the click on a fast path or never checking the real service."
followUps:
  - question: "How would you keep the stub consistent with the real service?"
    answer: "I'd check the service contract, the rules for its requests and replies, separately. I'd update the stub when those rules change. If tests share a reply, I'd keep it in a fixture, a reusable piece of test data."
sources:
  - label: Cypress intercept and static responses
    url: https://docs.cypress.io/api/commands/intercept
  - label: Cypress waiting on aliased requests
    url: https://docs.cypress.io/api/commands/wait
  - label: Cypress network requests and stubbing trade-offs
    url: https://docs.cypress.io/app/guides/network-requests
  - label: Cypress retrying assertions
    url: https://docs.cypress.io/app/core-concepts/retry-ability
examples:
  - title: Return a conflict for desk D12
    variants:
      - lang: js
        label: Cypress (JavaScript)
        code: |
          it('explains when desk D12 is already reserved', () => {
            cy.intercept('POST', '/api/reservations', {
              statusCode: 409,
              body: { code: 'desk_taken' },
            }).as('reserve');
            cy.visit('http://localhost:3000/desks/D12');
            cy.contains('button', 'Reserve desk').click();
            cy.wait('@reserve').then(({ request, response }) => {
              expect(request.body).to.include({ deskId: 'D12' });
              expect(response.statusCode).to.equal(409);
            });
            cy.get('[role="alert"]').should('have.text', 'This desk is no longer available.');
          });
---

I'd intercept the specific reservation request before I click submit. The intercept catches the request before it goes out. I'd give it an alias so the test can wait for that named request. I'd check which desk the request names and send a stub, a response I control, that reports a conflict. I'd check what the user sees as well as the response.

On a fast path, the app can send the request before a test sets up the intercept.

I'd use saved test data or code that handles the request to make rare cases repeatable. I'd test most ordinary flows against the real service. A controlled reply can't prove the server follows the reservation rules or returns the error I assumed.

### Example

My local desk page sends `D12` to the reservation API, the address it uses to talk to the service. I return 409 with `desk_taken`. I expect the page to tell me the desk is no longer available.
