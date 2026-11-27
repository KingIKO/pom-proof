---
title: Test notices and emails when a shipment event repeats
kind: scenario
topic: notifications
difficulty: medium
minutes: 8
roles: [manual-qa, automation, sdet]
items:
  - id: clarify
    type: multi-select
    prompt: Which rules would you confirm before you test duplicate shipment events?
    choices:
      - { id: key, text: "When a delivery is repeated, which event ID marks it as one notification?" }
      - { id: icon, text: "Should the shipment notification show a truck icon or a box icon?" }
      - { id: prefs, text: "When are email preferences checked, and do they also apply to the inbox in the app?" }
      - { id: length, text: "How many characters fit in the preview text of the email?" }
  - id: risk
    type: budgeted-pick
    prompt: You have up to 12 minutes. Choose checks for messages that are duplicated or sent wrongly in either channel.
    budget: 12
    choices:
      - { id: render, cost: 5, text: "Compare the layout of the shipment email in two different mail clients." }
      - { id: repeat, cost: 7, text: "Replay the event ID for one member with email on, and check the mailbox and inbox counts." }
      - { id: opt-out, cost: 5, text: "Send a new event for a member who opted out, and check both channels." }
      - { id: subject, cost: 4, text: "Check how the shipment subject line is capitalized in two locales (language settings)." }
  - id: layer
    type: single-choice
    prompt: After one event is replayed, which kind of test first checks the real worker and both message counts?
    choices:
      - { id: manual, text: "A manual exploratory test" }
      - { id: ui, text: "An automated UI test" }
      - { id: api, text: "An API test" }
      - { id: unit, text: "A unit test" }
  - id: preference-layer
    type: single-choice
    prompt: Which kind of test first covers the pure rule that turns saved preferences into the allowed channels?
    choices:
      - { id: ui, text: "An automated UI test" }
      - { id: unit, text: "A unit test" }
      - { id: api, text: "An API test" }
      - { id: manual, text: "A manual exploratory test" }
  - id: stop
    type: single-choice
    prompt: Which result should stop the rollout?
    choices:
      - { id: delay, text: "The test mailbox gets an allowed message in four seconds, within its five-second target." }
      - { id: duplicate, text: "One event ID sends two shipment emails to the same member with email on." }
      - { id: copy, text: "The footer of the email uses the short support link that was approved." }
      - { id: sort, text: "As specified, the inbox in the app sorts two separate shipments by arrival time." }
  - id: order
    type: ordering
    prompt: Put the replay steps in order, so that any duplicate can be traced to the second delivery.
    choices:
      - { id: replay, text: "Replay the same event ID and wait for the replay job to finish." }
      - { id: prefs, text: "Turn on shipment email for a member whose test inboxes are empty." }
      - { id: first, text: "Process the event once, and save the starting mailbox and inbox counts." }
      - { id: check, text: "Compare the final message IDs and counts with the starting ones." }
reference:
  clarify: [key, prefs]
  risk: [repeat, opt-out]
  layer: api
  preference-layer: unit
  stop: duplicate
  order: [prefs, first, replay, check]
decoy:
  clarify: [key, length]
  risk: [repeat, render]
  layer: ui
  preference-layer: api
  stop: duplicate
  order: [prefs, first, replay, check]
---

Each shipment event creates one notice in the app. If the member has shipment email turned on, the event also creates one email. The event system may deliver the same event more than once. A repeated delivery must not create a second notice or a second email. A member who opted out of email still gets the notice in the app.

The ticket leaves out the event identity contract, the rule for what makes two deliveries the same event. It also leaves out when the worker, the background job that processes events, reads preferences. Staging provides an event API, a signal when a job completes, and fixture mailboxes for testing. The choice of channels can also run as a pure function, with no outside calls.
