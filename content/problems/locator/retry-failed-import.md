---
title: Find the failed import retry button
kind: locator
syntax: xpath
topic: playwright
difficulty: easy
minutes: 5
roles: [automation, sdet]
fixture: |
  <main>
    <section class="css-w296j" aria-label="Inventory import">
      <h2>Inventory import</h2>
      <p>12 rows could not be read.</p>
      <footer><button data-fixture-target="retry-import">Retry import</button><button>Download log</button></footer>
    </section>
  </main>
target: '[data-fixture-target="retry-import"]'
variants:
  - name: log-button-first
    fixture: |
      <main>
        <section class="css-w296j" aria-label="Inventory import">
          <h2>Inventory import</h2><p>12 rows could not be read.</p>
          <footer><button>Download log</button><button data-fixture-target="retry-import">Retry import</button></footer>
        </section>
      </main>
  - name: action-wrapper
    fixture: |
      <main>
        <section class="css-f414v" aria-label="Inventory import">
          <h2>Import du stock</h2><p>12 lignes sont illisibles.</p>
          <div><footer><button data-fixture-target="retry-import">Retry import</button><button>Télécharger le journal</button></footer></div>
        </section>
      </main>
reference: { by: xpath, selector: "//button[text()='Retry import']" }
decoy: { by: xpath, selector: '/html/body/main/section/footer/button[1]' }
---

Use XPath to find the `Retry import` button in the inventory import failure panel. Its caption remains a direct text node inside the button.

The `data-fixture-target` marker belongs to this exercise and is not part of the app.
