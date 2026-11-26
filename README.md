# POM Proof

Free interview practice for QA, test automation, and SDET roles. The site is static and the practice catalog is its home page.

## Run locally

Use Node 24.

```sh
npm ci
npx playwright install chromium
npm run verify
```

`verify` checks types, builds the site, runs unit tests, and runs Chromium against Astro preview. Playwright starts and stops preview on port 4327. To browse a build, run `npm run preview` and open `http://localhost:4321/pom-proof/`. The two runtime probes are at `/pom-proof/spike/`.

To exercise build-time reference validation, temporarily replace `scenario/last-pickup-slot` with `scenario/missing-slot` in `content/tracks/manual-qa.yaml`. `npm run build` exits with `Track "manual-qa" references missing problem "scenario/missing-slot"`. Restore the original ID and rerun the build.

## Author content

- Problem IDs are `<kind>/<id>`. IDs use lowercase letters, digits, and hyphens. Keep the final segment unique across kinds so it can name the matching editorial.
- Editorials use `problem: <kind>/<id>`. Tracks use those same problem IDs in their ordered `problems` list.
- A problem’s `reference` and `decoy` use the same value shape as an engine answer. `window.__pomproof.grade({ kind, value })` is available after the workspace hydrates. A non-graded result has no score.
- Use `src/lib/url.ts` for internal page links. Vite emits worker and WASM URLs under the configured base.

## Runtime and deployment limits

The five workspace engines report `Not built yet`. The progress store has a type contract only. The probes run fixed inputs; there is no evaluator for learner code, SQL, or locator submissions.

For engine work, run JS/TS in a dedicated module worker with `JS_WORKER_TIMEOUT_MS`, and load Python in a separate worker from the jsDelivr pin in `src/lib/run-worker.ts`. Render locator fixtures in an `iframe` with `sandbox="allow-same-origin"` and `srcdoc`; never grant `allow-scripts`. A worker timeout limits execution time but does not remove same-origin or network capabilities. Verify those boundaries before running submissions. The site does not require cross-origin isolation.

The workflow uploads the `dist` directory created by `verify`. In the repository’s Pages settings, the source must be GitHub Actions. After deployment, open `https://kingiko.github.io/pom-proof/spike/` and confirm it shows `2` and `1`.
