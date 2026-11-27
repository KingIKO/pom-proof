---
title: Diagnose a shipping stub that starts too late
kind: diagnosis
topic: playwright
difficulty: medium
minutes: 7
roles: [automation, sdet]
items:
  - id: cause
    type: single-choice
    prompt: Which cause does the trace support?
    choices:
      - { id: route-order, text: The test registers the route only after the request it means to intercept. }
      - { id: assertion-speed, text: The assertion on the shipping label needs a longer timeout. }
      - { id: bad-name, text: The shipping option has the wrong accessible name. }
  - id: fix
    type: ordering
    prompt: Put the corrected test steps in order.
    choices:
      - { id: install-stub, text: Register the shipping quote route with a fixed response. }
      - { id: trigger, text: Select the destination that makes the page request a quote. }
      - { id: check, text: Check that the displayed option matches the fixed response. }
reference:
  cause: route-order
  fix: [install-stub, trigger, check]
decoy:
  cause: assertion-speed
  fix: [trigger, install-stub, check]
---

A checkout test uses a stub, a fixed test response, for the shipping quote. The test expects the stub's `Evening delivery` option. The shipping panel shows `Standard delivery` instead. In Playwright, registering a route tells Playwright to catch matching requests. A Playwright trace is a record of what happened during the test:

| Time | Event |
| --- | --- |
| 10:34:01.112 | Click the Toronto destination |
| 10:34:01.119 | Browser sends `GET /api/shipping/quote?city=toronto` |
| 10:34:01.138 | Server replies with `Standard delivery` |
| 10:34:01.144 | Test registers `**/api/shipping/quote*` |
| 10:34:06.151 | Assertion for `Evening delivery` times out |

An element's accessible name is the label that assistive tools can read for it. Choose the cause that the trace shows. Then put the corrected steps in order.
