---
title: How would you test the message shown when two people reserve the same desk?
topic: cypress
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Intercept the reservation request before it can leave, then check the request, the stubbed response, and the rendered state.
looksFor:
  - Registers an exact method and route before submission.
  - Waits for the alias instead of sleeping.
  - Checks the request and visible conflict message.
  - Explains what the stub leaves unproven.
trap: Registering the intercept after the click on a fast path, or never running a real backend check.
followUps:
  - question: How would you keep the stub aligned with the service?
    answer: I'd check the real service contract separately and update the stub when the contract changes. A fixture is useful if several cases share the same response.
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

I'd intercept the specific reservation request before clicking the button. I'd give it an alias so I can wait for that call, check that it targeted the right desk, and return a predictable conflict. Then I'd assert what the user sees rather than treat the HTTP status as the end of the test.

A fixture or handler can make rare paths repeatable. I'd keep most ordinary journeys against the real backend because a controlled response can't prove the server's reservation rules or establish that the service returns our assumed error.

### Example

The local desk page submits `D12` to the reservation API. I return 409 with `desk_taken` and expect the page to say the desk is no longer available.
