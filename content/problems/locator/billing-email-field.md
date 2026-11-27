---
title: Find the billing email field
kind: locator
syntax: playwright
topic: playwright
difficulty: easy
minutes: 4
roles: [manual-qa, automation, sdet]
fixture: |
  <form aria-label="Payment contacts">
    <div class="css-c18n2">
      <label for="contact-891">Billing email</label>
      <input id="contact-891" data-fixture-target="billing-email" type="email" autocomplete="billing email">
      <small>Receipts go to this address.</small>
    </div>
    <div class="css-c18n2">
      <label for="contact-892">Account email</label>
      <input id="contact-892" type="email" autocomplete="email">
    </div>
  </form>
target: '[data-fixture-target="billing-email"]'
variants:
  - name: regenerated-field-ids
    fixture: |
      <form aria-label="Payment contacts">
        <div class="css-v33n4">
          <label for="contact-951">Billing email</label>
          <input id="contact-951" data-fixture-target="billing-email" type="email" autocomplete="billing email">
          <small>Receipts go to this address.</small>
        </div>
        <div class="css-v33n4">
          <label for="contact-952">Account email</label><input id="contact-952" type="email" autocomplete="email">
        </div>
      </form>
  - name: reversed-with-input-wrapper
    fixture: |
      <form aria-label="Contacts de paiement">
        <div class="css-v33n4">
          <label for="contact-967">Account email</label><input id="contact-967" type="email" autocomplete="email">
        </div>
        <div class="css-v33n4">
          <label for="contact-966">Billing email</label>
          <div><input id="contact-966" data-fixture-target="billing-email" type="email" autocomplete="billing email"></div>
          <small>Les reçus sont envoyés ici.</small>
        </div>
      </form>
reference:
  by: expression
  source: "page.getByLabel('Billing email', { exact: true })"
decoy: { by: expression, source: "page.locator('#contact-891')" }
---

Payment settings keep two email addresses: the billing email for receipts and the account email. Write a Playwright locator, code that starts with `page.` and finds an element, to find the input labeled `Billing email`. The input IDs and the labels' matching `for` attributes may change together.

Only this exercise uses the `data-fixture-target` marker. The app does not include it.
