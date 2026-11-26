---
title: Find the apply action in an invoice credit detail row
kind: locator
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

Use XPath to find `Apply credit` for `CR-47`. The credit code is in the summary row. Its controls are in a separate detail row immediately after it. Other expanded credits can have identical controls, and the table can reorder whole credit groups.

The `data-fixture-target` marker belongs to this exercise and is not part of the app.
