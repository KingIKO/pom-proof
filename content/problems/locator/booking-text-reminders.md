---
title: Find the checkbox for booking text reminders
kind: locator
topic: playwright
difficulty: easy
minutes: 4
roles: [manual-qa, automation, sdet]
fixture: |
  <fieldset class="css-n27ad">
    <legend>Booking reminders</legend>
    <label class="css-p74hm"><input type="checkbox" data-fixture-target="text-reminders"> Text reminders</label>
    <label class="css-p74hm"><input type="checkbox"> Email reminders</label>
    <p>Reminders go out the day before arrival.</p>
  </fieldset>
target: '[data-fixture-target="text-reminders"]'
variants:
  - name: email-option-first
    fixture: |
      <fieldset class="css-n27ad">
        <legend>Booking reminders</legend>
        <label class="css-p74hm"><input type="checkbox"> Email reminders</label>
        <label class="css-p74hm"><input type="checkbox" data-fixture-target="text-reminders"> Text reminders</label>
        <p>Reminders go out the day before arrival.</p>
      </fieldset>
  - name: option-groups
    fixture: |
      <fieldset class="css-j80xd">
        <legend>Avis de réservation</legend>
        <div><label class="css-g43dn"><input type="checkbox"> Email reminders</label></div>
        <div><label class="css-g43dn"><span>Text reminders</span><input type="checkbox" data-fixture-target="text-reminders"></label></div>
      </fieldset>
reference:
  by: expression
  source: "page.getByLabel('Text reminders', { exact: true })"
decoy: { by: expression, source: "page.getByRole('checkbox').nth(0)" }
---

The booking form lets users choose email reminders and text reminders separately. Find the checkbox input for `Text reminders`. Match the input itself and leave out the label around it.

Only this exercise uses the `data-fixture-target` marker. The app does not include it.
