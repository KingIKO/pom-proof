---
title: Find the link that downloads the invoice PDF
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

Use a CSS selector, a pattern that matches page elements, to find the link that downloads `IV-638.pdf`. The filename stays the same for this invoice. The signed URL, the web address with access details, changes when the page reloads.

Only this exercise uses the `data-fixture-target` marker. The app does not include it.
