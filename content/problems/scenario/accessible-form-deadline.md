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
    prompt: Which questions change the scope of the remaining time?
    choices:
      - { id: environment, text: "Which assistive-technology pairing is supported for the affected users?" }
      - { id: website, text: "Which marketing page should link to the form next quarter?" }
      - { id: recovery, text: "What keyboard and screen reader behavior is needed to correct an invalid submission?" }
      - { id: roadmap, text: "When will the rest of the site adopt the same color palette?" }
  - id: risk
    type: budgeted-pick
    prompt: Spend up to 15 minutes on completing the form and recovering from an input error without a pointer.
    budget: 15
    choices:
      - { id: matrix, cost: 9, text: "Repeat valid submissions with a pointer across desktop browsers." }
      - { id: keyboard, cost: 6, text: "Run the keyboard-only path from entry through invalid submission, correction, and success." }
      - { id: reader, cost: 9, text: "Use the supported screen reader to identify the invalid field and complete the corrected form." }
      - { id: glyphs, cost: 5, text: "Compare decorative icons across the changed page and its neighbors." }
  - id: layer
    type: single-choice
    prompt: Which layer first verifies what a person actually hears during recovery with the supported screen reader?
    choices:
      - { id: api, text: "API" }
      - { id: manual, text: "Manual exploratory" }
      - { id: unit, text: "Unit" }
      - { id: ui, text: "UI automation" }
  - id: keyboard-layer
    type: single-choice
    prompt: Which layer should own a repeatable regression that drives Tab and checks whether browser focus reaches the invalid field?
    choices:
      - { id: ui, text: "UI automation" }
      - { id: manual, text: "Manual exploratory" }
      - { id: unit, text: "Unit" }
      - { id: api, text: "API" }
  - id: stop
    type: single-choice
    prompt: Which finding blocks the candidate release?
    choices:
      - { id: duplicate, text: "The invalid summary and linked field both identify the same error as required." }
      - { id: zoom, text: "The field label wraps without losing text at the supported zoom level." }
      - { id: trap, text: "After an invalid submit, keyboard focus is trapped in the summary and cannot reach the fields." }
      - { id: copy, text: "The success message uses the approved short wording." }
  - id: order
    type: ordering
    prompt: Order a test that follows the user from invalid submission back to success.
    choices:
      - { id: notice, text: "Observe where focus lands and identify the invalid field from the announced error." }
      - { id: success, text: "Resubmit with the keyboard and verify the confirmation." }
      - { id: invalid, text: "Fill the required fields by keyboard except for one known invalid value, then submit." }
      - { id: repair, text: "Use the error recovery path to reach and correct the field by keyboard." }
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

A benefits form changed its validation summary. The candidate release must let someone using a keyboard and the supported screen reader identify an invalid field, reach it, correct it, and submit. There is no alternate submission route for this release.

You have 15 minutes before the release decision. The device is ready. Product has not yet supplied the complete acceptance notes.
