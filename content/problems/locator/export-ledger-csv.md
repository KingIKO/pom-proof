---
title: Find the ledger CSV export
kind: locator
topic: playwright
difficulty: easy
minutes: 4
roles: [automation, sdet]
fixture: |
  <section aria-label="Ledger exports">
    <h2>June ledger</h2>
    <div class="css-p024a" id="exports-377">
      <button type="button" data-testid="ledger-export-csv" data-fixture-target="ledger-csv">Export</button>
      <button type="button" data-testid="ledger-export-pdf">Export</button>
    </div>
    <p>CSV and PDF exports include settled charges.</p>
  </section>
target: '[data-fixture-target="ledger-csv"]'
variants:
  - name: pdf-first
    fixture: |
      <section aria-label="Ledger exports">
        <h2>June ledger</h2>
        <div class="css-p024a" id="exports-381">
          <button type="button" data-testid="ledger-export-pdf">Export</button>
          <button type="button" data-testid="ledger-export-csv" data-fixture-target="ledger-csv">Export</button>
        </div>
        <p>CSV and PDF exports include settled charges.</p>
      </section>
  - name: separate-format-groups
    fixture: |
      <section aria-label="Exports du grand livre">
        <h2>Grand livre de juin</h2>
        <div class="css-u876b" id="exports-394">
          <div><button type="button" data-testid="ledger-export-xlsx">Exporter</button></div>
          <div><button type="button" data-testid="ledger-export-csv" data-fixture-target="ledger-csv">Exporter</button></div>
          <div><button type="button" data-testid="ledger-export-pdf">Exporter</button></div>
        </div>
      </section>
reference:
  by: expression
  source: "page.getByTestId('ledger-export-csv')"
decoy: { by: expression, source: "page.getByRole('button', { name: 'Export', exact: true }).nth(0)" }
---

The ledger toolbar uses the same button text for several formats. Find the CSV export using the app's test ID contract. The format test IDs stay the same across layouts and locales.

The `data-fixture-target` marker belongs to this exercise and is not part of the app.
