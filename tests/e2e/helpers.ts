import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test as base, expect, type Locator, type Page } from '@playwright/test';

/* Item discovery: one entry per file under src/content/items/<kind>/<id>.ts, read when tests are collected. */

const ITEMS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src/content/items');
export const BASE_PATH = process.env.BASE_PATH ?? '/pom-proof/';

export interface CatalogEntry {
  id: string;
  kind: string;
}

export const CATALOG: CatalogEntry[] = readdirSync(ITEMS_DIR)
  .filter((d) => statSync(path.join(ITEMS_DIR, d)).isDirectory())
  .sort()
  .flatMap((kind) =>
    readdirSync(path.join(ITEMS_DIR, kind))
      .filter((f) => f.endsWith('.ts'))
      .sort()
      .map((f) => ({ id: f.replace(/\.ts$/, ''), kind })),
  );

export const KINDS_WITH_ITEMS = [...new Set(CATALOG.map((e) => e.kind))];

export function itemsOf(kind: string) {
  return CATALOG.filter((e) => e.kind === kind);
}

/* Fixture: every test fails if the page logs an error or throws. */

/*
  Chromium logs this when Playwright's instrumentation meets a DOM change inside
  the locator lab's sandboxed iframe (sandbox="allow-same-origin", no scripts).
  The same Chromium build without Playwright attached logs nothing for the same
  page (checked 2026-11-26 with chromium-1255 --enable-logging). Locator markup
  with a real <script> would log it too, so the validator rejects scripts and
  inline handlers in locator html.
*/
const PLAYWRIGHT_SANDBOX_NOISE = "Blocked script execution in 'about:srcdoc' because the document's frame is sandboxed and the 'allow-scripts' permission is not set.";

export const test = base.extend<{ pageErrors: string[] }>({
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('console', (m) => {
        if (m.type() !== 'error') return;
        if (m.text() === PLAYWRIGHT_SANDBOX_NOISE && m.location().url === 'about:srcdoc') return;
        errors.push(`console.error: ${m.text()}`);
      });
      page.on('pageerror', (e) => errors.push(`uncaught: ${e.message}`));
      await use(errors);
      expect(errors, 'the page logged errors').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** Item data straight from the dev server's content module (functions are dropped). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadItem(page: Page, id: string): Promise<any> {
  const item = await page.evaluate(
    `(async () => {
      const mod = await import(${JSON.stringify(`${BASE_PATH}src/content/index.ts`)});
      const item = mod.ITEM_BY_ID[${JSON.stringify(id)}];
      return item ? JSON.parse(JSON.stringify(item)) : null;
    })()`,
  );
  expect(item, `item ${id} is in the content registry`).toBeTruthy();
  return item;
}

export async function loadKindInfo(page: Page): Promise<Record<string, { label: string; plural: string }>> {
  return page.evaluate(`import(${JSON.stringify(`${BASE_PATH}src/content/kinds.ts`)}).then((m) => m.KIND_INFO)`);
}

export function workspace(page: Page) {
  return page.getByRole('region', { name: 'Workspace' });
}

/** Opens an item and waits until its lab has replaced the loading fallback. */
export async function openItem(page: Page, id: string, title?: string) {
  await page.goto(`p/${id}`);
  const heading = page.getByRole('region', { name: 'Problem' }).getByRole('heading', { level: 1 });
  if (title) await expect(heading).toHaveText(title);
  else await expect(heading).toBeVisible();
  const ws = workspace(page);
  await expect(ws).toBeVisible();
  await expect(ws.getByText('Loading the lab')).toHaveCount(0);
  return ws;
}

/** Fails with a clear message when a lab is still the placeholder. */
export async function expectLabBuilt(ws: Locator, kind: string) {
  await expect(ws.getByText('Coming soon'), `the ${kind} lab is still a stub ("Coming soon")`).toHaveCount(0);
  await expect(ws.getByRole('button').first(), `the ${kind} lab rendered no controls`).toBeVisible();
}

/** Replaces the contents of a CodeMirror editor, found by its accessible name. */
export async function setEditor(page: Page, scope: Locator, name: string, text: string) {
  const editor = scope.getByRole('textbox', { name });
  await editor.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(text);
}

export function verdict(scope: Locator) {
  return scope.locator('.result-head[role="status"]');
}
