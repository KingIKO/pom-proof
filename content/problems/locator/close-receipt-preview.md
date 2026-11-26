---
title: Find the receipt preview close button
kind: locator
topic: playwright
difficulty: easy
minutes: 4
roles: [manual-qa, automation, sdet]
fixture: |
  <aside class="css-r152f" aria-label="Receipt preview">
    <header>
      <h2>Receipt C-372</h2>
      <button class="css-x184h" type="button" aria-label="Close receipt preview" data-fixture-target="close-receipt"><span aria-hidden="true">×</span></button>
    </header>
    <div><button type="button" aria-label="Download receipt"><span aria-hidden="true">↓</span></button></div>
  </aside>
target: '[data-fixture-target="close-receipt"]'
variants:
  - name: new-icon-build
    fixture: |
      <aside class="css-d083r" aria-label="Receipt preview">
        <header>
          <h2>Receipt C-372</h2>
          <button class="css-s274v" type="button" aria-label="Close receipt preview" data-fixture-target="close-receipt"><span aria-hidden="true">×</span></button>
        </header>
        <div><button type="button" aria-label="Download receipt"><span aria-hidden="true">↓</span></button></div>
      </aside>
  - name: footer-with-dismiss-action
    fixture: |
      <aside class="css-r152f" aria-label="Receipt preview">
        <header><h2>Reçu C-372</h2></header>
        <div><button type="button" aria-label="Dismiss download notice"><span aria-hidden="true">×</span></button></div>
        <footer><div>
          <button class="css-x184h" type="button" aria-label="Close receipt preview" data-fixture-target="close-receipt"><span aria-hidden="true">×</span></button>
        </div></footer>
      </aside>
reference:
  by: expression
  source: "page.getByRole('button', { name: 'Close receipt preview', exact: true })"
decoy: { by: css, selector: '.css-x184h' }
---

The receipt preview has an icon-only close button. Find the button that closes the entire preview, leaving any download notice alone.

The `data-fixture-target` marker belongs to this exercise and is not part of the app.
