---
title: Find the paper statement delivery summary
kind: locator
topic: playwright
difficulty: medium
minutes: 7
roles: [automation, sdet]
fixture: |
  <section class="css-o257h" aria-label="Statement settings">
    <h2>Delivery preferences</h2>
    <dl class="css-w814e">
      <dt>Paper statement</dt><dd data-fixture-target="paper-summary">Mail to billing address</dd>
      <dt>Electronic statement</dt><dd>Send to account email</dd>
    </dl>
  </section>
target: '[data-fixture-target="paper-summary"]'
variants:
  - name: delivery-options-reordered
    fixture: |
      <section class="css-o257h" aria-label="Statement settings">
        <h2>Delivery preferences</h2>
        <dl class="css-w814e">
          <dt>Electronic statement</dt><dd>Send to account email</dd>
          <dt>Paper statement</dt><dd data-fixture-target="paper-summary">Mail to billing address</dd>
        </dl>
      </section>
  - name: grouped-terms-with-translated-values
    fixture: |
      <section class="css-t606v" aria-label="Préférences de relevé">
        <h2>Préférences d’envoi</h2>
        <dl class="css-g274p">
          <div><dt>Electronic statement</dt><dd>Par e-mail</dd></div>
          <div><dt>Paper <span>statement</span></dt><dd data-fixture-target="paper-summary">Par courrier postal</dd></div>
        </dl>
      </section>
reference: { by: xpath, selector: "//dt[normalize-space(.)='Paper statement']/following-sibling::*[1][self::dd]" }
decoy: { by: xpath, selector: '//dl/dd[1]' }
---

Use XPath to find the `dd` immediately after the term `Paper statement`. Its description may be translated, and each term and description may be wrapped together in a `div`.

The `data-fixture-target` marker belongs to this exercise and is not part of the app.
