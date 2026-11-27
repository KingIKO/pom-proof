---
title: Would you choose Cypress for a dispatch board that also opens carrier popups?
topic: cypress
roles: [automation, sdet]
level: junior
type: concept
oneLine: Weigh Cypress's direct control over a web app against the browser and window boundaries of the flow.
looksFor:
  - Explains Cypress's in-browser execution and accompanying Node process.
  - Connects the design to network control and retrying queries.
  - Accounts for the one-tab runner and its plugin option.
  - Separates web coverage from native mobile and cross-origin needs.
trap: Assuming the core Cypress command chain can drive a native mobile app or two independent browsers.
followUps:
  - question: The dispatcher clicks a carrier link and the quote opens in a second tab. What would you need to check that tab in Cypress?
    answer: The test still runs in its original tab. I'd pilot the official Puppeteer plugin on a supported Chromium-based browser before relying on it to inspect the quote.
sources:
  - label: Cypress architecture
    url: https://docs.cypress.io/app/get-started/why-cypress
  - label: Cypress trade-offs
    url: https://docs.cypress.io/app/references/trade-offs
  - label: Cypress native mobile support FAQ
    url: https://docs.cypress.io/app/faq#Does-Cypress-support-native-mobile-apps
  - label: Cypress multi-tab testing
    url: https://docs.cypress.io/app/guides/multi-tab-testing
  - label: Cypress cross-origin commands
    url: https://docs.cypress.io/api/commands/origin
  - label: Cypress retrying queries
    url: https://docs.cypress.io/app/core-concepts/retry-ability
  - label: Cypress request interception
    url: https://docs.cypress.io/api/commands/intercept
examples:
  - title: Drive the dispatch board with a controlled queue
    variants:
      - lang: js
        label: Cypress (JavaScript)
        code: |
          it('shows the queued dispatch', () => {
            cy.intercept('GET', '/api/dispatches', {
              body: [{ id: 'D47', destination: 'Glasgow', state: 'Queued' }],
            });
            cy.visit('http://localhost:3000/dispatch');
            cy.contains('[data-testid="dispatch-row"]', 'Glasgow').should('contain.text', 'Queued');
          });
---

Cypress runs JavaScript test code in the browser alongside the app and works with a Node process. Selenium sends WebDriver commands from outside the browser. I'd try Cypress for a browser board where the team wants to control network responses and use queries that retry as the page updates.

The test runner operates in one tab. A plugin can reach carrier popups on supported Chromium-based browsers, but I'd pilot that before choosing. For a different origin I'd check whether `cy.origin` fits the flow. I'd choose a separate tool for a native mobile app.

### Example

The local dispatch board loads its queue on arrival. Cypress returns a controlled dispatch response and checks that Glasgow renders as queued. I'd keep a separate integration check for the real dispatch service.
