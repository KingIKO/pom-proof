---
title: Test when a password reset link stops working
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
      - { id: resend, text: "Does asking for a new link stop older unused links from working?" }
      - { id: sender, text: "Should the sender name show the product name or the company name?" }
      - { id: logo, text: "Which logo size should the email use on mobile screens?" }
      - { id: expiry, text: "How long is a link valid, and when does that time start?" }
  - id: risk
    type: budgeted-pick
    prompt: You have up to 11 minutes. Choose checks for whether an invalid link can change a password.
    budget: 11
    choices:
      - { id: inbox, cost: 6, text: "Send an ordinary reset email to accounts in two supported mail clients and read each one." }
      - { id: reuse, cost: 5, text: "After resetting with a fresh link, check that reusing it cannot change the password again." }
      - { id: expired, cost: 6, text: "Move the test clock past expiry and check that the link leaves the password unchanged." }
      - { id: mobile, cost: 4, text: "Open the reset form at two different screen widths and look at the layout." }
  - id: layer
    type: single-choice
    prompt: Which kind of test first shows that a completed reset marks the stored link as used and rejects any reuse?
    choices:
      - { id: manual, text: "A manual exploratory test" }
      - { id: api, text: "An API test" }
      - { id: ui, text: "An automated UI test" }
      - { id: unit, text: "A unit test" }
  - id: expiry-layer
    type: single-choice
    prompt: Which kind of test first covers times before, at, and after expiry in the pure time comparison?
    choices:
      - { id: api, text: "An API test" }
      - { id: ui, text: "An automated UI test" }
      - { id: unit, text: "A unit test" }
      - { id: manual, text: "A manual exploratory test" }
  - id: stop
    type: single-choice
    prompt: Which finding should stop the release?
    choices:
      - { id: order, text: "In the default view of a test mail client, reset emails sort by subject." }
      - { id: copy, text: "The message shown after a successful reset repeats the page heading." }
      - { id: reused, text: "Submitting a link already used for a reset changes the password a second time." }
      - { id: expired, text: "An expired link takes the user to the documented screen for requesting another link." }
  - id: order
    type: ordering
    prompt: Put the checks for one issued link in order. End with the state after the reuse is refused.
    choices:
      - { id: reuse, text: "Submit the original link again with a different proposed password." }
      - { id: request, text: "Request a reset for an account used only by this test, and save the issued link." }
      - { id: confirm, text: "Check that the first new password still works and the second one never took effect." }
      - { id: reset, text: "Use that link to set the first new password." }
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

A membership site sends password reset links to a test mailbox in staging. Each link must expire, and it can be used only once. The ticket does not say how long a link lasts. It also does not say what happens when someone requests two links.

This release changes how the reset service stores links and marks them as used. In staging, you can control the clock. The expiry comparison is a pure function, so it works from its inputs alone. Assume the team answers the open policy questions before you run the smoke checks, which are quick checks of the key paths.
