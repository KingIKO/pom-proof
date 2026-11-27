---
title: Which browsers and devices would you test before changing a hotel booking form?
topic: test-design
roles: [manual-qa, automation]
level: mid
type: scenario
oneLine: I'd use our support commitments and booking traffic to decide which browser and device differences to test before release.
looksFor:
  - Use booking data to see which browsers and devices customers use together.
  - Keep testing the combinations the team has promised to support.
  - Test the whole booking on the busiest combination and choose focused checks for the others.
  - Say what you'd still check on a supported browser that few customers use.
trap: Testing only the browsers on the team's laptops and assuming they represent customers.
followUps:
  - question: An iPhone guest can choose Friday for both arrival and departure. Where else would you test those dates?
    answer: >-
      I'd try those dates on another supported touch device and a desktop browser.
      I'd check which lets me choose the dates and which lets me submit them.
      That tells me whether the date control or the booking checks let the bad dates through.
sources:
  - label: MDN, audience and target platforms
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Testing/Introduction
  - label: MDN, browser and device differences in native date inputs
    url: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date
---

I'd start with the controls we're changing. The native date picker is the date control the browser provides, so it can look different across systems. I'd check that I can choose the same stay across browser engines, the parts that draw pages and run their code. I'd try a touch screen too. On narrow screens, I'd check that I can still see the price and reach the submit button.

I'd use booking traffic to decide where to test the whole booking, including recovery after a failed payment. I'd count visitors who never reach confirmation too. I'd check that I can book on every supported browser and device pairing, even if few visitors use it. I'd add focused checks for a customer commitment or a difference the traffic data doesn't show.

### Example

If mobile Safari dominates booking traffic, I'd test valid dates and date changes on a real iPhone. I'd also check that a guest can recover from a failed payment. On other engines, I'd focus on the native picker and date limits. I'd check that a guest on a supported browser with few users can still finish booking.
