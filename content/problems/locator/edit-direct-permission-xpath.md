---
title: Find Edit for a permission granted directly
kind: locator
syntax: xpath
topic: playwright
difficulty: hard
minutes: 9
roles: [automation, sdet, senior]
fixture: |
  <main>
    <table class="css-d731m" data-role-source="direct">
      <caption>Direct grants</caption>
      <tbody>
        <tr><td data-field="name">Morgan Ives</td><td>Viewer</td><td><button data-fixture-target="edit-direct-morgan">Edit</button></td></tr>
        <tr><td data-field="name">Ari Wade</td><td>Editor</td><td><button>Edit</button></td></tr>
      </tbody>
    </table>
    <table data-role-source="inherited"><caption>Inherited grants</caption><tbody><tr><td data-field="name">Ari Wade</td><td>User group</td><td><button>Edit</button></td></tr></tbody></table>
  </main>
target: '[data-fixture-target="edit-direct-morgan"]'
variants:
  - name: inherited-grant-first
    fixture: |
      <main>
        <table data-role-source="inherited"><caption>Inherited grants</caption><tbody>
          <tr><td data-field="name">Morgan Ives</td><td>Reports group</td><td><button>Edit</button></td></tr>
        </tbody></table>
        <table class="css-d731m" data-role-source="direct"><caption>Direct grants</caption><tbody>
          <tr><td data-field="name">Ari Wade</td><td>Editor</td><td><button>Edit</button></td></tr>
          <tr><td data-field="name">Morgan Ives</td><td>Viewer</td><td><button data-fixture-target="edit-direct-morgan">Edit</button></td></tr>
        </tbody></table>
      </main>
  - name: action-column-moved-before-name
    fixture: |
      <main>
        <div><table class="css-u882q" data-role-source="direct"><caption>Accès directs</caption><tbody>
          <tr><td><button>Edit</button></td><td>Suppléant de Morgan Ives</td><td data-field="name">Morgan Ives Jr</td></tr>
          <tr><td><div><button data-fixture-target="edit-direct-morgan"><span>Edit</span></button></div></td><td>Lecture seule</td><td data-field="name"> Morgan <span>Ives</span> </td></tr>
        </tbody></table></div>
        <table data-role-source="inherited"><caption>Accès hérités</caption><tbody>
          <tr><td data-field="name">Morgan Ives</td><td>Groupe Rapports</td><td><button>Edit</button></td></tr>
        </tbody></table>
      </main>
reference: { by: xpath, selector: "//table[@data-role-source='direct']//td[@data-field='name'][normalize-space(.)='Morgan Ives']/ancestor::tr[1]//button[normalize-space(.)='Edit']" }
decoy: { by: xpath, selector: "(//td[normalize-space(.)='Morgan Ives']/ancestor::tr[1]//button[normalize-space(.)='Edit'])[1]" }
---

Use XPath, a language for finding elements in a page, to find `Edit` in the right row for `Morgan Ives`. The row must contain the cell with that name and show a direct grant, a permission given to Morgan individually. Morgan can also have inherited access, permission obtained through another role or group.

The `data-role-source` value says how Morgan got the permission. The name and action columns may swap places. The name may be split across smaller elements inside the cell.

Only this exercise uses the `data-fixture-target` marker. The app does not include it.
