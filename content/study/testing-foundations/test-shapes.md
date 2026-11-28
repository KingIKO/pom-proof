---
title: Test shapes
module: testing-foundations
order: 3
level: core
summary: The pyramid, trophy and honeycomb put testing effort in different places. Use them to explain which failures your suite is built to catch.
minutes: 2
prerequisites: [testing-foundations/test-levels-and-types]
outcomes:
  - Compare what the pyramid, trophy and honeycomb ask a team to test most.
  - Use Google's SMURF checklist to explain the cost of a broader test.
useWhen:
  - You want to review the mix of checks in an automated suite.
avoidWhen:
  - You are adding cases just to meet a target percentage.
questionTopics: [fundamentals, automation-strategy]
diagrams:
  - id: test-shapes
    type: layer-stack
    title: Where each shape puts the effort
    note: Wider bars mean more testing effort. The widths are not measured.
    description:
      - Each list runs from the top of the drawing to the bottom.
      - In the pyramid, Service is narrower than Unit, and UI is narrowest.
      - In the trophy, Unit and Static are narrower than Integration, and End-to-end is narrowest.
      - In the honeycomb, Implementation detail is narrower than Integration, and Integrated is narrowest.
    shapes:
      - name: Pyramid
        layers:
          - { label: UI, width: 1 }
          - { label: Service, width: 3 }
          - { label: Unit, width: 5, widest: true }
      - name: Trophy
        layers:
          - { label: End-to-end, width: 2 }
          - { label: Integration, width: 5, widest: true }
          - { label: Unit, width: 3 }
          - { label: Static, width: 3 }
      - name: Honeycomb
        layers:
          - { label: Integrated, width: 1 }
          - { label: Integration, width: 5, widest: true }
          - { label: Implementation detail, width: 3 }
sources:
  - { label: "ISTQB: Foundation Level syllabus, section 5.1.6", url: "https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf", type: primary }
  - { label: "Mike Cohn: The forgotten layer of the test automation pyramid", url: "https://www.mountaingoatsoftware.com/blog/the-forgotten-layer-of-the-test-automation-pyramid", type: primary }
  - { label: "Martin Fowler: Test pyramid", url: "https://martinfowler.com/bliki/TestPyramid.html", type: practitioner }
  - { label: "Google Testing Blog: Just say no to more end-to-end tests", url: "https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html", type: practitioner }
  - { label: "Kent C. Dodds: The testing trophy", url: "https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications", type: practitioner }
  - { label: "Spotify Engineering: Testing of microservices", url: "https://engineering.atspotify.com/2018/01/testing-of-microservices", type: practitioner }
  - { label: "Martin Fowler: On the diverse and fantastical shapes of testing", url: "https://martinfowler.com/articles/2021-test-shapes.html", type: practitioner }
  - { label: "Google Testing Blog: SMURF", url: "https://testing.googleblog.com/2024/10/smurf-beyond-test-pyramid.html", type: practitioner }
whatChanged:
  checked: 2026-11-27
  items:
    - Mike Cohn described the pyramid in his 2009 book. Martin Fowler explained it in 2012. Google's Testing Blog suggested 70/20/10 as a starting mix in 2015.
    - Spotify published its honeycomb in January 2018. Kent C. Dodds posted the trophy on 6 February 2018 and explained its scope on 3 June 2021.
    - On 2 June 2021, Fowler argued that some of the disagreement comes from different meanings of unit and integration.
    - On 15 October 2024, Google's Testing Blog published SMURF to help teams weigh trade-offs their pyramid alone cannot show.
expertsDisagree:
  - question: Which tests should get most of the effort?
    note: The authors use different meanings of unit. The cited articles give reasons and examples, but they do not compare the shapes on the same suite.
    positions:
      - view: "Pyramid: favour focused unit checks for quick feedback and easier diagnosis. Add integration tests and a few checks of whole journeys to catch failures between parts. Spotify warns that tests tied to internals may need rewriting when the code changes, even if its behaviour stays the same."
        holdsWhen: Focused tests cover many rules well, and full browser journeys cost more to run and maintain.
        source:
          - https://martinfowler.com/bliki/TestPyramid.html
          - https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html
          - https://engineering.atspotify.com/2018/01/testing-of-microservices
      - view: "Trophy: favour checks that exercise several pieces of one app together. Dodds uses a whole page with simulated server replies as an example. This can catch mistakes within the page, but leaves the real server connection unchecked."
        holdsWhen: Much of the behaviour depends on how parts of one app work together, as in a browser page with several components.
        source: https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
      - view: "Honeycomb: favour checks at the inputs and outputs of one service. Spotify keeps a few checks of complex internals and avoids tests that depend on other services working. If an output is wrong, you may need to follow stack traces from inside the service to find the cause."
        holdsWhen: You can exercise a service through its public interface without standing up the other services it connects to.
        source: https://engineering.atspotify.com/2018/01/testing-of-microservices
---
## What it is

A test shape is a picture of where a team puts its testing effort. This page compares three: the pyramid, the trophy and the honeycomb. The trophy and honeycomb both put integration in the widest part, but they draw the boundary around different code.

```diagram
test-shapes
```

## How it works

The original pyramid names its top layer UI, for tests that drive the product through its user interface. Its service tests work through a layer below the interface, such as an API. In the trophy, the top layer holds end-to-end tests, which check a whole flow across the product. The trophy adds static checks, such as type checking, which inspect code without running the app.

The honeycomb focuses on a microservice, a small piece of a larger system that other code can use through an interface. Its top layer holds integrated tests, which pass or fail depending on whether another service works. Its bottom layer holds implementation detail tests, which check a complex part of the code on its own.

Google's SMURF checklist asks five questions about a test:

- Speed: How long does it take to get a result?
- Maintainability: How much work does it take to diagnose a failure or update the test?
- Utilization: How much memory, disk space or processing power does it need?
- Reliability: Does it fail only when there's a real problem?
- Fidelity: How closely does the test match the way the software actually runs?

## Why it helps

For example, check a delivery fee directly when the risk is rounding. If the risk is saving the wrong amount, create an order with a real test database and check the saved fee. That check may run slower, but it can reveal a problem the calculation check cannot see.

## When not to use it

Google once suggested 70% unit, 20% integration and 10% end-to-end as a starting guess. Its post says the mix varies by team. If you use a ratio, first agree on what counts as a unit. Fowler notes that one team might call a test with real collaborators a unit test, while another calls it integration.

In an interview, give the failure you're looking for, the parts the test needs and one cost you'd accept to catch it.
