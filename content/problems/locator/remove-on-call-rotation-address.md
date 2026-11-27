---
title: Find the button that removes an on-call email address
kind: locator
syntax: playwright
topic: playwright
difficulty: hard
minutes: 8
roles: [automation, sdet, senior]
fixture: |
  <div data-testid="notification-settings" class="css-l783j">
    <fieldset><legend>On-call rotation</legend>
      <ul>
        <li><span>ops@north.example</span><button aria-label="Remove address" data-fixture-target="remove-oncall-ops"><span aria-hidden="true">×</span></button></li>
        <li><span>backup@north.example</span><button aria-label="Remove address"><span aria-hidden="true">×</span></button></li>
      </ul>
    </fieldset>
    <fieldset><legend>Weekly digest</legend><ul><li><span>ops@north.example</span><button aria-label="Remove address">Remove</button></li></ul></fieldset>
  </div>
target: '[data-fixture-target="remove-oncall-ops"]'
variants:
  - name: digest-first-and-rotation-reordered
    fixture: |
      <div data-testid="notification-settings" class="css-l783j">
        <fieldset><legend>Weekly digest</legend><ul><li><span>ops@north.example</span><button aria-label="Remove address">Remove</button></li></ul></fieldset>
        <fieldset><legend>On-call rotation</legend><ul>
          <li><span>backup@north.example</span><button aria-label="Remove address">Remove</button></li>
          <li><span>ops@north.example</span><button aria-label="Remove address" data-fixture-target="remove-oncall-ops">Remove</button></li>
        </ul></fieldset>
      </div>
  - name: editable-settings-and-sample-panel
    fixture: |
      <aside aria-label="Sample settings">
        <fieldset><legend>On-call rotation</legend><ul><li>ops@north.example <button aria-label="Remove address">Remove</button></li></ul></fieldset>
      </aside>
      <div data-testid="notification-settings" class="css-n619s">
        <h2>Notifications d’équipe</h2>
        <fieldset><legend>On-call rotation</legend><ul>
          <li><span>ops@north.example</span><div><button aria-label="Edit address">Modifier</button><button aria-label="Remove address" data-fixture-target="remove-oncall-ops"><span aria-hidden="true">×</span></button></div></li>
          <li><span>backup@north.example</span><div><button aria-label="Remove address">Retirer</button></div></li>
        </ul></fieldset>
        <fieldset><legend>Weekly digest</legend><ul><li>ops@north.example <button aria-label="Remove address">Retirer</button></li></ul></fieldset>
      </div>
reference:
  by: expression
  source: "page.getByTestId('notification-settings').getByRole('group', { name: 'On-call rotation', exact: true }).getByRole('listitem').filter({ hasText: 'ops@north.example' }).getByRole('button', { name: 'Remove address', exact: true })"
decoy: { by: expression, source: "page.getByRole('listitem').filter({ hasText: 'ops@north.example' }).getByRole('button', { name: 'Remove address', exact: true }).nth(0)" }
---

Write a Playwright locator, code that starts with `page.` and finds an element, to find the `Remove address` button for `ops@north.example`. Find it in the `On-call rotation` group users can edit. The digest, a separate email summary, also goes to that address. A separate sample panel can repeat the whole rotation.

The settings users can edit have the test ID `notification-settings`. A test ID is an identifier the app provides for tests.

Only this exercise uses the `data-fixture-target` marker. The app does not include it.
