---
title: "How would you reuse sign-in between Cypress profile tests?"
topic: cypress
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "I use `cy.session` with a key that contains no secrets. I check the restored account and test the sign-in form separately."
looksFor:
  - "Explain what Cypress clears to keep tests independent."
  - "Include the account and sign-in method in the key when they matter."
  - "Check the account after restoring it and explain what happens when the session expires."
  - "Keep a test that goes through the real sign-in form."
trap: "Putting a password in the key or assuming a restored cookie proves the sign-in form still works."
followUps:
  - question: "What if Cypress restores a session but the check says it's invalid?"
    answer: "I'd expect Cypress to run setup again. If the new session fails its check right after setup, I'd expect the test to fail."
sources:
  - label: Cypress test isolation
    url: https://docs.cypress.io/app/core-concepts/test-isolation
  - label: Cypress session setup and validation
    url: https://docs.cypress.io/api/commands/session
  - label: Cypress programmatic requests
    url: https://docs.cypress.io/api/commands/request
  - label: Cypress secret access
    url: https://docs.cypress.io/api/commands/env
examples:
  - title: Restore a validated read-only profile session
    variants:
      - lang: js
        label: Cypress (JavaScript)
        code: |
          const app = 'http://localhost:3000';
          const user = 'reader@example.test';

          beforeEach(() => {
            cy.session(['api-login', user], () => {
              cy.env(['profilePassword']).then(({ profilePassword }) => {
                cy.request({
                  method: 'POST',
                  url: `${app}/api/login`,
                  body: { email: user, password: profilePassword },
                  log: false,
                }).its('status').should('eq', 200);
              });
            }, {
              validate() {
                cy.request(`${app}/api/me`).its('body.email').should('eq', user);
              },
            });
          });

          it('shows the reader profile', () => {
            cy.visit(`${app}/profile`);
            cy.get('[data-testid="profile-email"]').should('have.text', user);
          });
---

If end-to-end test isolation is on, Cypress clears cookies and browser storage between tests. That keeps sign-in state from leaking from one test into the next. I'd use `cy.session` to save and restore browser state for a named test account. The session key tells a reader apart from an administrator and can include the sign-in method. I'd leave credentials out of that key.

I'd check the restored state by calling an address that requires sign-in and returns the expected user. I'd still visit the feature page after restoring sign-in. If tests change profile data on the server, I'd give them separate accounts or records. I'd keep a real sign-in form test because a saved login can hide a broken form.

### Example

I'd set up a local read-only reader account and use the Cypress `profilePassword` secret. I'd sign in by calling the service directly so it sets the cookie. I'd expect the protected profile to show the same email I saw when I checked the session.
