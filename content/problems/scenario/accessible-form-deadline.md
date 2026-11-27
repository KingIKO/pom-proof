---
title: Scope form accessibility under a deadline
kind: scenario
topic: accessibility
difficulty: hard
minutes: 11
roles: [manual-qa, sdet, senior]
items:
  - id: clarify
    type: multi-select
    prompt: Which questions affect what you can test in the time left?
    choices:
      - { id: environment, text: "Which combination of assistive tools does the form support for these users?" }
      - { id: website, text: "Which marketing page should add a link to the benefits form next quarter?" }
      - { id: recovery, text: "How should the keyboard and screen reader help users correct an invalid submission?" }
      - { id: roadmap, text: "When will the other pages on the site use the same colors?" }
  - id: risk
    type: budgeted-pick
    prompt: You have up to 15 minutes. Choose checks for completing the form and fixing an input error without a pointer.
    budget: 15
    choices:
      - { id: matrix, cost: 9, text: "Use a pointer to submit valid forms several times across desktop browsers." }
      - { id: keyboard, cost: 6, text: "Use only the keyboard to enter data, submit with an error, fix it, and submit successfully." }
      - { id: reader, cost: 9, text: "Use the supported screen reader to find the invalid field and complete the corrected form." }
      - { id: glyphs, cost: 5, text: "Compare the decorative icons on the changed page with those on nearby pages." }
  - id: layer
    type: single-choice
    prompt: Which kind of test first checks what a person hears from the supported screen reader while fixing an error?
    choices:
      - { id: api, text: "An API test" }
      - { id: manual, text: "A manual exploratory test" }
      - { id: unit, text: "A unit test" }
      - { id: ui, text: "An automated UI test" }
  - id: keyboard-layer
    type: single-choice
    prompt: Which kind of repeatable test should press Tab and check whether focus reaches the invalid field?
    choices:
      - { id: ui, text: "An automated UI test" }
      - { id: manual, text: "A manual exploratory test" }
      - { id: unit, text: "A unit test" }
      - { id: api, text: "An API test" }
  - id: stop
    type: single-choice
    prompt: Which finding should stop this release?
    choices:
      - { id: duplicate, text: "The error summary and its linked field both show the same error, as required." }
      - { id: zoom, text: "At the supported zoom level, the field label wraps and all its text stays visible." }
      - { id: trap, text: "After an invalid submission, keyboard focus stays in the summary and never reaches the fields." }
      - { id: copy, text: "On successful submission, the form shows the short message that the team approved." }
  - id: order
    type: ordering
    prompt: Put the test steps in order from invalid submission to success.
    choices:
      - { id: notice, text: "Check where focus lands. Listen to the announced error to find the invalid field." }
      - { id: success, text: "Submit the corrected form with the keyboard and check that the form confirms success." }
      - { id: invalid, text: "Use the keyboard to fill the required fields with one known invalid value, then submit." }
      - { id: repair, text: "Follow the form's error recovery steps by keyboard to reach the field and correct it." }
reference:
  clarify: [environment, recovery]
  risk: [keyboard, reader]
  layer: manual
  keyboard-layer: ui
  stop: trap
  order: [invalid, notice, repair, success]
decoy:
  clarify: [environment, website]
  risk: [matrix, keyboard]
  layer: ui
  keyboard-layer: ui
  stop: trap
  order: [invalid, repair, notice, success]
---

A benefits form changed its validation summary, the list of errors it shows after an invalid submission. A user with a keyboard and the supported screen reader must be able to find the invalid field and reach it. They must then be able to fix it and submit. This release offers only one way to submit.

You have 15 minutes before the release decision. The device is ready. The product team has yet to share the full notes on what the form must do.
