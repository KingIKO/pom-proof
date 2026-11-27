---
title: Find a specific order's refund button
kind: locator
syntax: playwright
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
reference:
  by: expression
  source: "page.getByRole('button', { name: 'Refund order PP104', exact: true })"
decoy: { by: expression, source: "page.locator('.actions > button:nth-child(2)')" }
---

The support console lists orders `PP104` and `PP105`. In both rows the button shows `Refund`. The button for `PP104` has the accessible name `Refund order PP104`, the name a screen reader can read out. A new layout moves the buttons and may change row order.

Write a Playwright locator, code that starts with `page.` and finds an element, to match only the refund button for `PP104`. It must work in every version of the console.

Only this exercise uses the `data-fixture-target` marker. The app does not include it.
