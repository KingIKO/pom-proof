---
problem: locator/delivery-region-field
---

```ts
page.getByRole('group', { name: 'Delivery address', exact: true })
  .getByLabel('Region', { exact: true })
```

The `fieldset` gives the delivery controls a group, and its `legend` gives that group a name. Scope to `Delivery address` before looking for the labeled input. The label matcher uses the whole label, so a new input called `Region code` does not match. A wrapper or a new field ID has no effect as long as the label still points to the input.

The first input labeled `Region` is the delivery field on the original screen. When billing moves up, selecting the first match fills the billing field. Both inputs can accept the same text, so a test may run to completion with the wrong address data. In the version with `Region code`, an unqualified substring match would introduce another possible control.

In an interview, explain how the markup solves the ambiguity the customer sees: each address section has a distinct heading even when individual field labels are repeated. Say what distinguishes the two saved values in an assertion. For example, a test can reopen the order and check the delivery address separately from the billing address.

Sources: [Playwright locators](https://playwright.dev/docs/locators) and [Playwright best practices](https://playwright.dev/docs/best-practices).
