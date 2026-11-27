---
title: Find the link for the current billing page in account settings
kind: locator
syntax: css
topic: playwright
difficulty: hard
minutes: 8
roles: [automation, sdet, senior]
fixture: |
  <nav aria-label="Account settings" data-nav="account-settings" class="css-k518p">
    <ul>
      <li><a href="/accounts/personal/billing" aria-current="page" data-fixture-target="current-account-billing">Billing</a></li>
      <li><a href="/accounts/personal/billing/history">History</a></li>
    </ul>
  </nav>
target: '[data-fixture-target="current-account-billing"]'
variants:
  - name: another-account-and-organization-nav
    fixture: |
      <nav aria-label="Organization settings" data-nav="org-settings">
        <a href="/orgs/blue-team/billing" aria-current="page">Billing</a>
      </nav>
      <nav aria-label="Account settings" data-nav="account-settings" class="css-k518p">
        <ul>
          <li><a href="/accounts/personal/billing">Billing</a></li>
          <li><a href="/accounts/consulting/billing" aria-current="page" data-fixture-target="current-account-billing">Billing</a></li>
        </ul>
      </nav>
  - name: localized-nav-with-grouping
    fixture: |
      <nav aria-label="Paramètres du compte" data-nav="account-settings" class="css-w730x">
        <div><a href="/fr/accounts/consulting/billing/history">Historique</a><a href="/fr/accounts/consulting/security" aria-current="false">Sécurité</a></div>
        <div><a href="/fr/accounts/consulting/billing" aria-current="page" data-fixture-target="current-account-billing">Facturation</a></div>
      </nav>
      <nav aria-label="Assistance" data-nav="help"><a href="/fr/help/billing" aria-current="page">Facturation</a></nav>
reference: { by: css, selector: 'nav[data-nav="account-settings"] a[aria-current="page"][href$="/billing"]' }
decoy: { by: css, selector: 'a[href="/accounts/personal/billing"]' }
---

Use a CSS selector, a pattern that matches page elements, to find the link marked as the current billing page in account settings. Another menu can also mark its billing link as current. The parts of the address for the account and locale may change. The locale is the language or region. Billing overview links in this app always end in `/billing`.

Only this exercise uses the `data-fixture-target` marker. The app does not include it.
