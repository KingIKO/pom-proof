---
title: Find the available service slot input
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

Use CSS to find the enabled 14:00 radio input in `service-slot`. The app stores the same time value for every repair team at that hour. Booked inputs stay in the list and can be disabled individually or through their fieldset.

The `data-fixture-target` marker belongs to this exercise and is not part of the app.
