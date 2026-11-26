---
title: Find the enabled resume action for a regional job
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

Use CSS to find the enabled Resume button for the `eu-west` job in the `scheduled` queue. Manual jobs can share the same region, and a locked scheduled job can have a disabled Resume button. The queue and region use stable codes. Action attributes also stay fixed across locales.

The `data-fixture-target` marker belongs to this exercise and is not part of the app.
