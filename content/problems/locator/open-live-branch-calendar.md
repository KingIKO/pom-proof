---
title: Find the visible appointment calendar action
kind: locator
topic: playwright
difficulty: medium
minutes: 6
roles: [automation, sdet]
fixture: |
  <section aria-label="Branch appointments">
    <h2>South Quay branch</h2>
    <div class="css-f342b"><button aria-label="Open South Quay calendar" data-fixture-target="live-calendar">Calendar</button></div>
    <div><button aria-label="Open South Quay holiday calendar">Holidays</button></div>
  </section>
target: '[data-fixture-target="live-calendar"]'
variants:
  - name: collapsed-desktop-copy
    fixture: |
      <section aria-label="Branch appointments">
        <h2>South Quay branch</h2>
        <div hidden><button aria-label="Open South Quay calendar">Calendar</button></div>
        <div class="css-f342b"><div><button aria-label="Open South Quay calendar" data-fixture-target="live-calendar">Calendar</button></div></div>
        <div><button aria-label="Open South Quay holiday calendar">Holidays</button></div>
      </section>
  - name: compact-layout-hidden-copy
    fixture: |
      <style>.inactive-layout { display: none; }</style>
      <section aria-label="Rendez-vous en agence">
        <h2>Agence de South Quay</h2>
        <div class="inactive-layout"><button aria-label="Open South Quay calendar">Calendar</button></div>
        <div class="css-d782p"><button aria-label="Open South Quay holiday calendar">Jours fériés</button></div>
        <footer><button aria-label="Open South Quay calendar" data-fixture-target="live-calendar">Calendrier</button></footer>
      </section>
reference:
  by: expression
  source: "page.getByRole('button', { name: 'Open South Quay calendar', exact: true })"
decoy: { by: css, selector: 'button[aria-label="Open South Quay calendar"]' }
---

Find the visible action named `Open South Quay calendar`. The app can keep an alternate layout in the DOM with a duplicate button. That layout is hidden as a whole. The holiday calendar is a separate action.

The `data-fixture-target` marker belongs to this exercise and is not part of the app.
