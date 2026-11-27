---
title: Test search suggestions when replies arrive out of order
kind: scenario
topic: search
difficulty: medium
minutes: 8
roles: [automation, sdet, manual-qa]
items:
  - id: clarify
    type: multi-select
    prompt: Which rules affect what stays visible while someone types or clears a search?
    choices:
      - { id: icon, text: "Should the magnifying glass icon in the search box be filled or outlined?" }
      - { id: minimum, text: "How long must a query be to get suggestions, and what happens below that?" }
      - { id: ownership, text: "May old suggestions stay during a new request, and which ones may users still select?" }
      - { id: margins, text: "How much empty space should the design leave around the suggestions panel?" }
  - id: risk
    type: budgeted-pick
    prompt: You have up to 10 minutes. Choose checks for stale suggestions when responses arrive late.
    budget: 10
    choices:
      - { id: out-of-order, cost: 6, text: "Deliver the reply for the current query first and the reply for the older query last." }
      - { id: fixtures, cost: 6, text: "Compare the suggestions shown for common products when every response from the server arrives quickly." }
      - { id: styling, cost: 3, text: "Compare the color used to highlight suggestions in both of the app's color themes." }
      - { id: clear, cost: 4, text: "After clearing the query while a reply is still pending, check that the list stays empty." }
  - id: layer
    type: single-choice
    prompt: Which kind of test first shows that stale suggestions cannot replace the list on screen or change the keyboard selection?
    choices:
      - { id: api, text: "An API test" }
      - { id: unit, text: "A unit test" }
      - { id: ui, text: "An automated UI test" }
      - { id: manual, text: "A manual exploratory test" }
  - id: clear-layer
    type: single-choice
    prompt: After the field is cleared and a held reply arrives, which kind of test first shows that the suggestions on screen stay closed?
    choices:
      - { id: ui, text: "An automated UI test" }
      - { id: api, text: "An API test" }
      - { id: manual, text: "A manual exploratory test" }
      - { id: unit, text: "A unit test" }
  - id: stop
    type: single-choice
    prompt: Which behavior should block the release?
    choices:
      - { id: stale, text: "After the new list appears, a late reply makes Enter open a product from the old query." }
      - { id: no-result, text: "A query that matches nothing shows the documented message for an empty result list." }
      - { id: width, text: "The suggestion list lines up one pixel to the left of the search box." }
      - { id: spinner, text: "A loading spinner appears while the page runs on the approved slow test connection." }
  - id: order
    type: ordering
    prompt: Put the steps in order. The run must see the current list before the stale reply arrives.
    choices:
      - { id: late, text: "Deliver the held reply for the older, shorter query." }
      - { id: current, text: "Type the longer query, deliver its reply, and check that its list is visible." }
      - { id: verify, text: "Check that the current list stays visible and Enter selects its current result." }
      - { id: early, text: "Type the first query that is long enough for suggestions, and hold its reply." }
reference:
  clarify: [minimum, ownership]
  risk: [out-of-order, clear]
  layer: ui
  clear-layer: ui
  stop: stale
  order: [early, current, late, verify]
decoy:
  clarify: [minimum, icon]
  risk: [fixtures, clear]
  layer: ui
  clear-layer: ui
  stop: stale
  order: [early, current, late, verify]
---

An inventory app adds a list of search suggestions that users can pick with the keyboard. Typing can start a new request before the previous one finishes. After the list for the current query appears, replies to older queries must never replace it. A late reply to an older query is called a stale reply. Clearing the search box closes the list and makes every pending reply invalid.

The spec leaves out the shortest query that gets suggestions. It also leaves out what users may still select while the reply for the current query is pending. In the test environment, you can hold each reply and deliver it separately.
