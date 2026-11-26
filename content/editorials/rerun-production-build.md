---
problem: locator/rerun-production-build
---

```ts
page.getByRole('region', { name: 'Release checks', exact: true })
  .getByRole('row')
  .filter({ hasText: 'Production' })
  .filter({ hasText: 'BLD-813' })
  .getByRole('button', { name: 'Rerun', exact: true })
```

The row must be in Release checks and contain both `Production` and `BLD-813`. Apply the two text filters to the same row locator. That is different from searching for both phrases anywhere on the page. Then look inside that row for the `Rerun` button, regardless of how its actions are arranged.

The first production rerun is correct at first. It becomes the older `BLD-801` when several production failures are shown. Even filtering by both pieces of row text would return a second match once the Rollback drill presents an identical row. The named region separates those two tools and stays the same when the visible headings are translated.

In an interview, mention the limit of string `hasText`: it matches substrings anywhere in the row. These two phrases identify the row in this fixture set. If the Release checks region adds a `Production mirror` environment or a build named `BLD-8130`, use stable row attributes or match the environment and build as exact cell values.

Sources: [Playwright locators](https://playwright.dev/docs/locators) and [Playwright best practices](https://playwright.dev/docs/best-practices).
