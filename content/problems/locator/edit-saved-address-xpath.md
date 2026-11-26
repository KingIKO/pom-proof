---
title: Find the edit action for a saved address
kind: locator
syntax: xpath
topic: playwright
difficulty: medium
minutes: 7
roles: [automation, sdet]
fixture: |
  <table class="css-e432n">
    <caption>Saved delivery addresses</caption>
    <tbody>
      <tr><th scope="row">Studio 14</th><td>12 River Walk</td><td><button data-fixture-target="edit-studio14">Edit</button> <button>Delete</button></td></tr>
      <tr><th scope="row">Studio 140</th><td>85 Foundry Road</td><td><button>Edit</button> <button>Delete</button></td></tr>
    </tbody>
  </table>
target: '[data-fixture-target="edit-studio14"]'
variants:
  - name: recently-edited-address-first
    fixture: |
      <table class="css-e432n">
        <caption>Saved delivery addresses</caption>
        <tbody>
          <tr><th scope="row">Studio 140</th><td>85 Foundry Road</td><td><button>Edit</button> <button>Delete</button></td></tr>
          <tr><th scope="row">Studio 14</th><td>12 River Walk</td><td><button data-fixture-target="edit-studio14">Edit</button> <button>Delete</button></td></tr>
        </tbody>
      </table>
  - name: region-column-added
    fixture: |
      <table class="css-k902r">
        <caption>Adresses enregistrées</caption>
        <tbody>
          <tr><th scope="row">Studio 14</th><td>12 River Walk</td><td>Ouest</td><td><div><button data-fixture-target="edit-studio14"><span>Edit</span></button> <button>Delete</button></div></td></tr>
          <tr><th scope="row">Studio 140</th><td>85 Foundry Road</td><td>Nord</td><td><div><button>Edit</button> <button>Delete</button></div></td></tr>
        </tbody>
      </table>
reference: { by: xpath, selector: "//th[normalize-space(.)='Studio 14']/following-sibling::td//button[normalize-space(.)='Edit']" }
decoy: { by: xpath, selector: '//tbody/tr[1]/td[2]/button[1]' }
---

Use XPath to find the `Edit` button in the row headed `Studio 14`. The row header stays before its action cell, but the number of columns may change. `Studio 140` is a different address.

The `data-fixture-target` marker belongs to this exercise and is not part of the app.
