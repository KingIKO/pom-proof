---
title: Test how an API limits writes over time
kind: scenario
topic: api-testing
difficulty: medium
minutes: 8
roles: [automation, sdet]
items:
  - id: clarify
    type: multi-select
    prompt: Which details do you need before you write checks at the rate limit boundary?
    choices:
      - { id: key, text: "Which caller identity and which operations count against the same counter?" }
      - { id: docs, text: "Which heading should the help center use for its page about limits?" }
      - { id: format, text: "Should a sample response on the docs page use numbered callouts?" }
      - { id: window, text: "When exactly does the counter reset, and what value should Retry-After report?" }
  - id: risk
    type: budgeted-pick
    prompt: You have up to 11 minutes. Choose checks that show each tenant's counter stays separate and that writes recover after the reset.
    budget: 11
    choices:
      - { id: baseline, cost: 5, text: "Send one normal write from each of the two tenants while both of their counters are nearly empty." }
      - { id: recovery, cost: 6, text: "After using up one tenant's quota, check the rejected write, retry time, and reset boundary." }
      - { id: isolation, cost: 5, text: "While the first tenant's quota is used up, show that a second tenant can still write." }
      - { id: copy, cost: 3, text: "Compare the wording in the documentation examples with the wording that current responses actually use." }
  - id: layer
    type: single-choice
    prompt: Which kind of test first shows that the deployed service rejects the over-quota write and accepts writes again after the reset?
    choices:
      - { id: ui, text: "An automated UI test" }
      - { id: unit, text: "A unit test" }
      - { id: manual, text: "A manual exploratory test" }
      - { id: api, text: "An API test" }
  - id: isolation-layer
    type: single-choice
    prompt: Which kind of test first shows that two fixture tenants keep separate counters on the deployed service?
    choices:
      - { id: manual, text: "A manual exploratory test" }
      - { id: unit, text: "A unit test" }
      - { id: api, text: "An API test" }
      - { id: ui, text: "An automated UI test" }
  - id: stop
    type: single-choice
    prompt: Which result should stop the rollout?
    choices:
      - { id: body, text: "The body of the error response uses the documented reason text." }
      - { id: mutation, text: "A write gets a 429 response but still creates a record." }
      - { id: tenants, text: "A second tenant stays under its quota and can still write." }
      - { id: header, text: "The response includes a valid Retry-After value, as promised." }
  - id: order
    type: ordering
    prompt: Put the steps of the boundary check in order. Use a fresh tenant and a fixed test clock.
    choices:
      - { id: reset, text: "Move the clock to the reset boundary and check that one new write succeeds." }
      - { id: blocked, text: "Before the reset, check that one more write returns 429 and creates no record." }
      - { id: seed, text: "Set the staging clock and create a fixture tenant whose counter starts empty." }
      - { id: limit, text: "In one window, make exactly the allowed number of successful writes." }
reference:
  clarify: [key, window]
  risk: [recovery, isolation]
  layer: api
  isolation-layer: api
  stop: mutation
  order: [seed, limit, blocked, reset]
decoy:
  clarify: [window, docs]
  risk: [baseline, recovery]
  layer: api
  isolation-layer: unit
  stop: mutation
  order: [seed, limit, blocked, reset]
---

A public write API adds a fixed-window quota for each tenant. A tenant is one customer account, and the quota caps its writes in each fixed time window. When a request goes over the quota, the API must return HTTP 429 and the documented `Retry-After` value. That value tells the caller when to try again. The rejected request must not create a record.

Each tenant has its own counter, and other tenants' writes do not change it. The ticket leaves out which operations share a counter and the exact reset rules. Once the team confirms those details, use separate fixture tenants in staging. A fixture tenant is a test tenant set up only for these checks. Also use a test clock that you can move.
