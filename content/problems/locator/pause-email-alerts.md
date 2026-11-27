---
title: Find the button that pauses email alerts
kind: locator
syntax: css
topic: playwright
difficulty: easy
minutes: 5
roles: [automation, sdet]
fixture: |
  <ul aria-label="Alert delivery">
    <li class="css-c450h" data-channel="email">
      <span>Email alerts</span><button name="pause-channel" data-fixture-target="pause-email">Pause</button><button name="edit-channel">Edit</button>
    </li>
    <li class="css-c450h" data-channel="sms">
      <span>Text alerts</span><button name="pause-channel">Pause</button><button name="edit-channel">Edit</button>
    </li>
  </ul>
target: '[data-fixture-target="pause-email"]'
variants:
  - name: channels-reordered
    fixture: |
      <ul aria-label="Alert delivery">
        <li class="css-c450h" data-channel="sms">
          <span>Text alerts</span><button name="pause-channel">Pause</button><button name="edit-channel">Edit</button>
        </li>
        <li class="css-c450h" data-channel="email">
          <span>Email alerts</span><button name="pause-channel" data-fixture-target="pause-email">Pause</button><button name="edit-channel">Edit</button>
        </li>
      </ul>
  - name: grouped-channel-actions
    fixture: |
      <ul aria-label="Canaux de diffusion">
        <li class="css-k206b" data-channel="email">
          <span>Alertes par e-mail</span><div><button name="edit-channel">Modifier</button><button name="pause-channel" data-fixture-target="pause-email">Suspendre</button></div>
        </li>
        <li class="css-k206b" data-channel="push">
          <span>Notifications push</span><div><button name="pause-channel">Suspendre</button><button name="edit-channel">Modifier</button></div>
        </li>
      </ul>
reference: { by: css, selector: '[data-channel="email"] button[name="pause-channel"]' }
decoy: { by: css, selector: 'li:nth-child(1) > button:nth-of-type(1)' }
---

Use a CSS selector, a pattern that matches page elements, to find the button that pauses email delivery. Each channel, or way to send alerts, has its own Pause and Edit actions. The app uses `data-channel` to identify the channel and the button's `name` to identify the action. Those values stay the same when the screen is translated.

Only this exercise uses the `data-fixture-target` marker. The app does not include it.
