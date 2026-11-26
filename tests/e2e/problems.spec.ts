import { CATALOG, KINDS_WITH_ITEMS, expect, itemsOf, loadKindInfo, test } from './helpers';

test('problems list shows every item and filters by kind', async ({ page }) => {
  await page.goto('problems');
  await expect(page.getByRole('heading', { level: 1, name: 'Problems' })).toBeVisible();
  const rows = page.locator('table.table tbody tr');
  await expect(rows).toHaveCount(CATALOG.length);

  const info = await loadKindInfo(page);
  const kindGroup = page.getByRole('group', { name: 'Kind' });
  // "All" plus one button per kind that has items, and no button for empty kinds.
  await expect(kindGroup.getByRole('button')).toHaveCount(1 + KINDS_WITH_ITEMS.length);

  for (const kind of KINDS_WITH_ITEMS) {
    const expected = itemsOf(kind);
    const button = kindGroup.getByRole('button', { name: `${info[kind].plural} ${expected.length}`, exact: true });
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(new RegExp(`[?&]kind=${kind}(&|$)`));
    await expect(rows).toHaveCount(expected.length);
    await expect(rows.locator('td.col-kind')).toHaveText(expected.map(() => info[kind].label));
  }

  const all = kindGroup.getByRole('button', { name: `All ${CATALOG.length}`, exact: true });
  await all.click();
  await expect(all).toHaveAttribute('aria-pressed', 'true');
  await expect(rows).toHaveCount(CATALOG.length);
});
