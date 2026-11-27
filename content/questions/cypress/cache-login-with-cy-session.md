---
title: How would you avoid repeating sign-in for every customer profile test?
topic: cypress
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Use cy.session with a non-secret identity key, verify the restored account, and keep separate sign-in coverage.
looksFor:
  - Knows what test isolation clears.
  - Includes identity and login mode in the session key where needed.
  - Checks the restored session and handles expiration.
  - Keeps a real check of the sign-in form.
trap: Putting a password in the session key or assuming a restored cookie proves the sign-in form works.
followUps:
  - question: What happens when a restored session fails validation?
    answer: Cypress reruns setup for the invalid session. A validation failure immediately after setup fails the test.
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

With end-to-end test isolation on, Cypress clears cookies and browser storage between tests. I'd use `cy.session` to save and restore the browser state for a named test identity. The key can distinguish a reader from an administrator and should leave out credentials. I'd validate the restored state against a protected endpoint that returns the expected user.

I'd still visit the feature page after restoring state. A valid cached login can hide a broken sign-in form, so I'd exercise the form in a separate test. If tests change server-side profile data, I'd give those tests separate accounts or records.

### Example

The local fixture has a dedicated read-only reader account and a configured Cypress `profilePassword` secret. The API login sets its cookie, and the protected profile should show the same email that session validation observed.
