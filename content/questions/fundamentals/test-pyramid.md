---
title: "How does the test pyramid change what you automate?"
topic: fundamentals
roles: [automation, sdet, senior]
level: mid
type: concept
oneLine: "I test rules directly and check how pieces pass data to each other. I keep a smaller set of tests that run through a whole task."
looksFor:
  - "Explain how testing fewer parts at once affects speed and makes failures easier to trace."
  - "Name which exchanges between parts need a test."
  - "Keep a small set of tasks you need to test in the actual user interface."
  - "Choose the mix based on the product instead of a fixed ratio."
trap: "Running every check in the browser or dropping browser checks just to make the test counts look like a pyramid."
followUps:
  - question: "When is a test worth keeping in the browser?"
    answer: "I'd keep it if it can catch something the user sees that tests of smaller parts would miss. For example, I might catch a submit button that users can no longer click."
  - question: Six browser tests fail on the same delivery cutoff. Which would you move, and which would you keep in the browser?
    answer: >-
      I'd test the cutoff cases against the rule itself. I'd keep the check that checkout uses
      dates from the fulfilment service. I'd still test the pickup confirmation in the browser.
      I'd compare how long the tests take and how many fail on the first attempt before and after the move.
sources:
  - label: "ISTQB CTFL v4.0.1, section 5.1.6"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
  - label: The testing trophy, an integration-heavy alternative
    url: https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
---

With the test pyramid, I write many tests of small pieces and fewer tests of the whole product. I start with the simplest test that can catch the failure. A pricing rule usually needs tests for many inputs. If I can call the calculation directly, I can run those tests quickly and find what went wrong.

If parts of the system may disagree about the data they exchange, I use integration tests to check how those parts work together. I keep end-to-end tests, which check whole customer tasks, for cases where all the pieces need to work together. I choose the mix based on where bugs show up and how sure I can be about what caused a failure.

I might use the testing trophy if most bugs show up where parts meet. That approach gives more attention to integration tests.

### Example

For delivery options, I'd test the cutoff rule directly. I'd also check that checkout uses the dates sent by the service that fulfils orders. I'd keep a browser test to select a pickup location and check that the order confirmation shows it.
