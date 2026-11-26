import { expect, test, type Locator, type Page } from '@playwright/test';
import { fullMarksText, jsSolution, locatorSource, tableRows, uiProblemPerKind, type ProblemOf } from '../support/answers';
import type { DiscoveredProblem } from '../support/problems';
import { openWorkspace, resultPanel } from '../support/workspace';

// Keyboard only: focus moves with Tab and Shift+Tab, controls work with Space, Enter and the arrow
// keys, and no test here clicks, calls focus(), fill(), check() or selectOption(). Code and SQL go
// into the editor with insertText, one input event like a paste: typed brackets and new lines would
// be auto-closed and auto-indented by the editor, and Enter would accept an open completion.
type Structured = ProblemOf<'scenario'> | ProblemOf<'diagnosis'> | ProblemOf<'bug-report'>;
const picks = uiProblemPerKind();
const workspace = (page: Page) => page.getByRole('region', { name: 'Workspace' });
const submitButton = (page: Page) => workspace(page).getByRole('button', { name: 'Submit', exact: true });

/** Presses Tab or Shift+Tab, whichever way the target lies in document order, until it or a child has focus. */
async function tabTo(page: Page, target: Locator, what: string) {
  await expect(target, what).toBeVisible();
  const limit = await page.evaluate(() =>
    document.querySelectorAll('a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]').length);
  for (let step = 0; step <= limit; step += 1) {
    const where = await target.evaluate((element) => {
      const active = document.activeElement;
      if (active && active !== document.body && (element === active || element.contains(active))) return 'here';
      if (!active || active === document.body) return 'after';
      return active.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING ? 'after' : 'before';
    });
    if (where === 'here') return;
    await page.keyboard.press(where === 'after' ? 'Tab' : 'Shift+Tab');
  }
  throw new Error(`Tab and Shift+Tab never reached ${what}`);
}

async function answerStructured(page: Page, { data }: Structured) {
  for (const item of data.items) {
    const picked = [data.reference[item.id] ?? []].flat();
    const fieldset = page.getByRole('group', { name: item.prompt });
    switch (item.type) {
      case 'line-marking': {
        const buttons = fieldset.getByRole('list', { name: 'Numbered lines' }).getByRole('button');
        await expect(buttons).toHaveCount(item.lines.length);
        for (const [index, line] of item.lines.entries()) {
          const button = buttons.nth(index);
          const wanted = picked.includes(line.id);
          if ((await button.getAttribute('aria-pressed') === 'true') !== wanted) {
            await tabTo(page, button, `line ${index + 1} of "${item.prompt}"`);
            await page.keyboard.press('Space');
          }
          await expect(button).toHaveAttribute('aria-pressed', String(wanted));
        }
        break;
      }
      case 'single-choice': {
        const radios = fieldset.getByRole('radio');
        await expect(radios).toHaveCount(item.choices.length);
        const wanted = item.choices.findIndex(({ id }) => id === picked[0]);
        await tabTo(page, fieldset, `the choices of "${item.prompt}"`);
        const focused = await radios.evaluateAll((elements) => elements.findIndex((element) => element === document.activeElement));
        expect(focused, 'Tab landed on a radio of the group').toBeGreaterThanOrEqual(0);
        if (focused === wanted) await page.keyboard.press('Space');
        for (let step = focused; step < wanted; step += 1) await page.keyboard.press('ArrowDown');
        for (let step = focused; step > wanted; step -= 1) await page.keyboard.press('ArrowUp');
        await expect(radios.nth(wanted)).toBeChecked();
        break;
      }
      case 'multi-select':
      case 'budgeted-pick': {
        const boxes = fieldset.getByRole('checkbox');
        await expect(boxes).toHaveCount(item.choices.length);
        for (const [index, choice] of item.choices.entries()) {
          const wanted = picked.includes(choice.id);
          if (await boxes.nth(index).isChecked() !== wanted) {
            await tabTo(page, boxes.nth(index), `"${choice.text}"`);
            await page.keyboard.press('Space');
          }
          await expect(boxes.nth(index)).toBeChecked({ checked: wanted });
        }
        break;
      }
      case 'ordering': {
        const text = new Map(item.choices.map(({ id, text: label }) => [id, label]));
        const order = fieldset.locator('ol > li > span');
        for (const [position, id] of picked.entries()) {
          const moves = (await order.allTextContents()).indexOf(text.get(id)!) - position;
          if (moves <= 0) continue;
          const moveUp = fieldset.getByRole('button', { name: `Move up: ${text.get(id)}`, exact: true });
          await tabTo(page, moveUp, `Move up: ${text.get(id)}`);
          for (let move = 0; move < moves; move += 1) {
            // The list keeps focus on the moved item's button, so Enter can be pressed again.
            await expect(moveUp).toBeFocused();
            await page.keyboard.press('Enter');
          }
        }
        await expect(order).toHaveText(picked.map((id) => text.get(id)!));
        break;
      }
    }
  }
}

/** Picks an option of a closed select with the arrow keys, which change it without opening the list. */
async function chooseOption(page: Page, select: Locator, value: string) {
  const [current, wanted] = await select.evaluate((element, target) => {
    const options = Array.from((element as HTMLSelectElement).options, ({ value: option }) => option);
    return [(element as HTMLSelectElement).selectedIndex, options.indexOf(target)];
  }, value);
  expect(wanted, `option ${value}`).toBeGreaterThanOrEqual(0);
  for (let step = current; step < wanted; step += 1) await page.keyboard.press('ArrowDown');
  for (let step = current; step > wanted; step -= 1) await page.keyboard.press('ArrowUp');
  await expect(select).toHaveValue(value);
}

async function fillTable(page: Page, { data }: ProblemOf<'test-design'>) {
  const params = data.params!;
  const rows = tableRows(data)!;
  const table = workspace(page).getByRole('table', { name: 'Test rows' });
  for (const [index, row] of rows.entries()) {
    if (index > 0) {
      await tabTo(page, workspace(page).getByRole('button', { name: 'Add row', exact: true }), 'Add row');
      await page.keyboard.press('Enter');
      await expect(table.locator('tbody tr')).toHaveCount(index + 1);
    }
    for (const [column, param] of params.entries()) {
      const label = `${param.label}, row ${index + 1}`;
      const control = table.getByLabel(label, { exact: true });
      await tabTo(page, control, label);
      const value = String(row.args[column]);
      if (param.type === 'boolean' || param.type === 'enum') await chooseOption(page, control, value);
      else await page.keyboard.type(value);
      await expect(control).toHaveValue(value);
    }
    const expected = table.getByLabel(`Expected result, row ${index + 1}`, { exact: true });
    await tabTo(page, expected, `Expected result, row ${index + 1}`);
    await page.keyboard.type(JSON.stringify(row.expected));
    await expect(expected).toHaveValue(JSON.stringify(row.expected));
  }
}

async function enterInEditor(page: Page, name: string, source: string) {
  const editor = workspace(page).getByRole('textbox', { name });
  await tabTo(page, editor, name);
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.insertText(source);
  await expect(editor).toContainText(source.split('\n')[0]);
  await page.keyboard.press('Escape');
}

async function answer(page: Page, problem: DiscoveredProblem) {
  switch (problem.data.kind) {
    case 'scenario':
    case 'diagnosis':
    case 'bug-report':
      await answerStructured(page, problem as Structured);
      break;
    case 'test-design':
      await fillTable(page, problem as ProblemOf<'test-design'>);
      break;
    case 'locator': {
      const input = workspace(page).getByRole('textbox', { name: 'Locator expression' });
      const source = locatorSource(problem.data.reference);
      await tabTo(page, input, 'Locator expression');
      await page.keyboard.type(source);
      await expect(input).toHaveValue(source);
      // Enter in the field submits its form.
      await page.keyboard.press('Enter');
      return;
    }
    case 'sql':
      await enterInEditor(page, 'SQL query', problem.data.reference.query);
      break;
    case 'code':
      await expect(workspace(page).getByRole('combobox', { name: /^Language\b/ })).toHaveValue('js');
      await enterInEditor(page, 'Solution code', jsSolution(problem.data)!);
      break;
  }
  await tabTo(page, submitButton(page), 'Submit');
  await page.keyboard.press('Enter');
}

for (const problem of picks) {
  test(`keyboard only: ${problem.kind} ${problem.id} scores full marks`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await openWorkspace(page, problem);
    await answer(page, problem);
    await expect(resultPanel(page, 'Pass')).toHaveText(fullMarksText(problem));
    expect(errors, 'page errors').toEqual([]);
  });
}
