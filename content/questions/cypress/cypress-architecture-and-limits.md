---
title: "Would you use Cypress for a dispatch board that opens carrier popups?"
topic: cypress
roles: [automation, sdet]
level: junior
type: concept
oneLine: "I weigh what Cypress can control inside the web app against which tabs, sites, and browsers the test needs."
looksFor:
  - "Explain how Cypress runs in the browser and works with a separate Node process."
  - "Explain how that design helps control responses and retry searches for elements."
  - "Describe the single-tab runner and the add-on you can test for popups."
  - "Distinguish ordinary web tests from cross-origin tests and tests of native phone apps."
trap: "Assuming the built-in Cypress commands can drive a native phone app or two separate browsers."
followUps:
  - question: "If the carrier quote opens in a second tab, what would you need to check it in Cypress?"
    answer: "Cypress keeps running the test in the original tab. I'd try the official Puppeteer add-on on a supported Chromium-based browser before depending on it to inspect the quote."
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

Cypress runs JavaScript test code beside the app inside the browser. It also works with a Node process running JavaScript outside the browser. Selenium sends WebDriver commands to control the browser from outside. I'd try Cypress if I need to control network replies and use queries that keep looking for elements as the page changes.

The Cypress runner uses one tab. A plugin, or add-on, can reach carrier popups on supported Chromium-based browsers. I'd try it on the dispatch flow before choosing it.

A cross-origin flow crosses between addresses with different schemes, hosts, or ports. A different subdomain counts because the host changes. If Cypress needs to run commands on another origin, those commands need `cy.origin`, which tells Cypress where to run them. I'd check that it fits the flow. I'd choose a separate tool for a native app that runs directly on the phone.

### Example

I'd have my local dispatch board load the queue when I open it. I'd make Cypress return a planned reply and check the board shows Glasgow as queued. I'd also keep a separate test that connects to the real dispatch service.
