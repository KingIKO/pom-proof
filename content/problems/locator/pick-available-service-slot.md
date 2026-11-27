---
title: Find the service slot a user can still select
kind: locator
syntax: css
topic: playwright
difficulty: medium
minutes: 6
roles: [automation, sdet]
fixture: |
  <fieldset class="css-m481s">
    <legend>Repair slots</legend>
    <label><input type="radio" name="service-slot" value="slot-1400" data-fixture-target="slot-1400"> 14:00</label>
    <label><input type="radio" name="service-slot" value="slot-1530"> 15:30</label>
    <p>All times are local.</p>
  </fieldset>
target: '[data-fixture-target="slot-1400"]'
variants:
  - name: booked-session-shown-first
    fixture: |
      <fieldset class="css-m481s">
        <legend>Repair slots</legend>
        <label><input type="radio" name="service-slot" value="slot-1400" disabled> 14:00, booked</label>
        <label><input type="radio" name="service-slot" value="slot-1400" data-fixture-target="slot-1400"> 14:00</label>
        <label><input type="radio" name="service-slot" value="slot-1530"> 15:30</label>
      </fieldset>
  - name: translated-slot-groups
    fixture: |
      <fieldset class="css-v481d">
        <legend>Créneaux de réparation</legend>
        <div><label><input type="radio" name="service-slot" value="slot-1530"> 15 h 30</label></div>
        <div><label><input type="radio" name="service-slot" value="slot-1400" data-fixture-target="slot-1400"> 14 h</label></div>
        <fieldset disabled>
          <legend>Équipe déjà réservée</legend>
          <label><input type="radio" name="service-slot" value="slot-1400"> 14 h, réservé</label>
        </fieldset>
      </fieldset>
      <fieldset disabled><legend>Sample scheduling settings</legend><label><input type="radio" name="preview-slot" value="slot-1400"> 14 h</label></fieldset>
reference: { by: css, selector: 'input[type="radio"][name="service-slot"][value="slot-1400"]:enabled' }
decoy: { by: css, selector: 'input[name="service-slot"][value="slot-1400"]' }
---

Use a CSS selector, a pattern that matches page elements, to find the 14:00 option in `service-slot` that users can still select. The time choices are radio inputs, which let the user pick one option from the group. The app stores the same time value for every repair team at that hour.

Booked options stay in the list. The app can disable the input itself or its fieldset, the container that groups form controls.

Only this exercise uses the `data-fixture-target` marker. The app does not include it.
