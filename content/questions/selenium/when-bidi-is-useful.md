---
title: What does WebDriver BiDi add to a Selenium test?
topic: selenium
roles: [automation, sdet, senior]
level: senior
type: tooling
oneLine: BiDi lets a test subscribe to browser events such as console messages where its browser and binding support them.
looksFor:
  - Classic WebDriver request and response versus event subscriptions
  - A narrow reason to observe an event
  - A browser and binding compatibility check
  - A distinction between diagnostics and user-facing behavior
trap: Promising the same BiDi feature set across browsers or replacing outcome assertions with low-level events.
followUps:
  - question: Would you migrate all existing tests to BiDi?
    answer: I'd add an event subscription where it solves a specific observation problem and leave ordinary WebDriver interactions in place.
sources:
  - label: Selenium WebDriver BiDi
    url: https://www.selenium.dev/documentation/webdriver/bidi/
  - label: Selenium BiDi logging
    url: https://www.selenium.dev/documentation/webdriver/bidi/logging/
---

Classic WebDriver interactions follow a request and response pattern. WebDriver BiDi adds bidirectional communication so my test can subscribe to things the browser reports, such as console events. The session has to request BiDi support. I attach the listener before opening the report page so I can keep the events if it fails to render.

I'd check the browser versions and the Selenium language binding before building a required check around a particular event. Support for one event doesn't establish support for every other command or event. I use Selenium's standard interactions for most tests and add BiDi when the information is useful and the support is verified.

### Example

For a report preview that sometimes renders blank, I'd capture browser error events where supported and still assert that the preview shows the expected report heading. The events explain a failure; the heading is the customer outcome.
