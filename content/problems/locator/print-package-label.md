---
title: Find the button that prints a package's shipping label
kind: locator
syntax: css
topic: playwright
difficulty: medium
minutes: 6
roles: [automation, sdet]
fixture: |
  <table class="css-h181p">
    <caption>Packages ready to dispatch</caption>
    <tbody>
      <tr data-package-id="PK-241"><th scope="row">PK-241</th><td>Bay 2</td><td><button data-action="print-label" data-fixture-target="print-pk241">Print</button><button data-action="edit">Edit</button></td></tr>
      <tr data-package-id="PK-390"><th scope="row">PK-390</th><td>Bay 3</td><td><button data-action="print-label">Print</button><button data-action="edit">Edit</button></td></tr>
    </tbody>
  </table>
target: '[data-fixture-target="print-pk241"]'
variants:
  - name: express-package-prepended
    fixture: |
      <table class="css-h181p">
        <caption>Packages ready to dispatch</caption>
        <tbody>
          <tr data-package-id="PK-402"><th scope="row">PK-402</th><td>Express</td><td><button data-action="print-label">Print</button></td></tr>
          <tr data-package-id="PK-241"><th scope="row">PK-241</th><td>Bay 2</td><td><button data-action="print-label" data-fixture-target="print-pk241">Print</button><button data-action="edit">Edit</button></td></tr>
          <tr data-package-id="PK-390"><th scope="row">PK-390</th><td>Bay 3</td><td><button data-action="print-label">Print</button></td></tr>
        </tbody>
      </table>
  - name: address-added-and-actions-wrapped
    fixture: |
      <table class="css-p136x">
        <caption>Colis prêts à expédier</caption>
        <tbody>
          <tr data-package-id="PK-241"><th scope="row">PK-241</th><td>Quai 2</td><td><button data-action="print-packing-slip">Imprimer</button></td><td><div><button data-action="print-label" data-fixture-target="print-pk241">Imprimer</button><button data-action="edit">Modifier</button></div></td></tr>
          <tr data-package-id="PK-390"><th scope="row">PK-390</th><td>Quai 3</td><td></td><td><div><button data-action="print-label">Imprimer</button></div></td></tr>
        </tbody>
      </table>
reference: { by: css, selector: 'tr[data-package-id="PK-241"] button[data-action="print-label"]' }
decoy: { by: css, selector: 'tbody tr:first-child td:nth-of-type(2) > button:first-child' }
---

Use a CSS selector, a pattern that matches page elements, to find the button that prints the shipping label for package `PK-241`. A packing slip may also have a Print button. The app stores the package ID on the row. It stores the action code, which identifies what the button does, on the button.

Only this exercise uses the `data-fixture-target` marker. The app does not include it.
