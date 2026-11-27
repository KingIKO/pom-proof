---
title: Find Region in the delivery address form
kind: locator
topic: playwright
difficulty: medium
minutes: 6
roles: [manual-qa, automation, sdet]
fixture: |
  <form class="css-j530f">
    <fieldset>
      <legend>Delivery address</legend>
      <label for="region-638">Region</label><input id="region-638" data-fixture-target="delivery-region" value="West">
      <p>Used to estimate delivery dates.</p>
    </fieldset>
    <fieldset>
      <legend>Billing address</legend>
      <label for="region-639">Region</label><input id="region-639" value="North">
    </fieldset>
  </form>
target: '[data-fixture-target="delivery-region"]'
variants:
  - name: billing-first
    fixture: |
      <form class="css-j530f">
        <fieldset><legend>Billing address</legend><label for="region-911">Region</label><input id="region-911" value="North"></fieldset>
        <fieldset><legend>Delivery address</legend><label for="region-912">Region</label><input id="region-912" data-fixture-target="delivery-region" value="West"></fieldset>
      </form>
  - name: delivery-extra-field
    fixture: |
      <form class="css-t308a">
        <fieldset><legend>Delivery address</legend>
          <div><label>Region code <input value="W"></label></div>
          <div><label for="region-946">Region</label><input id="region-946" data-fixture-target="delivery-region" value="West"></div>
          <p>Pour calculer le délai de livraison.</p>
        </fieldset>
        <fieldset><legend>Billing address</legend><label>Region <input value="North"></label></fieldset>
      </form>
reference:
  by: expression
  source: "page.getByRole('group', { name: 'Delivery address', exact: true }).getByLabel('Region', { exact: true })"
decoy: { by: expression, source: "page.getByLabel('Region', { exact: true }).nth(0)" }
---

The checkout form has separate groups for delivery and billing addresses. Find the input labeled `Region` in the group named `Delivery address`. The billing address also has a `Region` label. The delivery group can also show `Region code`.

Only this exercise uses the `data-fixture-target` marker. The app does not include it.
