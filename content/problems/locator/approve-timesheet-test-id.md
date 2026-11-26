---
title: Find the approval action for a timesheet
kind: locator
topic: playwright
difficulty: medium
minutes: 6
roles: [automation, sdet]
fixture: |
  <div class="css-q863j">
    <section aria-label="Timesheet T-291" id="sheet-21">
      <h2>Week of 3 August</h2><p>Jules Carr · 36 hours</p>
      <footer><button data-testid="approve-timesheet" data-fixture-target="approve-t291">Approve</button><button>Review</button></footer>
    </section>
    <section aria-label="Timesheet T-292" id="sheet-22">
      <h2>Week of 3 August</h2><p>Sam Lau · 40 hours</p>
      <footer><button data-testid="approve-timesheet">Approve</button><button>Review</button></footer>
    </section>
  </div>
target: '[data-fixture-target="approve-t291"]'
variants:
  - name: sorted-by-hours
    fixture: |
      <div class="css-q863j">
        <section aria-label="Timesheet T-292" id="sheet-83">
          <h2>Week of 3 August</h2><p>Sam Lau · 40 hours</p><footer><button data-testid="approve-timesheet">Approve</button><button>Review</button></footer>
        </section>
        <section aria-label="Timesheet T-291" id="sheet-84">
          <h2>Week of 3 August</h2><p>Jules Carr · 36 hours</p><footer><button data-testid="approve-timesheet" data-fixture-target="approve-t291">Approve</button><button>Review</button></footer>
        </section>
      </div>
  - name: localized-toolbar-and-new-entry
    fixture: |
      <div class="css-s343p">
        <section aria-label="Timesheet T-301" id="sheet-93">
          <h2>Semaine du 10 août</h2><p>Jules Carr · 40 heures</p><footer><button data-testid="approve-timesheet">Approuver</button></footer>
        </section>
        <section aria-label="Timesheet T-291" id="sheet-94">
          <h2>Semaine du 3 août</h2><p>Jules Carr · 36 heures</p><footer><div><button>Examiner</button><button data-testid="approve-timesheet" data-fixture-target="approve-t291">Approuver</button></div></footer>
        </section>
      </div>
reference:
  by: expression
  source: "page.getByRole('region', { name: 'Timesheet T-291', exact: true }).getByTestId('approve-timesheet')"
decoy: { by: expression, source: "page.getByTestId('approve-timesheet').nth(0)" }
---

Find the approval button for timesheet `T-291`. The app repeats the `approve-timesheet` test ID once per timesheet section and keeps the section name fixed. The button caption may be translated.

The `data-fixture-target` marker belongs to this exercise and is not part of the app.
