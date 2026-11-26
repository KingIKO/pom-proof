---
title: Locate the right refund button
kind: locator
topic: playwright
difficulty: easy
minutes: 6
roles: [automation, sdet]
fixture: |
  <section aria-label="Order PP104">
    <div class="actions">
      <button>Print receipt</button>
      <button data-fixture-target="refund" aria-label="Refund order PP104">Refund</button>
    </div>
  </section>
  <section aria-label="Order PP105">
    <button aria-label="Refund order PP105">Refund</button>
  </section>
target: '[data-fixture-target="refund"]'
variants:
  - name: reordered-actions
    fixture: |
      <section aria-label="Order PP104">
        <div class="actions">
          <button data-fixture-target="refund" aria-label="Refund order PP104">Refund</button>
          <button>Print receipt</button>
        </div>
      </section>
      <section aria-label="Order PP105">
        <button aria-label="Refund order PP105">Refund</button>
      </section>
  - name: different-wrapper
    fixture: |
      <section aria-label="Order PP105">
        <button aria-label="Refund order PP105">Refund</button>
      </section>
      <section aria-label="Order PP104">
        <footer>
          <button data-fixture-target="refund" aria-label="Refund order PP104">Refund</button>
        </footer>
      </section>
reference: { by: role, role: button, name: Refund order PP104, exact: true }
decoy: { by: css, selector: '.actions > button:nth-child(2)' }
---

The support console lists orders `PP104` and `PP105`. Each row has a button whose visible text is `Refund`. The button for `PP104` has the accessible name `Refund order PP104`. A layout revision moves actions and may reorder the rows.

Choose a Playwright-style locator that finds only the refund button for `PP104` in every version of the console. The fixture target marker belongs to the exercise and is not exposed by the application.
