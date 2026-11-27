---
title: Which browsers and devices would you test before changing a hotel booking form?
topic: test-design
roles: [manual-qa, automation]
level: mid
type: scenario
oneLine: Use the support promise and booking traffic to decide which device differences need release evidence.
looksFor:
  - Uses browser and device pairings from journey analytics.
  - Preserves explicit support commitments.
  - Uses the busiest booking journey for a full rehearsal and selects targeted checks for other pairings.
  - Names what would still be checked on a low-share supported browser.
trap: Picking the browsers on the team's laptops and calling that representative coverage.
followUps:
  - question: On iPhone, a guest can pick Friday for both arrival and departure. Where else would you try that?
    answer: >-
      I'd try the same dates on another supported touch device and a desktop browser. I'd check
      which lets me pick the invalid dates and which lets me submit them. That separates a picker
      difference from a booking validation gap.
sources:
  - label: MDN, audience and target platforms
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Testing/Introduction
  - label: MDN, browser and device differences in native date inputs
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date
---

I'd start with the controls we're changing. The native date picker can look different across
systems, so I'd check that the same stay can be selected with different engines and on a touch
screen. On narrow layouts I'd make sure the price and submit action remain reachable.

Booking traffic tells me where to rehearse the whole journey, including payment recovery. I'd
count visitors who don't reach confirmation too. For each supported pairing I still want evidence
that someone can make a booking, even on a browser with few visits. I can add targeted checks
for a customer commitment or a difference that analysis misses.

### Example

If mobile Safari dominates, I'd test valid dates, changed dates and recovery from a failed payment
on a real iPhone. I'd target the native picker and date limits on other engines and check that a
customer on a low-share supported browser can still finish a booking.
