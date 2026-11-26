# Decision note: Static practice foundation

Status: implemented (one static artifact, with grading and storage deferred)

## Problem

Interview samples must work at a GitHub Pages project path, and a malformed entry or dangling track reference must prevent deployment.

## Decision

Astro owns the catalog and static routes. Content loads through root-level collections with Zod validators. Build-time lookups reject dangling references because Astro’s `reference()` validates the reference value but does not establish that the target exists. Only workspace pages hydrate Preact. The deployment job uploads the `dist` that browser tests exercised.

## Alternatives considered

Running `withastro/action@v6` after verification repeats the installation and build. The workflow uses the action’s prescribed Astro build command through `verify` and uploads that same output.

Using only `reference()` accepts a well-formed ID that points to no problem. The static catalog and track renderer resolve the IDs explicitly.

## Consequences

There is no server to store progress or protect answer keys. Public samples and their editorials suit self-study. The build proves the asset URLs under `/pom-proof/`; browser tests also exercise the fetched worker and WASM.
