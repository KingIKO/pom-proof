---
title: Find the pickup location search
kind: locator
topic: playwright
difficulty: easy
minutes: 4
roles: [manual-qa, automation, sdet]
fixture: |
  <section aria-label="Pickup locations">
    <header><h2>Choose a pickup point</h2></header>
    <div class="css-z708s"><input id="lookup-101" type="search" aria-label="Location" placeholder="City or postcode" data-fixture-target="pickup-search"></div>
    <div class="css-z708s"><input id="lookup-102" type="search" aria-label="Order number" placeholder="Order number"></div>
  </section>
target: '[data-fixture-target="pickup-search"]'
variants:
  - name: order-lookup-first
    fixture: |
      <section aria-label="Pickup locations">
        <header><h2>Choose a pickup point</h2></header>
        <div class="css-z708s"><input id="lookup-210" type="search" aria-label="Order number" placeholder="Order number"></div>
        <div class="css-z708s"><input id="lookup-211" type="search" aria-label="Location" placeholder="City or postcode" data-fixture-target="pickup-search"></div>
      </section>
  - name: pickup-and-return-tools
    fixture: |
      <section aria-label="Points de retrait">
        <header><h2>Choisir un point de retrait</h2></header>
        <div class="css-s503u"><input id="lookup-418" type="search" aria-label="Return location" placeholder="City or postcode for returns"></div>
        <div class="css-s503u"><div><input id="lookup-419" type="search" aria-label="Pickup location" placeholder="City or postcode" data-fixture-target="pickup-search"></div></div>
      </section>
reference:
  by: expression
  source: "page.getByPlaceholder('City or postcode', { exact: true })"
decoy: { by: expression, source: "page.getByRole('searchbox').nth(0)" }
---

Find the pickup search input using its placeholder `City or postcode`. The return lookup may use the longer placeholder `City or postcode for returns`.

The `data-fixture-target` marker belongs to this exercise and is not part of the app.
