---
title: Test levels, types and sizes
module: testing-foundations
order: 2
level: core
summary: Describe a test by what it covers, what it checks and what it needs to run. Each answer tells you something different about the test.
minutes: 2
prerequisites: [testing-foundations/why-we-test]
outcomes:
  - Describe the five ISTQB test levels with examples from one feature.
  - Classify one check by both its type and its level.
  - Explain why a test can cover several components and still be small.
useWhen:
  - You need to pick where to check a behaviour or where the check can run.
avoidWhen:
  - The team uses the same label for tests that need different environments.
questionTopics: [fundamentals]
sources:
  - { label: "ISTQB: Foundation Level syllabus, section 2.2", url: "https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf", type: primary }
  - { label: "Google Testing Blog: Test sizes", url: "https://testing.googleblog.com/2010/12/test-sizes.html", type: practitioner }
  - { label: "Software Engineering at Google: Testing overview", url: "https://abseil.io/resources/swe-book/html/ch11.html", type: practitioner }
  - { label: "Martin Fowler: Unit test", url: "https://martinfowler.com/bliki/UnitTest.html", type: practitioner }
  - { label: "Martin Fowler: Integration test", url: "https://martinfowler.com/bliki/IntegrationTest.html", type: practitioner }
---
## What it is

A test level groups checks by what they target and why. A test type describes what a check evaluates or how you designed it. Test size describes the resources a check can use.

## How it works

ISTQB, the International Software Testing Qualifications Board, describes five levels. A booking app gives each level a different target:

1. Component testing, also called unit testing, checks one part on its own, such as the cutoff calculation.
2. Component integration testing checks how parts of the same system work together, such as booking creation using the cutoff result.
3. System testing checks the whole app, for example whether a customer can make a booking and see it in their account.
4. System integration testing checks a connection to another system, for example whether the booking app can send a request to its email provider.
5. Acceptance testing checks whether the product meets the needs that decide if it's ready to use. Ask reception staff to manage a full day's schedule.

ISTQB covers four types. A functional check asks whether a booking succeeds. A non-functional check asks how well it works, for example how long confirmation takes. A black-box check takes its cases from the rules users see or other specifications. A white-box check takes its cases from the internals, for example by exercising both paths of a code decision.

Google's small tests run in one process with no network or separate database. Medium tests can use multiple processes on one machine, including a local database. Large tests can reach other machines.

A check can verify how the booking and cutoff code work together and stay small by running in one process without network or disk access.

## Why it helps

Try a booking through the complete app with a separate browser process. Keep the browser, app and every dependency on one machine. If you use the written booking rules, that's a black-box functional system test. Under Google's size rules it is medium.

## When not to use it

Fowler credits Jay Fields for two terms: sociable unit tests use real collaborators and solitary unit tests replace them. Fowler's narrow integration tests exercise a single connection with a stand-in. His broad integration tests run through multiple live services. In an interview, name the parts that run and the behaviour you check.
