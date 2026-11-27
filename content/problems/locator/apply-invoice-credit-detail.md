---
title: Find the Apply credit action for an invoice credit
kind: locator
syntax: xpath
topic: playwright
difficulty: hard
minutes: 9
roles: [automation, sdet, senior]
fixture: |
  <table class="css-v852e">
    <caption>Credit adjustments</caption>
    <tbody>
      <tr data-row="credit-summary"><th scope="row">CR-47</th><td>Shipping adjustment</td></tr>
      <tr data-row="credit-detail"><td colspan="2"><button data-fixture-target="apply-cr47">Apply credit</button><button>Close details</button></td></tr>
      <tr data-row="credit-summary"><th scope="row">CR-64</th><td>Service adjustment</td></tr>
      <tr data-row="credit-detail"><td colspan="2"><button>Apply credit</button><button>Close details</button></td></tr>
    </tbody>
  </table>
target: '[data-fixture-target="apply-cr47"]'
variants:
  - name: older-credit-first
    fixture: |
      <table class="css-v852e">
        <caption>Credit adjustments</caption>
        <tbody>
          <tr data-row="credit-summary"><th scope="row">CR-64</th><td>Service adjustment</td></tr>
          <tr data-row="credit-detail"><td colspan="2"><button>Apply credit</button><button>Close details</button></td></tr>
          <tr data-row="credit-summary"><th scope="row">CR-47</th><td>Shipping adjustment</td></tr>
          <tr data-row="credit-detail"><td colspan="2"><button data-fixture-target="apply-cr47">Apply credit</button><button>Close details</button></td></tr>
        </tbody>
      </table>
  - name: notice-and-new-detail-layout
    fixture: |
      <table class="css-v108w">
        <caption>Avoirs</caption>
        <tbody>
          <tr data-row="notice"><td colspan="2">Les avoirs sont appliqués à la prochaine facture.</td></tr>
          <tr data-row="credit-summary"><th scope="row"> CR-<span>47</span> </th><td>Frais de livraison</td></tr>
          <tr data-row="credit-detail"><td colspan="2"><div><button>Close details</button><button data-fixture-target="apply-cr47"><span>Apply</span> credit</button></div></td></tr>
          <tr data-row="credit-summary"><th scope="row">CR-471</th><td>Service</td></tr>
          <tr data-row="credit-detail"><td colspan="2"><button>Apply credit</button></td></tr>
        </tbody>
      </table>
reference: { by: xpath, selector: "//tr[@data-row='credit-summary'][th[normalize-space(.)='CR-47']]/following-sibling::tr[1][@data-row='credit-detail']//button[normalize-space(.)='Apply credit']" }
decoy: { by: xpath, selector: "(//tr[@data-row='credit-detail']//button[normalize-space(.)='Apply credit'])[1]" }
---

Use XPath, a language for finding elements in a page, to find `Apply credit` for credit `CR-47`. The summary row shows the credit code. The buttons for that credit are in a separate detail row right after its summary row.

Other credits with details open can have identical buttons. The table can move a credit's summary and detail rows together.

Only this exercise uses the `data-fixture-target` marker. The app does not include it.
