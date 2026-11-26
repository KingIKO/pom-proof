import type { Page, Locator } from '@playwright/test';
import { KINDS_WITH_ITEMS, expect, expectLabBuilt, itemsOf, loadItem, openItem, setEditor, test, verdict } from './helpers';

/*
  One test per item, discovered from the files under src/content/items. Every
  item must open its lab without console errors. Kinds that can be solved
  through the UI also get a solve check: the first coding, mutation and SQL
  item, every locator example and every UI automation item.
*/

type Solver = (page: Page, ws: Locator, item: any) => Promise<void>;

const solveFirst: Record<string, Solver> = {
  async coding(page, ws, item) {
    await setEditor(page, ws, 'Solution code', item.reference.javascript);
    await ws.getByRole('button', { name: 'Submit' }).click();
    await expect(verdict(ws)).toContainText('Accepted');
  },
  async mutation(page, ws, item) {
    await setEditor(page, ws, 'Your tests', item.referenceTests);
    await ws.getByRole('button', { name: 'Submit' }).click();
    await expect(verdict(ws)).toContainText('Every bug caught', { timeout: 30_000 });
  },
  async sql(page, ws, item) {
    await setEditor(page, ws, 'SQL query', item.answer);
    await ws.getByRole('button', { name: 'Submit' }).click();
    await expect(verdict(ws)).toContainText('Accepted');
  },
};

const solveEvery: Record<string, Solver> = {
  async locator(page, ws, item) {
    // The page lives in an iframe; wait until its markup is there before grading.
    await expect(page.frameLocator('iframe[title="Practice page"]').locator(item.target).first()).toBeAttached();
    const examples = Object.entries(item.examples as Record<string, string>);
    expect(examples.length, 'item has example answers').toBeGreaterThan(0);
    for (const [syntax, expr] of examples) {
      const input = ws.getByRole('textbox', { name: 'Locator' });
      await input.fill(expr);
      await ws.getByRole('button', { name: 'Check' }).click();
      await expect(verdict(ws), `${syntax} example ${expr}`).toContainText('Correct');
      await expect(verdict(ws), `${syntax} example ${expr}`).not.toContainText('brittle');
    }
  },
  async uilab(page, ws, item) {
    test.setTimeout(120_000);
    await setEditor(page, ws, 'Your tests', item.referenceTests);
    await ws.getByRole('button', { name: 'Submit' }).click();
    await expect(verdict(ws)).toContainText('Every bug caught', { timeout: 100_000 });
    await expect(ws.locator('.mutant--killed')).toHaveCount(item.mutants.length);
  },
};

for (const kind of KINDS_WITH_ITEMS) {
  test.describe(`${kind} lab`, () => {
    itemsOf(kind).forEach((entry, index) => {
      const solver = solveEvery[kind] ?? (index === 0 ? solveFirst[kind] : undefined);
      const name = solver ? `${entry.id}: opens and solves with the reference` : `${entry.id}: opens without errors`;
      test(name, async ({ page }) => {
        const ws = await openItem(page, entry.id);
        const item = await loadItem(page, entry.id);
        expect(item.kind, 'kind matches the folder').toBe(kind);
        await expect(page.getByRole('region', { name: 'Problem' }).getByRole('heading', { level: 1 })).toHaveText(item.title);
        await expectLabBuilt(ws, kind);
        if (solver) await solver(page, ws, item);
      });
    });
  });
}
