import { expect, test } from '@playwright/test';
import { locatorSource, type ProblemOf } from '../support/answers';
import { discoverProblems } from '../support/problems';
import { openWorkspace, resultPanel } from '../support/workspace';

const problem = discoverProblems().find((candidate): candidate is ProblemOf<'locator'> => candidate.kind === 'locator');

// On a slow device the variant previews mount while their frames are still parsing, and
// src/engines/locator/fixtures.ts reads a null document body: the preview throws and never offers
// its HTML. Measured 2026-11-26 on the Phase 2 live site and the Phase 3 tree, 16 runs each at 8
// workers: 16 of 16 at a 4x CPU slowdown, 5 of 16 at none. The race can still miss once on a
// fully loaded machine, so the test gives it three fresh page loads.
test('on a slow CPU every fixture preview offers its HTML after a submit, without page errors', async ({ page }) => {
  expect(problem, 'a locator problem').toBeDefined();
  const { variants } = problem!.data;
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await openWorkspace(page, problem!);
    await page.getByRole('textbox', { name: 'Locator expression' }).fill(locatorSource(problem!.data.reference));
    await page.getByRole('region', { name: 'Workspace' }).getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(resultPanel(page, 'Pass')).toBeVisible();
    await expect(page.locator('iframe.locator-fixture:not(.locator-measurement)')).toHaveCount(variants.length + 1);

    await expect(page.getByText('Show fixture HTML', { exact: true }),
      `attempt ${attempt}: every fixture preview, the original and each variant, offers its HTML`).toHaveCount(variants.length + 1);
    expect(errors, `attempt ${attempt}: page errors`).toEqual([]);
  }
});
