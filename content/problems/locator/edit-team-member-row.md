---
title: Find Edit on the right team member's row
kind: locator
topic: playwright
difficulty: medium
minutes: 6
roles: [automation, sdet]
fixture: |
  <table class="css-r892t">
    <caption>Workspace members</caption>
    <thead><tr><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
    <tbody>
      <tr id="member-519"><td>Dana Song</td><td>dana.song@example.test</td><td><button data-fixture-target="edit-dana">Edit</button> <button>Delete</button></td></tr>
      <tr id="member-523"><td>Eli Wong</td><td>eli.wong@example.test</td><td><button>Edit</button> <button>Delete</button></td></tr>
    </tbody>
  </table>
target: '[data-fixture-target="edit-dana"]'
variants:
  - name: sorted-by-name-descending
    fixture: |
      <table class="css-r892t">
        <caption>Workspace members</caption>
        <thead><tr><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
        <tbody>
          <tr id="member-603"><td>Eli Wong</td><td>eli.wong@example.test</td><td><button>Edit</button> <button>Delete</button></td></tr>
          <tr id="member-602"><td>Dana Song</td><td>dana.song@example.test</td><td><button data-fixture-target="edit-dana">Edit</button> <button>Delete</button></td></tr>
        </tbody>
      </table>
  - name: second-dana-and-action-wrappers
    fixture: |
      <table class="css-p204s">
        <caption>Membres de l’espace</caption>
        <thead><tr><th>Nom</th><th>E-mail</th><th>Actions</th></tr></thead>
        <tbody>
          <tr id="member-725"><td>Dana Song</td><td>d.song@example.test</td><td><div><button>Edit</button> <button>Delete</button></div></td></tr>
          <tr id="member-700"><td>Dana Song</td><td><span>dana.song@example.test</span></td><td><div><button data-fixture-target="edit-dana">Edit</button> <button>Delete</button></div></td></tr>
          <tr id="member-701"><td>Eli Wong</td><td>eli.wong@example.test</td><td><div><button>Edit</button> <button>Delete</button></div></td></tr>
        </tbody>
      </table>
reference:
  by: expression
  source: "page.getByRole('row').filter({ hasText: 'dana.song@example.test' }).getByRole('button', { name: 'Edit', exact: true })"
decoy: { by: expression, source: "page.getByRole('button', { name: 'Edit', exact: true }).nth(0)" }
---

Find the `Edit` button in the row for the team member `dana.song@example.test`. Members can share a display name, but this address identifies one member. Start from the member's row. That keeps the locator, the expression that finds the button, working after the table is sorted.

Only this exercise uses the `data-fixture-target` marker. The app does not include it.
