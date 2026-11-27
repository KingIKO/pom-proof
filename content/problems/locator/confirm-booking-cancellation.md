---
title: Find Confirm in the visible booking cancellation dialog
kind: locator
topic: playwright
difficulty: medium
minutes: 6
roles: [automation, sdet]
fixture: |
  <main>
    <div role="dialog" aria-labelledby="cancel-title-61" class="css-g892d">
      <h2 id="cancel-title-61">Cancel booking BK-281?</h2>
      <p>The time becomes available to other guests.</p>
      <footer><button>Go back</button><button data-fixture-target="confirm-cancellation">Confirm</button></footer>
    </div>
  </main>
target: '[data-fixture-target="confirm-cancellation"]'
variants:
  - name: notification-confirmation-added
    fixture: |
      <main>
        <section aria-label="Notifications"><p>Send a schedule update?</p><button>Confirm</button></section>
        <div role="dialog" aria-labelledby="cancel-title-74" class="css-g892d">
          <h2 id="cancel-title-74">Cancel booking BK-281?</h2>
          <p>The time becomes available to other guests.</p>
          <footer><button>Go back</button><button data-fixture-target="confirm-cancellation">Confirm</button></footer>
        </div>
      </main>
  - name: hidden-draft-and-new-toolbar
    fixture: |
      <main>
        <div hidden role="dialog" aria-label="Cancel booking BK-281?"><button>Confirm</button></div>
        <section aria-label="Notifications"><p>Envoyer une mise à jour ?</p><button>Confirm</button></section>
        <div role="dialog" aria-labelledby="cancel-title-98" class="css-h506a">
          <h2 id="cancel-title-98">Cancel booking BK-281?</h2>
          <p>Le créneau sera libéré.</p>
          <footer><div><button data-fixture-target="confirm-cancellation">Confirm</button><button>Go back</button></div></footer>
        </div>
      </main>
reference:
  by: expression
  source: "page.getByRole('dialog', { name: 'Cancel booking BK-281?', exact: true }).getByRole('button', { name: 'Confirm', exact: true })"
decoy: { by: expression, source: "page.getByRole('button', { name: 'Confirm', exact: true }).nth(0)" }
---

Find the `Confirm` button in the visible panel named `Cancel booking BK-281?`. The panel is a dialog, a part of the page that asks the user to respond. Notification settings can have their own confirmation button. A hidden draft may stay in the DOM, the page structure the browser uses.

Only this exercise uses the `data-fixture-target` marker. The app does not include it.
