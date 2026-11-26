---
title: Find the delete action for a saved search
kind: locator
topic: playwright
difficulty: medium
minutes: 6
roles: [automation, sdet]
fixture: |
  <ul aria-label="Saved searches" class="css-v371l">
    <li><article class="css-a603p">
      <h2>Open chargebacks</h2><p>Search SR-518</p>
      <footer><button>Edit</button><button data-fixture-target="delete-search">Delete</button></footer>
    </article></li>
    <li><article class="css-a603p">
      <h2>Renewals this week</h2><p>Search SR-604</p>
      <footer><button>Edit</button><button>Delete</button></footer>
    </article></li>
  </ul>
target: '[data-fixture-target="delete-search"]'
variants:
  - name: newest-search-first
    fixture: |
      <ul aria-label="Saved searches" class="css-v371l">
        <li><article class="css-a603p"><h2>Renewals this week</h2><p>Search SR-604</p><footer><button>Edit</button><button>Delete</button></footer></article></li>
        <li><article class="css-a603p"><h2>Open chargebacks</h2><p>Search SR-518</p><footer><button>Edit</button><button data-fixture-target="delete-search">Delete</button></footer></article></li>
      </ul>
  - name: duplicate-title-with-wrapped-actions
    fixture: |
      <ul aria-label="Recherches enregistrées" class="css-v418y">
        <li><article class="css-k265y"><h2>Open chargebacks</h2><p>Recherche SR-702</p><footer><button>Edit</button><button>Delete</button></footer></article></li>
        <li><article class="css-k265y">
          <h2>Open chargebacks</h2><p>Recherche <strong>SR-518</strong></p>
          <footer><div><button>Edit</button><button data-fixture-target="delete-search">Delete</button></div></footer>
        </article></li>
      </ul>
reference:
  by: expression
  source: "page.getByRole('article').filter({ hasText: 'SR-518' }).getByRole('button', { name: 'Delete', exact: true })"
decoy: { by: css, selector: 'li:first-child article footer > button:nth-child(2)' }
---

Find the `Delete` button for saved search `SR-518`. The search title is editable and another card can share it. The search code is visible on the card and stays unique.

The `data-fixture-target` marker belongs to this exercise and is not part of the app.
