---
title: Find the rerun action for a production build
kind: locator
topic: playwright
difficulty: hard
minutes: 8
roles: [automation, sdet, senior]
fixture: |
  <section aria-label="Release checks" class="css-b710x">
    <h2>Release checks</h2>
    <table><thead><tr><th>Environment</th><th>Build</th><th>Result</th><th>Actions</th></tr></thead>
      <tbody>
        <tr><td>Production</td><td>BLD-813</td><td>Failed</td><td><button data-fixture-target="rerun-prod-813">Rerun</button><button>Logs</button></td></tr>
        <tr><td>Staging</td><td>BLD-813</td><td>Failed</td><td><button>Rerun</button><button>Logs</button></td></tr>
      </tbody>
    </table>
  </section>
  <section aria-label="Rollback drill"><h2>Rollback drill</h2><p>No builds to rerun.</p></section>
target: '[data-fixture-target="rerun-prod-813"]'
variants:
  - name: older-production-build-prepended
    fixture: |
      <section aria-label="Release checks" class="css-b710x">
        <h2>Release checks</h2>
        <table><thead><tr><th>Environment</th><th>Build</th><th>Result</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td>Production</td><td>BLD-801</td><td>Failed</td><td><button>Rerun</button></td></tr>
            <tr><td>Staging</td><td>BLD-813</td><td>Failed</td><td><button>Rerun</button><button>Logs</button></td></tr>
            <tr><td>Production</td><td>BLD-813</td><td>Failed</td><td><button data-fixture-target="rerun-prod-813">Rerun</button><button>Logs</button></td></tr>
          </tbody>
        </table>
      </section>
  - name: mirrored-build-in-rollback-drill
    fixture: |
      <section aria-label="Rollback drill">
        <h2>Simulation de restauration</h2>
        <table><tbody><tr><td>Production</td><td>BLD-813</td><td>Échec</td><td><button>Rerun</button></td></tr></tbody></table>
      </section>
      <section aria-label="Release checks" class="css-m510a">
        <h2>Vérifications de version</h2>
        <table><tbody>
          <tr><td>Staging</td><td>BLD-813</td><td>Échec</td><td><button>Rerun</button></td></tr>
          <tr><td>Production</td><td><strong>BLD-813</strong></td><td>Échec</td><td><div><button>Logs</button><button data-fixture-target="rerun-prod-813">Rerun</button></div></td></tr>
        </tbody></table>
      </section>
reference:
  by: expression
  source: "page.getByRole('region', { name: 'Release checks', exact: true }).getByRole('row').filter({ hasText: 'Production' }).filter({ hasText: 'BLD-813' }).getByRole('button', { name: 'Rerun', exact: true })"
decoy: { by: expression, source: "page.getByRole('row').filter({ hasText: 'Production' }).getByRole('button', { name: 'Rerun', exact: true }).nth(0)" }
---

Use a Playwright-style expression to find `Rerun` for production build `BLD-813` under `Release checks`. Staging can show the same build number, and the rollback drill can show an identical row for practice. Keep all three parts of the build's identity in the locator.

The `data-fixture-target` marker belongs to this exercise and is not part of the app.
