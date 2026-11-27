---
title: Find the Resume button users can click for a scheduled job
kind: locator
syntax: css
topic: playwright
difficulty: hard
minutes: 8
roles: [automation, sdet, senior]
fixture: |
  <table class="css-s758q">
    <caption>Data sync jobs</caption>
    <tbody data-queue="scheduled">
      <tr><th scope="row">Catalog sync</th><td data-field="region" data-code="eu-west">EU West</td><td><button data-action="resume" data-fixture-target="resume-scheduled-west">Resume</button><button data-action="details">Details</button></td></tr>
      <tr><th scope="row">Catalog sync</th><td data-field="region" data-code="eu-north">EU North</td><td><button data-action="resume">Resume</button></td></tr>
    </tbody>
  </table>
target: '[data-fixture-target="resume-scheduled-west"]'
variants:
  - name: manual-queue-and-reordered-jobs
    fixture: |
      <table class="css-s758q">
        <caption>Data sync jobs</caption>
        <tbody data-queue="manual">
          <tr><th scope="row">Catalog sync</th><td data-field="region" data-code="eu-west">EU West</td><td><button data-action="resume">Resume</button></td></tr>
        </tbody>
        <tbody data-queue="scheduled">
          <tr><th scope="row">Catalog sync</th><td data-field="region" data-code="eu-north">EU North</td><td><button data-action="resume">Resume</button></td></tr>
          <tr><th scope="row">Catalog sync</th><td data-field="region" data-code="eu-west">EU West</td><td><button data-action="resume" data-fixture-target="resume-scheduled-west">Resume</button></td></tr>
        </tbody>
      </table>
  - name: locked-run-and-localized-actions
    fixture: |
      <table class="css-n295m">
        <caption>Tâches de synchronisation</caption>
        <tbody data-queue="scheduled">
          <tr><th scope="row">Catalog sync</th><td data-field="region" data-code="eu-west">UE Ouest</td><td><button data-action="resume" disabled>Reprendre</button><small>Verrouillé</small></td></tr>
          <tr><th scope="row">Catalog sync</th><td data-field="region" data-code="eu-west">UE Ouest</td><td><div><button data-action="details">Détails</button><button data-action="resume" data-fixture-target="resume-scheduled-west">Reprendre</button></div></td></tr>
          <tr><th scope="row">Catalog sync</th><td data-field="region" data-code="eu-north">UE Nord</td><td><button data-action="resume">Reprendre</button></td></tr>
        </tbody>
      </table>
reference: { by: css, selector: 'tbody[data-queue="scheduled"] tr:has(> td[data-field="region"][data-code="eu-west"]) button[data-action="resume"]:enabled' }
decoy: { by: css, selector: 'tbody[data-queue="scheduled"] tr:first-child button[data-action="resume"]' }
---

Use a CSS selector, a pattern that matches page elements, to find the Resume button users can click. Look for the `eu-west` job in the `scheduled` queue, the list of scheduled jobs. Manual jobs can share that region. A locked scheduled job can show a disabled Resume button.

The codes for the queue and region stay the same. The values that identify button actions also stay the same across languages and regions.

Only this exercise uses the `data-fixture-target` marker. The app does not include it.
