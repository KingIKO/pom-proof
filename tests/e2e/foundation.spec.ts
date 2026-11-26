import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import type { Answer } from '../../src/lib/contracts';

const prefix = '/pom-proof/';
const samples = [
  ['scenario', 'last-pickup-slot', 'Protect the last pickup slot', 'structured', {}],
  ['test-design', 'delivery-fee-mutants', 'Test the delivery fee boundary', 'mutation', { source: '' }],
  ['diagnosis', 'late-shipping-route', 'Diagnose a late shipping stub', 'structured', {}],
  ['bug-report', 'refund-duplicate-receipts', 'Report duplicate refund receipts', 'structured', {}],
  ['locator', 'refund-order-action', 'Locate the right refund button', 'locator', { by: 'css', selector: 'button' }],
  ['sql', 'latest-executed-run', 'Find tests whose latest run failed', 'sql', { query: 'SELECT 1' }],
  ['code', 'classify-test-retries', 'Classify test retries', 'code', { language: 'js', source: '' }],
] as const;

function observeRequests(page: Page) {
  const requests: string[] = [];
  const failures: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('requestfailed', (request) => failures.push(`${request.url()} ${request.failure()?.errorText}`));
  page.on('response', (response) => {
    if (!response.ok() && response.status() !== 304) failures.push(`${response.status()} ${response.url()}`);
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return {
    requests,
    check() {
      expect(requests.length).toBeGreaterThan(0);
      expect(requests.filter((request) => {
        const url = new URL(request);
        return url.origin !== new URL(page.url()).origin || !url.pathname.startsWith(prefix);
      })).toEqual([]);
      expect(failures).toEqual([]);
      expect(errors).toEqual([]);
    },
  };
}

test('worker and SQL WASM load below the Pages base', async ({ page }) => {
  const network = observeRequests(page);
  await page.goto(`${prefix}spike/`);
  await expect(page.locator('#worker-result')).toHaveText('2');
  await expect(page.locator('#sql-result')).toHaveText('1');
  expect(network.requests.some((url) => /\/_astro\/spike\.worker-.*\.js$/.test(url))).toBe(true);
  expect(network.requests.some((url) => /\/_astro\/sql-wasm-browser\..*\.wasm$/.test(url))).toBe(true);
  expect(await page.evaluate(() => crossOriginIsolated)).toBe(false);
  network.check();
  console.log(`Spike: worker=2; SQL WASM=1; ${network.requests.length} requests under ${prefix}`);
});

for (const [kind, id, title, engine, value] of samples) {
  test(`${kind} sample renders its workspace and editorial`, async ({ page }) => {
    const network = observeRequests(page);
    await page.goto(prefix);
    await expect(page.locator('astro-island')).toHaveCount(0);
    await expect(page.getByRole('navigation').getByRole('link')).toHaveCount(4);
    await page.getByRole('link', { name: title }).click();
    await expect(page).toHaveURL(`${prefix}practice/${kind}/${id}/`);
    await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Workspace' })).toBeVisible();
    const stub = page.getByTestId('engine-stub');
    await expect(stub).toHaveText('Not built yet');
    await expect(stub).toHaveAttribute('data-engine', engine);
    await expect(page.locator('astro-island')).toHaveCount(1);
    await page.waitForFunction(() => typeof window.__pomproof?.grade === 'function');
    expect(await page.evaluate((answer: Answer) => window.__pomproof!.grade(answer), { kind, value } as Answer))
      .toEqual({ kind, status: 'not-built' });
    if (kind === 'locator') {
      expect(await page.evaluate(() => window.__pomproof!.grade({ kind: 'sql', value: { query: 'SELECT 1' } })))
        .toMatchObject({ kind, status: 'invalid-answer' });
    }
    await page.getByRole('link', { name: 'Read the solution' }).click();
    await expect(page).toHaveURL(`${prefix}editorials/${id}/`);
    await expect(page.getByRole('heading', { name: `${title}: solution`, level: 1 })).toBeVisible();
    await expect(page.locator('astro-island')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Back to exercise' })).toHaveAttribute('href', `${prefix}practice/${kind}/${id}/`);
    network.check();
    console.log(`${kind}: ${engine} stub and editorial; ${network.requests.length} requests under ${prefix}`);
  });
}

test('mobile dark theme navigation, question disclosure, and access checks', async ({ page }) => {
  const network = observeRequests(page);
  await page.setViewportSize({ width: 375, height: 760 });
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto(prefix);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(`${prefix}#main`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('link', { name: 'Questions' }).click();
  await page.getByText('Read the model answer').click();
  await expect(page.getByText('Use separate contexts', { exact: false })).toBeVisible();
  await page.getByRole('link', { name: 'Tracks' }).click();
  await expect(page.getByRole('heading', { name: 'QA automation' })).toBeVisible();
  await page.getByRole('link', { name: 'Progress' }).click();
  await expect(page.getByText('Progress tracking is not available yet.')).toBeVisible();
  network.check();
});
