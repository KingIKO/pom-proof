---
problem: locator/rerun-production-build
---

## What is going on

The release checks list builds for production, the live app, and staging, the test environment. Several failed runs can have the same `Rerun` action. The rollback drill, a practice run for switching to an earlier version, can show an identical row. To rerun production `BLD-813` for real, the test must start in `Release checks`. It must match the environment and build number on the same row.

The fix chains Playwright locators, expressions that find page elements. Each step searches only inside the result of the step before it. A region is a page section with an accessible name. The accessible name is what assistive technology, such as a screen reader, announces for an element.

## The fix

```ts
page.getByRole('region', { name: 'Release checks', exact: true })
  .getByRole('row')
  .filter({ hasText: 'Production' })
  .filter({ hasText: 'BLD-813' })
  .getByRole('button', { name: 'Rerun', exact: true })
```

1. Narrow the search to the region named exactly `Release checks`.

   **Why:** In `mirrored-build-in-rollback-drill`, both tools show production `BLD-813`. The region's accessible name stays the same, even when the visible heading is translated. It also leaves out the drill before either text filter runs.

2. Search within that region for rows by role.

   **Why:** In `older-production-build-prepended`, `Production` and `BLD-813` also appear in different rows. Searching by row makes both filters check the same row. So `Production` in one row and `BLD-813` in another cannot count as a match.

3. Keep rows that contain `Production`.

   **Why:** In `mirrored-build-in-rollback-drill`, staging also lists `BLD-813`. The environment check keeps the staging action out.

4. Filter those rows again by `BLD-813`.

   **Why:** In `older-production-build-prepended`, the older `BLD-801` is also in production. The second filter removes it. In `mirrored-build-in-rollback-drill`, the build number sits inside a `strong` element, and the filter can still match it.

5. Find the exact `Rerun` button inside the remaining row.

   **Why:** In `mirrored-build-in-rollback-drill`, `Logs` comes first, and both controls gain a wrapper. The lookup searches inside the row for a button with that name. So it skips `Logs` without relying on the button's position.

## Why the tempting answer fails

The decoy picks the first production `Rerun` button. That works while there is only one production failure. In `older-production-build-prepended`, it would run `BLD-801`. In `mirrored-build-in-rollback-drill`, it chooses the drill's button. Even with the build filter added, a search without the region would still find two matches there.

## What the interviewer listens for

Explain that each `hasText` filter takes a string and checks whether it appears anywhere in the row's text. Both filters still have to match the same row. For example, the environment filter would also match `Production mirror`. The build filter would also match `BLD-8130`. If those values can appear, match exact cell values or use stable row attributes.

## Sources

- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
