---
title: Find the button that closes the open export history dialog
kind: locator
syntax: css
topic: playwright
difficulty: medium
minutes: 6
roles: [automation, sdet]
fixture: |
  <main>
    <dialog open data-panel="exports" class="css-l487c">
      <h2>Export history</h2><p>Last export completed at 09:30.</p>
      <footer><button value="close" data-fixture-target="close-exports">Close</button></footer>
    </dialog>
    <dialog data-panel="filters"><h2>Export filters</h2><button value="close">Close</button></dialog>
  </main>
target: '[data-fixture-target="close-exports"]'
variants:
  - name: closed-copy-preloaded
    fixture: |
      <main>
        <dialog data-panel="exports" class="css-l487c"><h2>Export history</h2><button value="close">Close</button></dialog>
        <dialog open data-panel="exports" class="css-l487c">
          <h2>Export history</h2><p>Last export completed at 09:30.</p>
          <footer><button value="close" data-fixture-target="close-exports">Close</button></footer>
        </dialog>
      </main>
  - name: separate-dialog-layout
    fixture: |
      <main>
        <div><dialog data-panel="exports" class="css-k917b"><h2>Historique des exports</h2><button value="close">Fermer</button></dialog></div>
        <div><dialog open data-panel="exports" class="css-k917b">
          <h2>Historique des exports</h2>
          <div><footer><button value="download">Télécharger</button><button value="close" data-fixture-target="close-exports">Fermer</button></footer></div>
        </dialog></div>
      </main>
reference: { by: css, selector: 'dialog[open][data-panel="exports"] button[value="close"]' }
decoy: { by: css, selector: 'dialog[data-panel="exports"] button[value="close"]' }
---

Use a CSS selector, a pattern that matches page elements, to find the close button in the open export history dialog. A dialog is a panel the app opens for a specific task. The app can load a closed copy in advance and use it the next time someone opens the dialog. The values on the panel and button stay the same across languages and regions.

Only this exercise uses the `data-fixture-target` marker. The app does not include it.
