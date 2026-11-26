---
title: Test password reset links
kind: scenario
topic: authentication
difficulty: medium
minutes: 8
roles: [manual-qa, automation, sdet]
items:
  - id: clarify
    type: multi-select
    prompt: Which missing rules change what you expect the reset service to accept?
    choices:
      - { id: resend, text: Does asking for a new link invalidate older unused links? }
      - { id: sender, text: Should the sender name use the product or company name? }
      - { id: logo, text: Which logo size should the email use on mobile? }
      - { id: expiry, text: "How long is a link valid, and when does that time start?" }
  - id: risk
    type: budgeted-pick
    prompt: Spend up to 11 minutes checking whether invalid links can change a password.
    budget: 11
    choices:
      - { id: inbox, cost: 6, text: Send ordinary reset mail to two supported mail clients. }
      - { id: reuse, cost: 5, text: "Complete a reset with a fresh link, then verify reuse cannot change the password again." }
      - { id: expired, cost: 6, text: Advance the test clock beyond expiry and verify the link leaves the password unchanged. }
      - { id: mobile, cost: 4, text: Open the reset form at two viewport widths. }
  - id: layer
    type: single-choice
    prompt: Which layer first proves that a completed reset consumes a persisted link and rejects its reuse?
    choices:
      - { id: manual, text: Manual exploratory }
      - { id: api, text: API }
      - { id: ui, text: UI }
      - { id: unit, text: Unit }
  - id: expiry-layer
    type: single-choice
    prompt: Which layer first covers before, at, and after expiry in the pure time comparison?
    choices:
      - { id: api, text: "API" }
      - { id: ui, text: "UI" }
      - { id: unit, text: "Unit" }
      - { id: manual, text: "Manual exploratory" }
  - id: stop
    type: single-choice
    prompt: Which finding stops the release?
    choices:
      - { id: order, text: Reset emails sort by subject in a test mail client's default view. }
      - { id: copy, text: The reset success message repeats the page heading. }
      - { id: reused, text: Submitting a link already used for a reset changes the password a second time. }
      - { id: expired, text: An expired link takes the user to the documented request-another-link screen. }
  - id: order
    type: ordering
    prompt: Order the checks for one issued link, ending with the state after reuse is refused.
    choices:
      - { id: reuse, text: Submit the original link again with a different candidate password. }
      - { id: request, text: Request a reset for an isolated account and capture the issued link. }
      - { id: confirm, text: Check that the first replacement still works and the second candidate never took effect. }
      - { id: reset, text: Set the first replacement password with that link. }
reference:
  clarify: [resend, expiry]
  risk: [reuse, expired]
  layer: api
  expiry-layer: unit
  stop: reused
  order: [request, reset, reuse, confirm]
decoy:
  clarify: [expiry, sender]
  risk: [inbox, reuse]
  layer: ui
  expiry-layer: api
  stop: reused
  order: [request, reset, reuse, confirm]
---

A membership site sends reset links to a staging test mailbox. Links must expire and can be used only once. The ticket does not say how long a link lasts or what happens when two links are requested.

The release changes how the reset service stores and consumes links. The staging clock is controllable, and the expiry comparison is a pure function. Assume the team answers the open policy questions before you run the smoke checks.
