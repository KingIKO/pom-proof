import { expect, test, type Page } from '@playwright/test';
import { discoverProblems } from '../support/problems';
import { discoverStudyModules, discoverStudyPages } from '../support/study';

// The Study section from the practice and study plan, section 3: landing, module page, left nav,
// Mark as read, pager, Practice this and the five-link header.

const prefix = '/pom-proof/';
const modules = discoverStudyModules().sort((a, b) => Number(a.data.order) - Number(b.data.order));
const pages = discoverStudyPages();
const pageObjects = 'study/framework-design/page-object-model/';
const parameterised = 'study/framework-design/parameterised-tests/';
/** Written pages in reading order: module order, then page order. */
const reading = modules.flatMap(({ id }) => pages.filter(({ folder }) => folder === id)
  .sort((a, b) => Number(a.frontmatter.order) - Number(b.frontmatter.order)));

const header = (page: Page) => page.getByRole('navigation', { name: 'Main' });

test('the landing lists four stages and every module, with Coming soon for modules without pages', async ({ page }) => {
  await page.goto('study/');
  await expect(page.getByRole('heading', { level: 1, name: 'Study' })).toBeVisible();
  await expect(page.locator('.study-stage > h2')).toHaveText(['A. Foundations', 'B. Automation craft', 'C. Tools', 'D. Running at scale and beyond']);
  const cards = page.locator('[data-study-module]');
  await expect(cards).toHaveCount(modules.length);
  for (const { id, data } of modules) {
    const card = page.locator(`[data-study-module="${id}"]`);
    const count = pages.filter(({ folder }) => folder === id).length;
    await expect(card.getByRole('heading', { name: String(data.title) })).toBeVisible();
    if (count) {
      await expect(card.getByRole('link', { name: String(data.title) })).toHaveAttribute('href', `${prefix}study/${id}/`);
      await expect(card).toContainText(`${count} page${count === 1 ? '' : 's'}`);
      await expect(card).not.toContainText('Coming soon');
    } else {
      await expect(card.getByRole('link')).toHaveCount(0);
      await expect(card).toContainText('Coming soon');
    }
  }
  await expect(header(page).getByRole('link', { name: 'Study' })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('link', { name: 'Start here' }).click();
  await expect(page).toHaveURL(`${prefix}${reading[0].path}`);
});

test('the module page lists its pages in order and the left nav opens only the current module', async ({ page }) => {
  await page.goto('study/framework-design/');
  const list = page.getByRole('list', { name: 'Framework design pages', exact: true });
  await expect(list.getByRole('heading', { level: 2 })).toHaveText(reading.filter(({ folder }) => folder === 'framework-design')
    .map(({ frontmatter }) => String(frontmatter.title)));
  const nav = page.getByRole('navigation', { name: 'Study modules' });
  await expect(nav.locator('.study-nav-pages')).toHaveCount(1);
  await expect(nav.getByRole('link', { name: 'Framework design' })).toHaveAttribute('aria-current', 'page');

  await page.goto(pageObjects);
  await expect(nav.locator('.study-nav-pages')).toHaveCount(1);
  await expect(nav.getByRole('list', { name: 'Pages in Framework design' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Page Object Model' })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: 'Framework design' })).toHaveAttribute('aria-current', 'true');
  await expect(header(page).getByRole('link', { name: 'Study' })).toHaveAttribute('aria-current', 'location');
});

test('Mark as read survives a reload, shows on the module and landing, and Mark as unread clears it', async ({ page }) => {
  await page.goto(pageObjects);
  await expect(page.getByRole('button', { name: 'Mark as unread' })).toBeHidden();
  await page.getByRole('button', { name: 'Mark as read' }).click();
  await expect(page.getByRole('button', { name: 'Mark as unread' })).toBeFocused();
  await expect(page.locator('[data-study-day]')).toHaveText(/^Read on \d{1,2} [A-Z][a-z]{2}$/);
  await expect(page.getByRole('button', { name: 'Mark as read' })).toBeHidden();
  await expect(page.getByRole('navigation', { name: 'Study modules' }).getByRole('link', { name: /Page Object Model/ })).toContainText('Read');

  await page.reload();
  await expect(page.locator('[data-study-day]')).toHaveText(/^Read on /);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('pom-proof:study') ?? 'null'));
  expect(stored).toEqual({ version: 1, read: { 'framework-design/page-object-model': expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) } });

  await page.goto('study/framework-design/');
  await expect(page.getByRole('list', { name: 'Framework design pages', exact: true })
    .locator('[data-study-status="framework-design/page-object-model"]')).toHaveText('Read');
  await page.goto('study/');
  const card = page.locator('[data-study-module="framework-design"]');
  const written = pages.filter(({ folder }) => folder === 'framework-design').length;
  await expect(card).toContainText(`1 of ${written} read`);
  const next = reading.find(({ id }) => id !== 'framework-design/page-object-model');
  if (next) {
    await expect(page.getByRole('link', { name: 'Continue' })).toHaveAttribute('href', `${prefix}${next.path}`);
  }

  await page.goto(pageObjects);
  await page.getByRole('button', { name: 'Mark as unread' }).click();
  await expect(page.getByRole('button', { name: 'Mark as read' })).toBeFocused();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Mark as read' })).toBeVisible();
  await page.goto('study/');
  await expect(card.locator('[data-study-count]')).toBeHidden();
  await expect(page.getByRole('link', { name: 'Start here' })).toBeVisible();
});

test('a page that cannot save its read mark says so', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
  });
  await page.goto(pageObjects);
  await page.getByRole('button', { name: 'Mark as read' }).click();
  await expect(page.getByRole('alert')).toHaveText('The browser could not save this. Check its storage settings and try again.');
  await expect(page.getByRole('button', { name: 'Mark as read' })).toBeVisible();
});

test('the pager walks the pages in reading order and links the module overview', async ({ page }) => {
  expect(reading.length, 'two pilot pages').toBeGreaterThanOrEqual(2);
  await page.goto(reading[0].path);
  const pager = page.getByRole('navigation', { name: 'Study pages' });
  await expect(pager.locator('a[rel="prev"]')).toHaveCount(0);
  await pager.locator('a[rel="next"]').click();
  await expect(page).toHaveURL(`${prefix}${reading[1].path}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(String(reading[1].frontmatter.title));
  await pager.locator('a[rel="prev"]').click();
  await expect(page).toHaveURL(`${prefix}${reading[0].path}`);
  await pager.getByRole('link', { name: 'Module overview' }).click();
  await expect(page).toHaveURL(`${prefix}study/${reading[0].folder}/`);
  await page.goto(reading.at(-1)!.path);
  await expect(pager.locator('a[rel="next"]')).toHaveCount(0);
});

test('Practice this opens the practice list filtered to the page topics', async ({ page }) => {
  const study = pages.find(({ path }) => path === parameterised)!;
  const topics = study.frontmatter.practiceTopics as string[];
  const expected = discoverProblems().filter(({ data }) => topics.includes(data.topic)).length;
  await page.goto(parameterised);
  const link = page.getByRole('link', { name: `Practice ${expected} problem${expected === 1 ? '' : 's'}` });
  await expect(link).toHaveAttribute('href', `${prefix}?topic=${topics.join(',')}`);
  await link.click();
  await expect(page.getByRole('table', { name: 'Practice problems' }).locator('tbody tr')).toHaveCount(expected);
  for (const topic of topics) await expect(page.locator(`input[name="topic"][value="${topic}"]`)).toBeChecked();
});

test('the language switcher changes the Study example', async ({ page }) => {
  await page.goto(parameterised);
  const figure = page.locator('[data-code-example]');
  const languages = figure.getByRole('group', { name: 'Example language' });
  await expect(languages.getByRole('button', { name: 'TypeScript' })).toHaveAttribute('aria-pressed', 'true');
  await expect(figure.getByRole('region', { name: 'Code example: Playwright Test' })).toBeVisible();
  await languages.getByRole('button', { name: 'Python' }).click();
  await expect(languages.getByRole('button', { name: 'Python' })).toHaveAttribute('aria-pressed', 'true');
  await expect(figure.getByRole('region', { name: 'Code example: pytest' })).toContainText('@pytest.mark.parametrize');
});

test('the page object page gives both sides of the assertion dispute', async ({ page }) => {
  await page.goto(pageObjects);
  const dispute = page.locator('section[aria-labelledby="study-disagree"]');
  await expect(dispute.getByRole('heading', { name: 'Should a page object contain assertions?' })).toBeVisible();
  const positions = dispute.getByRole('listitem');
  await expect(positions).toHaveCount(2);
  await expect(positions.nth(0).getByRole('link')).toHaveAttribute('href', 'https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/');
  await expect(positions.nth(1).getByRole('link')).toHaveAttribute('href', 'https://playwright.dev/docs/pom');
  await expect(page.getByText('not written yet')).toBeVisible();
});

test.describe('at 360px', () => {
  test.use({ viewport: { width: 360, height: 760 } });

  for (const path of ['study/', pageObjects]) {
    test(`/${path} shows all five header links without overflow`, async ({ page }) => {
      await page.goto(path);
      const links = header(page).getByRole('link');
      await expect(links).toHaveText(['Practice', 'Study', 'Questions', 'Tracks', 'Progress']);
      for (const link of await links.all()) {
        await expect(link).toBeInViewport({ ratio: 1 });
        const box = (await link.boundingBox())!;
        expect(box.height, 'a 44px tall target').toBeGreaterThanOrEqual(44);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth), 'no sideways scroll').toBe(360);
      expect(await header(page).evaluate((nav) => nav.scrollWidth - nav.clientWidth), 'the nav does not scroll').toBe(0);
    });
  }

  test('the module list is one closed disclosure above the page', async ({ page }) => {
    await page.goto(pageObjects);
    const modules = page.locator('details[data-study-nav]');
    await expect(modules).not.toHaveAttribute('open');
    await expect(modules.locator('summary')).toContainText('Modules: Framework design');
    await modules.locator('summary').click();
    await expect(page.getByRole('navigation', { name: 'Study modules' }).getByRole('link', { name: 'Parameterised and data-driven tests' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360);
  });
});
