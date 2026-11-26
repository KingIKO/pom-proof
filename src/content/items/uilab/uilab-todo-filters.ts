import type { UiLabItem } from '../../types';

function app(fault = '') {
  return `
    const todos = [];
    const form = document.querySelector('form');
    const input = document.querySelector('#new-task');
    const list = document.querySelector('ul');
    const filters = document.querySelectorAll('[aria-pressed]');
    let filter = 'All';
    function render() {
      list.replaceChildren();
      for (const task of todos) {
        if (filter === 'Active' && task.complete && ${fault !== 'active-shows-done'}) continue;
        if (filter === 'Completed' && !task.complete) continue;
        const row = document.createElement('li');
        const label = document.createElement('label');
        const check = document.createElement('input');
        check.type = 'checkbox';
        check.checked = task.complete;
        check.addEventListener('change', () => {
          task.complete = ${fault === 'completion-not-saved' ? 'false' : 'check.checked'};
          render();
        });
        label.append(check, document.createTextNode(task.text));
        row.append(label);
        list.append(row);
      }
      const left = todos.filter((task) => !task.complete).length;
      const count = ${fault === 'filtered-counter' ? "filter === 'Completed' ? list.children.length : left" : 'left'};
      document.querySelector('output').textContent = count === 1 ? '1 task left' : count + ' tasks left';
      for (const button of filters) button.setAttribute('aria-pressed', String(button.textContent === filter));
    }
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      todos.push({ text, complete: false });
      ${fault === 'input-not-cleared' ? '' : "input.value = '';"}
      render();
    });
    for (const button of filters) button.addEventListener('click', () => {
      filter = button.textContent;
      render();
    });
    render();
  `;
}

const item: UiLabItem = {
  id: 'uilab-todo-filters',
  kind: 'uilab',
  title: 'Test a filtered task list',
  difficulty: 'Medium',
  topics: ['Playwright', 'Locators', 'Assertions'],
  roles: ['automation', 'sdet'],
  summary: 'Find a specific task and check which rows each filter displays.',
  prompt: `Write a test suite for this task list.

- Adding nonblank text creates one unchecked task and clears **New task**. A blank entry adds nothing.
- **All** shows every task, **Active** shows only unchecked tasks, and **Completed** shows only checked tasks. A task keeps its checked state when you switch filters.
- The **tasks left** count always includes every unchecked task, regardless of the filter.

Use at least two different tasks. Scope the checkbox action to the right row so it still works if the task order changes.`,
  hints: [
    'Start with `page.getByRole("listitem")`. Narrow it with `.filter({ hasText: "Pack lunch" })` before looking for the checkbox.',
    'Use `toHaveCount` on the row collection, then check its content so a filter showing the wrong row cannot pass.',
    'Use one checked and two unchecked tasks so the completed row count cannot be mistaken for the remaining task count.',
    'Use `toHaveValue("")` to check that a successful add clears the input.',
  ],
  solutionNotes: 'Add three distinct tasks and check one by filtering its row by text. Assert both the number and the identity of rows after each filter change. The remaining count stays at two even when Completed displays just one row. Test the input reset separately so it is clear whether a failure is in entry or in filtering.',
  interviewNotes: 'If two tasks can have the same title, a text filter alone may be ambiguous. Ask what else the user sees to distinguish these rows or whether an explicit test ID is part of the component contract.',
  sources: [
    { label: 'Playwright: Locators', url: 'https://playwright.dev/docs/locators#filtering-locators' },
    { label: 'Playwright: Assertions', url: 'https://playwright.dev/docs/test-assertions' },
    { label: 'Playwright: Best practices', url: 'https://playwright.dev/docs/best-practices' },
  ],
  html: `<main>
    <h1>Task list</h1>
    <form>
      <label for="new-task">New task</label>
      <div class="task-entry"><input id="new-task" autocomplete="off"><button type="submit" class="primary">Add task</button></div>
    </form>
    <div class="task-filters" role="group" aria-label="Task filters">
      <button type="button" aria-pressed="true">All</button>
      <button type="button" aria-pressed="false">Active</button>
      <button type="button" aria-pressed="false">Completed</button>
    </div>
    <ul aria-label="Tasks"></ul>
    <output></output>
  </main>`,
  css: `
    .task-entry { display: grid; grid-template-columns: 1fr auto; gap: 8px; }
    .task-filters { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
    [aria-pressed="true"] { background: #edf3fe; border-color: #4176e6; }
    ul { padding: 0; list-style: none; margin: 8px 0; }
    li { padding: 5px 0; border-bottom: 1px solid #e1e5ee; }
    li label { display: flex; align-items: center; gap: 6px; overflow-wrap: anywhere; }
    output { color: #545962; }
  `,
  script: app(),
  mutants: [
    { id: 'input-not-cleared', label: 'Adding a task leaves its text in the input', script: app('input-not-cleared') },
    { id: 'completion-not-saved', label: 'Checking a task does not save its completed state', script: app('completion-not-saved') },
    { id: 'active-shows-done', label: 'Active includes completed tasks', script: app('active-shows-done') },
    { id: 'filtered-counter', label: 'The remaining count changes on the Completed filter', script: app('filtered-counter') },
  ],
  starter: `test('The list starts empty', async ({ page }) => {
  await expect(page.getByRole('listitem')).toHaveCount(0);
});

// Add tasks and check the results of switching filters.
`,
  referenceTests: `test('A nonblank entry adds one task and clears the input', async ({ page }) => {
  const input = page.getByLabel('New task');
  const rows = page.getByRole('listitem');
  await input.fill('   ');
  await input.press('Enter');
  await expect(rows).toHaveCount(0);
  await input.fill('Pack lunch');
  await input.press('Enter');
  await expect(rows).toHaveCount(1);
  await expect(rows.filter({ hasText: 'Pack lunch' }).getByRole('checkbox')).not.toBeChecked();
  await expect(input).toHaveValue('');
});

test('Filters preserve task completion and the remaining count', async ({ page }) => {
  const input = page.getByLabel('New task');
  const rows = page.getByRole('listitem');
  await expect(rows).toHaveCount(0);
  for (const task of ['Pack lunch', 'Water plants', 'Return books']) {
    await input.fill(task);
    await page.getByRole('button', { name: 'Add task' }).click();
  }
  await expect(rows).toHaveCount(3);
  const packed = rows.filter({ hasText: 'Pack lunch' });
  await packed.getByRole('checkbox').check();
  await expect(packed.getByRole('checkbox')).toBeChecked();
  await page.getByRole('button', { name: 'Active', exact: true }).click();
  await expect(rows).toHaveCount(2);
  await expect(packed).toHaveCount(0);
  await page.getByRole('button', { name: 'Completed', exact: true }).click();
  await expect(rows).toHaveCount(1);
  await expect(packed.getByRole('checkbox')).toBeChecked();
  await expect(page.getByRole('status')).toHaveText('2 tasks left');
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await expect(rows).toHaveCount(3);
  await expect(packed.getByRole('checkbox')).toBeChecked();
});
`,
};

export default item;
