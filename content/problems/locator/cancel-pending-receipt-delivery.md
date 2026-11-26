---
title: Find the cancel action for a pending receipt delivery
kind: locator
topic: playwright
difficulty: hard
minutes: 8
roles: [automation, sdet, senior]
fixture: |
  <section aria-label="Receipt deliveries">
    <div class="css-p032g">
      <article data-delivery-state="pending">
        <h2>Receipt RC-602</h2><p>Queued for 10:30</p>
        <footer><button data-fixture-target="cancel-rc602">Cancel</button><button>Details</button></footer>
      </article>
      <article data-delivery-state="pending"><h2>Receipt RC-711</h2><p>Queued for 11:00</p><footer><button>Cancel</button><button>Details</button></footer></article>
    </div>
  </section>
target: '[data-fixture-target="cancel-rc602"]'
variants:
  - name: failed-attempt-retained
    fixture: |
      <section aria-label="Receipt deliveries">
        <div class="css-p032g">
          <article data-delivery-state="failed"><h2>Receipt RC-602</h2><p>Could not send</p><footer><button>Cancel</button><button>Retry</button></footer></article>
          <article data-delivery-state="pending"><h2>Receipt RC-711</h2><p>Queued for 11:00</p><footer><button>Cancel</button></footer></article>
          <article data-delivery-state="pending"><h2>Receipt RC-602</h2><p>Queued for 10:30</p><footer><button data-fixture-target="cancel-rc602">Cancel</button><button>Details</button></footer></article>
        </div>
      </section>
  - name: hidden-card-and-translated-status
    fixture: |
      <section aria-label="Envois de reçus">
        <div class="css-k287m">
          <article hidden data-delivery-state="pending"><h2>Receipt RC-602</h2><footer><button>Cancel</button></footer></article>
          <article data-delivery-state="failed"><h2>Reçu RC-602</h2><p>Échec d’envoi</p><footer><button>Cancel</button></footer></article>
          <article data-delivery-state="pending"><h2>Reçu <span>RC-602</span></h2><p>Prévu à 10 h 30</p><footer><div><button>Details</button><button data-fixture-target="cancel-rc602">Cancel</button></div></footer></article>
        </div>
      </section>
reference:
  by: expression
  source: >-
    page.locator('article[data-delivery-state="pending"]').filter({ hasText: 'RC-602' }).getByRole('button', { name: 'Cancel', exact: true })
decoy: { by: expression, source: "page.getByRole('article').filter({ hasText: 'RC-602' }).getByRole('button', { name: 'Cancel', exact: true }).nth(0)" }
---

Use a Playwright-style expression to find `Cancel` for the visible pending delivery of receipt `RC-602`. An older failed attempt for the same receipt can still have a `Cancel` button. The app keeps the machine-readable delivery state even when the caption changes language.

The `data-fixture-target` marker belongs to this exercise and is not part of the app.
