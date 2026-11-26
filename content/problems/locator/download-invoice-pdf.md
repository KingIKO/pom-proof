---
title: Find the invoice PDF download
kind: locator
syntax: css
topic: playwright
difficulty: easy
minutes: 5
roles: [automation, sdet]
fixture: |
  <section class="css-u496r" aria-label="Invoice IV-638">
    <h2>Invoice IV-638</h2>
    <p>Paid on 8 June</p>
    <div class="css-p057q">
      <a class="css-d464x" href="/billing/iv-638/pdf?key=728b" download="IV-638.pdf" data-fixture-target="invoice-pdf">Download</a>
      <a href="/billing/iv-638/csv?key=430c" download="IV-638.csv">Download</a>
    </div>
  </section>
target: '[data-fixture-target="invoice-pdf"]'
variants:
  - name: refreshed-download-signature
    fixture: |
      <section class="css-u496r" aria-label="Invoice IV-638">
        <h2>Invoice IV-638</h2><p>Paid on 8 June</p>
        <div class="css-p057q">
          <a class="css-a452z" href="/billing/iv-638/pdf?key=99ca" download="IV-638.pdf" data-fixture-target="invoice-pdf">Download</a>
          <a href="/billing/iv-638/csv?key=401b" download="IV-638.csv">Download</a>
        </div>
      </section>
  - name: receipt-inserted
    fixture: |
      <section class="css-v208r" aria-label="Facture IV-638">
        <h2>Facture IV-638</h2><p>Réglée le 8 juin</p>
        <div><a href="/billing/iv-638/receipt?key=0dcc" download="receipt-IV-638.pdf">Télécharger</a></div>
        <footer>
          <a href="/billing/iv-638/csv?key=fa09" download="IV-638.csv">Télécharger</a>
          <a href="/billing/iv-638/pdf?key=133b" download="IV-638.pdf" data-fixture-target="invoice-pdf">Télécharger</a>
        </footer>
      </section>
reference: { by: css, selector: 'a[download="IV-638.pdf"]' }
decoy: { by: css, selector: 'a[href="/billing/iv-638/pdf?key=728b"]' }
---

Use CSS to find the link that downloads `IV-638.pdf`. The filename stays fixed for this invoice. The link's signed URL changes when the page refreshes.

The `data-fixture-target` marker belongs to this exercise and is not part of the app.
