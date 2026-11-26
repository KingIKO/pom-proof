import { expect, type Locator, type Page } from '@playwright/test';
import type { DiscoveredProblem } from './problems';

type StructuredData = Extract<DiscoveredProblem['data'], { kind: 'scenario' | 'diagnosis' | 'bug-report' }>;

export async function openWorkspace(page: Page, problem: DiscoveredProblem) {
  const response = await page.goto(problem.path);
  expect(response?.status(), `${problem.path} status`).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: problem.data.title })).toBeVisible();
  // Astro removes the ssr attribute once an island hydrates.
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
}

/** Replaces the whole CodeMirror document with `source`, typed as one input so nothing is auto-indented. */
export async function replaceEditor(editor: Locator, source: string) {
  await editor.click();
  await editor.press('ControlOrMeta+a');
  await editor.page().keyboard.insertText(source);
  await expect(editor).toContainText(source.split('\n')[0]);
}

/** The result panel once it shows a mark: Pass, Fail or Not graded. */
export const resultPanel = (page: Page, mark: 'Pass' | 'Fail' | 'Not graded') =>
  page.getByRole('status').filter({ hasText: `${mark}:` });

/** Enters a structured answer through the page's own controls. */
export async function answerStructured(page: Page, data: StructuredData, value: StructuredData['reference']) {
  for (const item of data.items) {
    const picks = [value[item.id] ?? []].flat();
    const fieldset = page.getByRole('group', { name: item.prompt });
    switch (item.type) {
      case 'line-marking':
        for (const line of item.lines) {
          const button = fieldset.getByRole('button', { name: line.text });
          if ((await button.getAttribute('aria-pressed') === 'true') !== picks.includes(line.id)) await button.click();
          await expect(button).toHaveAttribute('aria-pressed', String(picks.includes(line.id)));
        }
        break;
      case 'single-choice':
      case 'multi-select':
      case 'budgeted-pick':
        for (const choice of item.choices) {
          await fieldset.getByLabel(choice.text, { exact: false }).setChecked(picks.includes(choice.id));
        }
        break;
      case 'ordering': {
        const text = new Map(item.choices.map(({ id, text: label }) => [id, label]));
        for (const [target, id] of picks.entries()) {
          const order = await fieldset.locator('ol > li > span').allTextContents();
          for (let index = order.indexOf(text.get(id)!); index > target; index -= 1) {
            await fieldset.getByRole('button', { name: `Move up: ${text.get(id)}` }).click();
          }
        }
        await expect(fieldset.locator('ol > li > span')).toHaveText(picks.map((id) => text.get(id)!));
        break;
      }
    }
  }
}

export async function submitStructured(page: Page, problem: DiscoveredProblem & { data: StructuredData }, which: 'reference' | 'decoy') {
  await answerStructured(page, problem.data, problem.data[which]);
  // Exact and inside the workspace: answer options may contain the word, as in "Move up: Activate Submit ...".
  await page.getByRole('region', { name: 'Workspace' }).getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(resultPanel(page, which === 'reference' ? 'Pass' : 'Fail')).toBeVisible();
}
