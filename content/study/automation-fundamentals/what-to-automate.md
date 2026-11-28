---
title: What to automate
module: automation-fundamentals
order: 1
level: core
summary: Automate repeatable checks with clear expected results. Start with a failure that matters and pick the smallest test that can catch it.
minutes: 2
prerequisites: [testing-foundations/test-shapes]
outcomes:
  - Pick a first check based on risk, how often it runs and what it costs to maintain.
  - Explain which part of a checkout flow needs a browser and which part can run without one.
useWhen:
  - The team checks an important rule often and can state what a pass looks like.
avoidWhen:
  - Someone needs to judge how a new design feels before the team settles on the intended behaviour.
questionTopics: [automation-strategy]
sources:
  - { label: "ISTQB: Foundation syllabus, sections 2.2.3, 5.1.6 and 6.2", url: "https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf", type: primary }
  - { label: "Selenium: Discouraged behaviours", url: "https://www.selenium.dev/documentation/test_practices/discouraged/", type: primary }
  - { label: "Selenium: Types of testing", url: "https://www.selenium.dev/documentation/test_practices/testing_types/", type: primary }
  - { label: "Google Testing Blog: The costs of end-to-end tests", url: "https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html", type: practitioner }
---
## What it is

An automated check uses code to set up a case and compare the actual result with an expected result. A regression check repeats a test after a change to catch a break in existing behaviour. Frequent regression checks are good candidates when their expected results are clear and their setup is repeatable.

## How it works

Start by naming the failure you want to catch. For example, a checkout might charge delivery fees on orders that qualify for free delivery. Decide how often the team checks the rule and how much work it takes to run and maintain the test.

Then pick the smallest test that can see the failure. Test the fee calculation directly with a unit test, which checks a small piece of code. If you need to check what the shopper sees, keep a browser test that shows the fee change as the cart crosses the free-delivery threshold.

## Why it helps

A repeatable check gives the team feedback after each change without asking someone to replay the same steps. A failure in the fee calculation also gives you a narrower place to look than a failure somewhere in checkout. The browser test earns its upkeep by checking that the result reaches the screen.

## When not to use it

Explore a changing checkout design by hand if the question is whether shoppers can find the delivery options. If a check will run once, compare the manual effort with the cost of writing it.

Selenium discourages using its browser automation to check HTTP response codes, the numbers a server sends back with each response. Selenium suggests checking the error page's content instead. An API lets code call the service directly. An API test can check the status code directly.

Selenium also discourages automating CAPTCHAs, which try to tell people from bots. Its list includes two-factor login, which asks for a second proof of identity, and third-party logins such as Gmail or Facebook. To measure performance under load, choose a tool built for that job.
