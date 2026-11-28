---
title: Waiting and synchronisation
module: automation-fundamentals
order: 5
level: core
summary: Synchronisation means waiting for a sign that the app is ready before you continue. That sign might be a button becoming enabled.
minutes: 2
prerequisites: [automation-fundamentals/locator-strategy]
outcomes:
  - Choose what to wait for before an action and after it.
  - Explain how Playwright's automatic checks differ from Selenium's explicit waits.
useWhen:
  - The next step needs something that may still be loading.
avoidWhen:
  - Your tool already checks that the action is safe to take.
  - A longer delay would only hide the reason the page never becomes ready.
practiceTopics: [selenium]
questionTopics: [locators-waits]
diagrams:
  - id: pause-and-condition
    type: timeline
    title: A fixed pause and a condition wait
    note: The condition wait ends when its condition is met, here before its timeout. Lengths are not measured.
    description:
      - Both runs share one time scale, and the fixed pause is the same length in both. The app is ready later in the slow run.
      - In both runs the condition wait lasts until the app is ready, before its timeout.
    steps: 10
    lanes:
      - name: Fast run
        mark: { label: App ready, at: 3 }
        entries:
          - { name: Fixed pause, spans: [{ from: 0, to: 5 }], outcome: Wastes time }
          - { name: Condition wait, spans: [{ from: 0, to: 3 }], strong: true }
      - name: Slow run
        mark: { label: App ready, at: 8 }
        entries:
          - { name: Fixed pause, spans: [{ from: 0, to: 5 }], outcome: Too short }
          - { name: Condition wait, spans: [{ from: 0, to: 8 }], strong: true }
sources:
  - { label: "Playwright: Actionability and assertions", url: "https://playwright.dev/docs/actionability", type: primary }
  - { label: "Selenium: Waiting strategies", url: "https://www.selenium.dev/documentation/webdriver/waits/", type: primary }
  - { label: "Cypress: Best practices", url: "https://docs.cypress.io/app/core-concepts/best-practices", type: primary }
---
## What it is

Synchronisation means making a test wait until the app is ready for the next step. A page can finish loading before its buttons become usable. A timeout is the deadline after which the tool gives up and reports a failure.

## How it works

Separate readiness from the result. Before you click Save, the button must accept the click. After you click, the app must show that the save finished.

Playwright auto-waits for the checks that apply to each action. For a click, it checks that the button is visible, steady and enabled, among other things. It also checks that something like an overlay won't intercept the click. The click says nothing about whether the save succeeded. A web-first assertion, a check that retries against the page, can wait for the success message.

In Selenium, an explicit wait keeps checking a condition you choose. For example, use `WebDriverWait` to wait for a blocking banner to disappear before clicking. An implicit wait applies to element lookups and defaults to zero seconds. Finding a button does not prove it is ready to click. Selenium warns against mixing implicit and explicit waits because the total wait can become unpredictable.

## Why it helps

A fixed pause waits the same time on every run. A condition wait lets a fast run continue as soon as the app is ready. It also gives a slower run time to catch up. If the condition never holds, the failure points to a specific missing state.

```diagram
pause-and-condition
```

## When not to use it

Skip a separate wait if the action already checks the same condition. Avoid pauses of a fixed length, because one length can be too short on a slow run and too long on a fast run. Cypress gives the same advice about arbitrary calls to its `cy.wait()` command with a number.
