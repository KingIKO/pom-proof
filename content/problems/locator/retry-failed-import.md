---
title: Find the button that retries a failed inventory import
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

Use XPath, a language for finding elements in a page, to find the `Retry import` button in the panel for a failed inventory import. The caption stays as text directly inside the button. The app does not put that text inside another element within the button.

Only this exercise uses the `data-fixture-target` marker. The app does not include it.
