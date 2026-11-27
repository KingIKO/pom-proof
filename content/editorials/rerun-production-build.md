---
problem: locator/rerun-production-build
---

## What is going on

The release checks list production and staging builds, and several failed runs can have the same `Rerun` action. The rollback drill can even show the same build in the same environment. To rerun production `BLD-813` for real, the test needs the right tool as well as the right environment and build number.

## The fix

```ts
page.getByRole('region', { name: 'Release checks', exact: true })
  .getByRole('row')
  .filter({ hasText: 'Production' })
  .filter({ hasText: 'BLD-813' })
  .getByRole('button', { name: 'Rerun', exact: true })
```

1. Scope to the region named exactly `Release checks`.

   **Why:** In `mirrored-build-in-rollback-drill`, both tools show production `BLD-813`. The region's accessible name stays fixed even when the visible heading is translated, and it excludes the drill before either text filter runs.

2. Search within that region for rows by role.

   **Why:** In `older-production-build-prepended`, `Production` and `BLD-813` also appear in different rows. The row gives both filters the same scope, so unrelated matches elsewhere cannot satisfy the pair.

3. Keep rows containing `Production`.

   **Why:** In `mirrored-build-in-rollback-drill`, staging also lists `BLD-813`; the environment check keeps the staging action out.

4. Further filter those rows by `BLD-813`.

   **Why:** In `older-production-build-prepended`, the older `BLD-801` is also in production. The second filter removes it, and the build number can still match text inside a `strong` element in `mirrored-build-in-rollback-drill`.

5. Find the exact `Rerun` button inside the remaining row.

   **Why:** In `mirrored-build-in-rollback-drill`, `Logs` comes first and both controls gain a wrapper. The named descendant lookup skips `Logs` without relying on the button's position.

## Why the tempting answer fails

The first production rerun works while there is only one production failure. In `older-production-build-prepended`, it would run `BLD-801`. In `mirrored-build-in-rollback-drill`, it chooses the drill's button; even adding the build filter without the region would leave two matches there.

## What the interviewer listens for

Explain that both string `hasText` filters match substrings within the same row. If the region can contain `Production mirror` or `BLD-8130`, match exact cell values or use stable row attributes.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
