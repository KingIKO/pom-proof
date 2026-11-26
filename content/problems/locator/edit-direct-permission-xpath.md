---
title: Find the edit action for a direct permission
kind: locator
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

Use XPath to find `Edit` for the direct grant in the `Morgan Ives` name cell's row. Morgan can also have inherited access. Name and action columns may trade places, and the name can be split across inline elements. The table's `data-role-source` value identifies how the grant was made.

The `data-fixture-target` marker belongs to this exercise and is not part of the app.
