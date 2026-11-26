---
title: Diagnose a late shipping stub
kind: diagnosis
topic: playwright
difficulty: medium
minutes: 7
roles: [automation, sdet]
items:
  - id: cause
    type: single-choice
    prompt: Which cause is supported by the trace?
    choices:
      - { id: route-order, text: The test registers the route after the request it intends to intercept. }
      - { id: assertion-speed, text: The shipping label assertion needs a longer timeout. }
      - { id: bad-name, text: The shipping option has the wrong accessible name. }
  - id: fix
    type: ordering
    prompt: Put the corrected test steps in order.
    choices:
      - { id: install-stub, text: Register the shipping quote route with a fixed response. }
      - { id: trigger, text: Select the destination that requests a quote. }
      - { id: check, text: Assert the displayed option matches the fixed response. }
reference:
  cause: route-order
  fix: [install-stub, trigger, check]
decoy:
  cause: assertion-speed
  fix: [trigger, install-stub, check]
---

A checkout test expects an `Evening delivery` option from a stubbed shipping quote. The shipping panel shows `Standard delivery`. A Playwright trace records these events:

| Time | Event |
| --- | --- |
| 10:34:01.112 | Click the Toronto destination |
| 10:34:01.119 | Browser sends `GET /api/shipping/quote?city=toronto` |
| 10:34:01.138 | Server replies with `Standard delivery` |
| 10:34:01.144 | Test registers `**/api/shipping/quote*` |
| 10:34:06.151 | Assertion for `Evening delivery` times out |

Select the cause shown by the trace and order the corrected steps.
