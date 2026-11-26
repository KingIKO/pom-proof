---
title: Test an API rate limit window
kind: scenario
topic: api-testing
difficulty: medium
minutes: 8
roles: [automation, sdet]
items:
  - id: clarify
    type: multi-select
    prompt: Which details do you need to write the rate limit boundary checks?
    choices:
      - { id: key, text: "Which identity and operation share a counter?" }
      - { id: docs, text: "Which heading should the help center use for its limits page?" }
      - { id: format, text: "Should a response example use numbered callouts?" }
      - { id: window, text: "Exactly when does the counter reset and what value should Retry-After report?" }
  - id: risk
    type: budgeted-pick
    prompt: Spend up to 11 minutes on counter isolation and recovery.
    budget: 11
    choices:
      - { id: baseline, cost: 5, text: "Run a normal write from both tenants with almost-empty counters." }
      - { id: recovery, cost: 6, text: "Exhaust one tenant's quota and check the rejected write, retry time, and reset boundary." }
      - { id: isolation, cost: 5, text: "With the first tenant exhausted, prove a second tenant can still write." }
      - { id: copy, cost: 3, text: "Compare documentation examples with current response wording." }
  - id: layer
    type: single-choice
    prompt: Which layer first proves the deployed service rejects the over-quota write and recovers after the reset?
    choices:
      - { id: ui, text: "UI" }
      - { id: unit, text: "Unit" }
      - { id: manual, text: "Manual exploratory" }
      - { id: api, text: "API" }
  - id: isolation-layer
    type: single-choice
    prompt: Which layer first proves that the deployed counters for two fixture tenants remain independent?
    choices:
      - { id: manual, text: "Manual exploratory" }
      - { id: unit, text: "Unit" }
      - { id: api, text: "API" }
      - { id: ui, text: "UI" }
  - id: stop
    type: single-choice
    prompt: Which outcome stops rollout?
    choices:
      - { id: body, text: "The error body uses the documented reason string." }
      - { id: mutation, text: "A write returns 429 and still creates a record." }
      - { id: tenants, text: "A second tenant remains under quota and can write." }
      - { id: header, text: "The response includes a valid Retry-After value as promised." }
  - id: order
    type: ordering
    prompt: Order the boundary check with a fresh tenant and a fixed test clock.
    choices:
      - { id: reset, text: "Advance the clock to the reset boundary and confirm one new write succeeds." }
      - { id: blocked, text: "Attempt the next write before reset and check 429 with no new record." }
      - { id: seed, text: "Set the staging clock and create a fixture tenant with a fresh counter." }
      - { id: limit, text: "Make exactly the allowed number of successful writes in the same window." }
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

A public-facing write API introduces a fixed-window quota per tenant. A request beyond quota must return HTTP 429 and the documented `Retry-After` value without creating a record. Another tenant's counter is independent.

The ticket omits how operations are grouped and the exact reset rules. Use isolated staging tenants and a controllable clock once the team confirms those details.
