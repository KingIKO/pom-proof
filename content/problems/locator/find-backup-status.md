---
title: Find a waiting backup status
kind: locator
topic: playwright
difficulty: easy
minutes: 5
roles: [automation, sdet]
fixture: |
  <section aria-label="Backup jobs">
    <h2>Daily backups</h2>
    <ul class="css-y417b">
      <li><strong>Warehouse</strong> <span class="css-j831a" data-fixture-target="waiting-backup">Waiting for storage</span></li>
      <li><strong>Billing</strong> <span class="css-j831a">Complete</span></li>
    </ul>
  </section>
target: '[data-fixture-target="waiting-backup"]'
variants:
  - name: changed-sort-and-spacing
    fixture: |
      <section aria-label="Backup jobs">
        <h2>Daily backups</h2>
        <ul class="css-y417b">
          <li><strong>Billing</strong> <span class="css-j831a">Complete</span></li>
          <li><strong>Warehouse</strong> <span class="css-j831a" data-fixture-target="waiting-backup">
            Waiting   for storage
          </span></li>
        </ul>
      </section>
  - name: nested-status-caption
    fixture: |
      <section aria-label="Sauvegardes">
        <h2>Sauvegardes quotidiennes</h2>
        <ul class="css-v824x">
          <li><strong>Analytics</strong> <span class="css-n143m">Waiting for storage approval</span></li>
          <li><strong>Warehouse</strong> <span class="css-n143m" data-fixture-target="waiting-backup">Waiting for <strong>storage</strong></span></li>
        </ul>
      </section>
reference: { by: xpath, selector: "//span[normalize-space(.)='Waiting for storage']" }
decoy: { by: xpath, selector: "//ul/li[1]/span" }
---

Use XPath to find the status `span` whose full caption is `Waiting for storage`. A revised status component can add whitespace or put part of the caption inside another element. A separate status may say `Waiting for storage approval`.

The `data-fixture-target` marker belongs to this exercise and is not part of the app.
