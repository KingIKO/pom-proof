---
title: Find the recovery code sign-in link
kind: locator
topic: playwright
difficulty: easy
minutes: 4
roles: [manual-qa, automation, sdet]
fixture: |
  <nav aria-label="Sign-in options" class="css-l804q">
    <div><a href="/sign-in/recovery" data-fixture-target="recovery-option">Use a recovery code</a></div>
    <small>Each code can be used once.</small>
    <a href="/help/security-keys">Use a security key</a>
  </nav>
target: '[data-fixture-target="recovery-option"]'
variants:
  - name: help-link-added
    fixture: |
      <nav aria-label="Sign-in options" class="css-k187p">
        <a href="/help/recovery">How to use a recovery code</a>
        <div><a href="/sign-in/recovery" data-fixture-target="recovery-option"><span>Use a recovery code</span></a></div>
        <small>Each code can be used once.</small>
        <a href="/help/security-keys">Use a security key</a>
      </nav>
  - name: new-layout-and-route
    fixture: |
      <nav aria-label="Options de connexion" class="css-g501k">
        <p>Autres moyens de connexion</p>
        <div><a href="/auth/recovery/enter" data-fixture-target="recovery-option">Use a recovery code</a></div>
        <div><a href="/auth/recovery/limits">Use a recovery code on a new device</a></div>
      </nav>
reference:
  by: expression
  source: "page.getByRole('link', { name: 'Use a recovery code', exact: true })"
decoy: { by: expression, source: "page.getByRole('link', { name: 'Use a recovery code' })" }
---

The sign-in screen links to the recovery code form and may also show help links. Find the link named `Use a recovery code` that takes the user to code entry.

The `data-fixture-target` marker belongs to this exercise and is not part of the app.
