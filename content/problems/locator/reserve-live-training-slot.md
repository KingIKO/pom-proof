---
title: Find the live reservation action for a training slot
kind: locator
syntax: xpath
topic: playwright
difficulty: hard
minutes: 9
roles: [automation, sdet, senior]
fixture: |
  <section aria-label="Staff training">
    <div class="css-x194c">
      <article><h3>Packing basics</h3><span data-slot="time">14:30</span><footer><button aria-label="Reserve seat" data-fixture-target="reserve-packing-1430">Reserve</button></footer></article>
      <article><h3>Packing basics</h3><span data-slot="time">09:00</span><footer><button aria-label="Reserve seat">Reserve</button></footer></article>
      <article><h3>Stock counting</h3><span data-slot="time">14:30</span><footer><button aria-label="Reserve seat">Reserve</button></footer></article>
    </div>
  </section>
target: '[data-fixture-target="reserve-packing-1430"]'
variants:
  - name: hidden-copy-and-earlier-slot-first
    fixture: |
      <section aria-label="Staff training">
        <div class="css-x194c">
          <article hidden><h3>Packing basics</h3><span data-slot="time">14:30</span><footer><button aria-label="Reserve seat">Reserve</button></footer></article>
          <article><h3>Packing basics</h3><span data-slot="time">09:00</span><footer><button aria-label="Reserve seat">Reserve</button></footer></article>
          <article><h3>Packing basics</h3><span data-slot="time">14:30</span><footer><button aria-label="Reserve seat" data-fixture-target="reserve-packing-1430">Reserve</button></footer></article>
        </div>
      </section>
  - name: archived-session-and-new-card-layout
    fixture: |
      <section aria-label="Formation du personnel">
        <div class="css-s697d">
          <article><h3>Packing basics</h3><span data-slot="time">14:30</span><footer><button aria-label="Reserve seat" disabled>Complet</button></footer></article>
          <article><h3>Stock counting</h3><span data-slot="time">14:30</span><footer><button aria-label="Reserve seat">Réserver</button></footer></article>
          <article><header><h3>Packing <span>basics</span></h3><span data-slot="time"> 14:30 </span></header><footer><div><button aria-label="Reserve seat" data-fixture-target="reserve-packing-1430">Réserver</button></div></footer></article>
        </div>
      </section>
  - name: preparation-time-on-another-card
    fixture: |
      <section aria-label="Staff training">
        <div class="css-m487h">
          <article><h3>Packing basics</h3><small>Doors open at 14:30.</small><span data-slot="time">15:00</span><footer><button aria-label="Reserve seat">Reserve</button></footer></article>
          <article><h3>Packing basics for supervisors</h3><span data-slot="time">14:30</span><footer><button aria-label="Reserve seat">Reserve</button></footer></article>
          <article><h3>Packing basics</h3><span data-slot="time">14:30</span><footer><div><button aria-label="Reserve seat" data-fixture-target="reserve-packing-1430">Reserve</button><button aria-label="Training details">Details</button></div></footer></article>
        </div>
      </section>
reference:
  by: xpath
  selector: >-
    //article[not(@hidden)][.//h3[normalize-space(.)='Packing basics']][.//span[@data-slot='time'][normalize-space(.)='14:30']]//button[@aria-label='Reserve seat'][not(@disabled)]
decoy:
  by: xpath
  selector: "(//article[.//h3[normalize-space(.)='Packing basics']]//button[@aria-label='Reserve seat'])[1]"
---

Use XPath to find the enabled `Reserve seat` button for the visible `Packing basics` session starting at `14:30`. Match the start time on the card, not a time mentioned in the description. The app hides duplicate cards with `hidden` on the article and marks unavailable buttons with `disabled` on the button.

The `data-fixture-target` marker belongs to this exercise and is not part of the app.
