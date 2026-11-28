import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { discoverProblems } from '../support/problems';
import { discoverStudyPages, studyModulePaths } from '../support/study';

const prefix = '/pom-proof/';
const problems = discoverProblems();
const studyPages = discoverStudyPages();
const indexPages = ['', 'study/', 'questions/', 'tracks/', 'progress/'];
const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", '#x27': "'" };
const decode = (text: string) => text.replace(/&(amp|lt|gt|quot|#39|#x27);/g, (_, name: string) => entities[name]);

type Link = { from: string; href: string };
type Fetched = { status: number; html: string };

/** Every <a href> in server HTML, resolved against the page URL. Includes links inside <noscript>. */
function anchorsIn(html: string, pageUrl: string): string[] {
  return Array.from(html.matchAll(/<a\b[^>]*?\shref="([^"]*)"/g), ([, href]) => new URL(decode(href), pageUrl).href);
}

/** Links on the rendered page once its islands have hydrated, so links drawn by an island count too. */
async function renderedLinks(page: Page, path: string): Promise<Link[]> {
  const response = await page.goto(path);
  expect(response?.status(), `/${path} status`).toBe(200);
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  const hrefs = await page.locator('a[href]').evaluateAll((anchors) => anchors.map((anchor) => (anchor as HTMLAnchorElement).href));
  expect(hrefs.length, `/${path} has links`).toBeGreaterThan(0);
  return hrefs.map((href) => ({ from: page.url(), href }));
}

/** Fetches each URL once, a few at a time, without following redirects: a link must land on the page itself. */
async function fetchAll(request: APIRequestContext, urls: string[]) {
  const results = new Map<string, Fetched>();
  const queue = [...new Set(urls)];
  await Promise.all(Array.from({ length: 12 }, async () => {
    for (let url = queue.shift(); url !== undefined; url = queue.shift()) {
      const response = await request.get(url, { maxRedirects: 0 });
      results.set(url, { status: response.status(), html: await response.text() });
    }
  }));
  return results;
}

/**
 * Every same-origin link must stay under the Pages base and answer 200 directly; a link with a
 * fragment must also find that id on its page. Returns the number of distinct pages checked.
 */
async function expectLinksResolve(request: APIRequestContext, origin: string, links: Link[]) {
  const internal = links.filter(({ href }) => new URL(href).origin === origin);
  expect(internal.length, 'internal links found').toBeGreaterThan(0);
  expect(internal.filter(({ href }) => !new URL(href).pathname.startsWith(prefix)).map(({ from, href }) => `${from} -> ${href}`),
    'internal links outside the Pages base').toEqual([]);

  const target = (href: string) => { const url = new URL(href); url.hash = ''; return url.href; };
  const pages = await fetchAll(request, internal.map(({ href }) => target(href)));
  expect(internal.filter(({ href }) => pages.get(target(href))!.status !== 200)
    .map(({ from, href }) => `${from} -> ${href}: ${pages.get(target(href))!.status}`), 'links that do not answer 200').toEqual([]);

  const missingFragments = internal.filter(({ href }) => {
    const id = decodeURIComponent(new URL(href).hash.slice(1));
    return id && !pages.get(target(href))!.html.includes(`id="${id}"`);
  });
  expect(missingFragments.map(({ from, href }) => `${from} -> ${href}`), 'links to a fragment the page does not have').toEqual([]);
  return pages.size;
}

test('every internal link on the list, questions, tracks and progress pages answers 200 under /pom-proof/', async ({ page, request, baseURL }, testInfo) => {
  const links: Link[] = [];
  for (const path of indexPages) links.push(...await renderedLinks(page, path));
  const checked = await expectLinksResolve(request, new URL(baseURL!).origin, links);
  testInfo.annotations.push({ type: 'links', description: `${links.length} links from ${indexPages.length} pages, ${checked} distinct pages checked` });
});

// Problem pages draw no links from their islands, so the server HTML holds every link they have,
// including the editorial link inside <noscript>.
test('every internal link on every problem page answers 200 under /pom-proof/', async ({ request, baseURL }, testInfo) => {
  expect(problems.length, 'problems to crawl').toBeGreaterThan(0);
  const urls = problems.map(({ path }) => new URL(path, baseURL).href);
  const sources = await fetchAll(request, urls);
  expect(urls.filter((url) => sources.get(url)!.status !== 200), 'problem pages that do not answer 200').toEqual([]);
  const links = urls.flatMap((url) => anchorsIn(sources.get(url)!.html, url).map((href) => ({ from: url, href })));
  expect(urls.filter((url) => !links.some(({ from, href }) => from === url && href.includes('/editorials/'))),
    'problem pages without an editorial link').toEqual([]);
  const checked = await expectLinksResolve(request, new URL(baseURL!).origin, links);
  testInfo.annotations.push({ type: 'links', description: `${links.length} links from ${urls.length} problem pages, ${checked} distinct pages checked` });
});

// Study pages draw their read marks from a script but no links, so the rendered page holds every
// link: the module list, prerequisites, Practice this, sources and the pager.
test('every internal link on every Study module and page answers 200 under /pom-proof/', async ({ page, request, baseURL }, testInfo) => {
  const paths = [...studyModulePaths(studyPages), ...studyPages.map(({ path }) => path)];
  expect(studyPages.length, 'Study pages to crawl').toBeGreaterThan(0);
  const links: Link[] = [];
  for (const path of paths) links.push(...await renderedLinks(page, path));
  const checked = await expectLinksResolve(request, new URL(baseURL!).origin, links);
  testInfo.annotations.push({ type: 'links', description: `${links.length} links from ${paths.length} Study pages, ${checked} distinct pages checked` });
});

test('every practice list row links to its own problem page', async ({ page, request, baseURL }) => {
  await page.goto('');
  const rows = page.getByRole('table', { name: 'Practice problems' }).locator('tbody tr');
  await expect(rows).toHaveCount(problems.length);
  const listed = await rows.locator('.catalog-title a').evaluateAll((anchors) =>
    anchors.map((anchor) => ({ title: anchor.textContent?.trim() ?? '', href: (anchor as HTMLAnchorElement).href })));
  expect(listed).toHaveLength(problems.length);

  const byTitle = new Map(problems.map((problem) => [problem.data.title, problem]));
  expect(byTitle.size, 'problem titles are unique, so a row names one problem').toBe(problems.length);
  expect(listed.filter(({ title, href }) => byTitle.get(title) === undefined || href !== new URL(byTitle.get(title)!.path, baseURL).href)
    .map(({ title, href }) => `${title} -> ${href}`), 'rows linking somewhere other than their problem').toEqual([]);

  const pages = await fetchAll(request, listed.map(({ href }) => href));
  const heading = (html: string) => decode(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1].replace(/<[^>]+>/g, '').trim() ?? '');
  expect(listed.filter(({ href, title }) => pages.get(href)!.status !== 200 || heading(pages.get(href)!.html) !== title)
    .map(({ title, href }) => `${title} -> ${href}: ${pages.get(href)!.status} "${heading(pages.get(href)!.html)}"`),
  'rows whose page does not load with the row title').toEqual([]);
});

for (const path of ['this-page-does-not-exist/', 'practice/code/no-such-problem/']) {
  test(`/${path} shows the site's 404 page with working links`, async ({ page, request, baseURL }) => {
    const failures: string[] = [];
    page.on('requestfailed', (request) => failures.push(`${request.url()} ${request.failure()?.errorText}`));
    // The document itself answers 404 on purpose; everything it loads must succeed.
    page.on('response', (response) => {
      if (response.request().resourceType() !== 'document' && !response.ok() && response.status() !== 304) {
        failures.push(`${response.status()} ${response.url()}`);
      }
    });
    const response = await page.goto(path);
    expect(response?.status(), `/${path} status`).toBe(404);
    await expect(page).toHaveTitle('Page not found | POM Proof');
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
    await expect(page.locator('main > .title-band h1'), 'the heading sits in the title band').toHaveText('Page not found');
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link')).toHaveCount(5);
    // The four sections, linked from the page body as well as the header.
    const main = page.getByRole('main');
    await expect(main.getByRole('link', { name: 'Practice', exact: true })).toHaveAttribute('href', prefix);
    await expect(main.getByRole('link', { name: 'Questions', exact: true })).toHaveAttribute('href', `${prefix}questions/`);
    await expect(main.getByRole('link', { name: 'Tracks', exact: true })).toHaveAttribute('href', `${prefix}tracks/`);
    await expect(main.getByRole('link', { name: 'Progress', exact: true })).toHaveAttribute('href', `${prefix}progress/`);
    // Styles load from the base at any depth, so the page is drawn with the site's own stylesheet.
    expect(await page.evaluate(() => document.styleSheets.length), 'stylesheets on the 404 page').toBeGreaterThan(0);
    expect(failures, 'failed requests on the 404 page').toEqual([]);

    // A same-page link (Skip to content) points at this 404 address, so its target is checked here.
    const links = await page.locator('a[href]').evaluateAll((anchors) => anchors.map((anchor) => (anchor as HTMLAnchorElement).href));
    const here = new URL(page.url());
    const samePage = links.filter((href) => { const url = new URL(href); return url.origin === here.origin && url.pathname === here.pathname; });
    for (const href of samePage) await expect(page.locator(`[id="${new URL(href).hash.slice(1)}"]`), href).toHaveCount(1);
    await expectLinksResolve(request, new URL(baseURL!).origin,
      links.filter((href) => !samePage.includes(href)).map((href) => ({ from: page.url(), href })));
  });
}
