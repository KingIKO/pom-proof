---
title: Test bookings when the venue's clocks change
kind: scenario
topic: booking
difficulty: hard
minutes: 10
roles: [automation, sdet, senior]
items:
  - id: clarify
    type: multi-select
    prompt: Which answers tell you which appointment times customers can book?
    choices:
      - { id: display, text: "When the device uses a different time zone, which zone does the confirmation show?" }
      - { id: icon, text: "Which calendar icon should appear on the button that books a class?" }
      - { id: marketing, text: "Which city name should appear in the email that announces the launch?" }
      - { id: transitions, text: "How do customers see the missing spring times and the repeated autumn times?" }
  - id: risk
    type: budgeted-pick
    prompt: You have up to 13 minutes. Choose checks that each slot on screen leads to the right instant.
    budget: 13
    choices:
      - { id: gap, cost: 5, text: "Check that no appointment can be selected inside the spring gap of skipped times." }
      - { id: fold, cost: 8, text: "Compare the two repeated autumn slots, then book the second and follow it to confirmation." }
      - { id: format, cost: 5, text: "Compare the month headings in the calendar when it is shown in two languages." }
      - { id: afternoon, cost: 7, text: "Book a normal afternoon appointment in a week that has no clock change." }
  - id: layer
    type: single-choice
    prompt: Which kind of test first checks that the pure conversion helper returns no possible instants for a time in the spring gap?
    choices:
      - { id: api, text: "An API test" }
      - { id: manual, text: "A manual exploratory test" }
      - { id: ui, text: "An automated UI test" }
      - { id: unit, text: "A unit test" }
  - id: fold-layer
    type: single-choice
    prompt: Which kind of test first shows that the two autumn slots on screen can be told apart and that booking the second confirms that slot?
    choices:
      - { id: ui, text: "An automated UI test" }
      - { id: manual, text: "A manual exploratory test" }
      - { id: api, text: "An API test" }
      - { id: unit, text: "A unit test" }
  - id: stop
    type: single-choice
    prompt: Which result should stop the release?
    choices:
      - { id: long, text: "In a narrow window, the time zone label wraps and none of its text is cut off." }
      - { id: wrong-instant, text: "Selecting the second of the repeated slots confirms the instant of the first slot." }
      - { id: gap, text: "The spring calendar leaves out a time that never happens at the venue." }
      - { id: format, text: "For its supported locale (language and region), the confirmation uses a 24-hour clock." }
  - id: order
    type: ordering
    prompt: Put the steps in order. Record the expected instant in a way that does not depend on the service's response.
    choices:
      - { id: compare, text: "Compare the confirmed instant with the expected instant you recorded." }
      - { id: book, text: "Book the slot that is labeled as the second occurrence of that time." }
      - { id: fixture, text: "Load the venue fixture with both autumn occurrences open for booking." }
      - { id: expected, text: "Before booking, record the second occurrence's expected instant using the fixture's time zone." }
reference:
  clarify: [display, transitions]
  risk: [gap, fold]
  layer: unit
  fold-layer: ui
  stop: wrong-instant
  order: [fixture, expected, book, compare]
decoy:
  clarify: [display, marketing]
  risk: [gap, afternoon]
  layer: ui
  fold-layer: api
  stop: wrong-instant
  order: [fixture, book, expected, compare]
---

A class booking app lists appointments in the venue's local time. It hides times that the spring clock change skips. In autumn, the clock repeats some times, so two slots can have the same local time.

When that happens, the user must be able to tell the two slots apart. The selected slot must also keep its exact instant through confirmation. An instant is the single moment in time that a slot stands for, whatever the local clock shows.

The ticket leaves two things open. One is how time zone labels look to customers. The other is how repeated times are marked. Staging has spring and autumn fixtures, which are prepared test data with trusted expected instants. It also has a pure time conversion helper, which returns a result from its inputs alone without calling a service.
