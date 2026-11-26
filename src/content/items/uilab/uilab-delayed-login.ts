import type { UiLabItem } from '../../types';

function app(fault = '') {
  return `
    const form = document.querySelector('form');
    const email = document.querySelector('#email');
    const password = document.querySelector('#password');
    const button = form.querySelector('button');
    const alert = document.querySelector('[role=alert]');
    const status = document.querySelector('[role=status]');
    let pending = false;
    const refresh = () => {
      button.disabled = (${fault !== 'blank-enabled'} && (!email.value.trim() || !password.value))
        || (${fault !== 'pending-enabled'} && pending);
    };
    form.addEventListener('input', refresh);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (pending || !email.value.trim() || !password.value) return;
      const accepted = email.value.trim() === 'riley@example.test' && password.value === 'orchard-82';
      pending = true;
      alert.hidden = true;
      status.textContent = 'Signing in';
      refresh();
      setTimeout(() => {
        pending = false;
        refresh();
        status.textContent = '';
        if (accepted && ${fault !== 'valid-rejected'}) {
          form.hidden = true;
          status.textContent = 'Signed in as Riley';
        } else if (${fault !== 'no-error'}) {
          alert.textContent = 'Email or password is incorrect.';
          alert.hidden = false;
        }
      }, 360);
    });
    refresh();
  `;
}

const item: UiLabItem = {
  id: 'uilab-delayed-login',
  kind: 'uilab',
  title: 'Test a delayed sign-in',
  difficulty: 'Easy',
  topics: ['Playwright', 'Auto-waiting'],
  roles: ['automation', 'sdet'],
  summary: 'Write tests for a sign-in form with a delayed response.',
  prompt: `The sign-in form gets its response after a short delay. Write tests that pass on the working app and catch each broken version.

- **Sign in** is disabled while either field is blank and while a request is pending.
- A wrong password shows the alert **Email or password is incorrect.** The form remains available for another attempt.
- Sign in with \`riley@example.test\` and \`orchard-82\` to see **Signed in as Riley**.

Use a fresh \`test('name', async ({ page }) => { ... })\` for each independent case. You can try the form in the working app without affecting your tests.`,
  hints: [
    'Use `getByLabel` for Email and Password. Use `getByRole` with the accessible name for the button.',
    'The failure alert starts hidden. Await `expect(page.getByRole("alert")).toHaveText(...)` after submitting.',
    'Check the disabled state before filling any fields and again while the response is pending.',
    'Include a separate successful sign-in so a form that rejects everyone cannot pass.',
  ],
  solutionNotes: `Test the initial state, wrong credentials, and valid credentials independently. On the wrong-password path, assert the pending status and disabled button before waiting for the alert. Then verify that the button can be used again.

A locator assertion in Playwright retries until the text appears or the expectation times out. A one-time visibility read immediately after submission can race the response, and a fixed sleep can only hide the race on some runs.`,
  interviewNotes: 'Explain how you would keep the pending check reliable against a real backend. A controlled response that stays pending until the test releases it makes that state observable even when production usually responds quickly.',
  sources: [
    { label: 'Playwright: Auto-waiting', url: 'https://playwright.dev/docs/actionability' },
    { label: 'Playwright: Locators', url: 'https://playwright.dev/docs/locators' },
    { label: 'Playwright: Assertions', url: 'https://playwright.dev/docs/test-assertions' },
    { label: 'Playwright: Best practices', url: 'https://playwright.dev/docs/best-practices' },
  ],
  html: `<main>
    <h1>Sign in</h1>
    <form>
      <label for="email">Email</label>
      <input id="email" type="email" autocomplete="off">
      <label for="password">Password</label>
      <input id="password" type="password" autocomplete="off">
      <button class="primary" type="submit">Sign in</button>
    </form>
    <p role="status"></p>
    <p role="alert" hidden></p>
  </main>`,
  css: 'form[hidden] { display: none; }',
  script: app(),
  mutants: [
    { id: 'blank-enabled', label: 'Sign in is enabled with blank fields', script: app('blank-enabled') },
    { id: 'no-error', label: 'Wrong credentials never display an alert', script: app('no-error') },
    { id: 'pending-enabled', label: 'Sign in stays enabled during the request', script: app('pending-enabled') },
    { id: 'valid-rejected', label: 'Valid credentials are rejected', script: app('valid-rejected') },
  ],
  starter: `test('Sign in is disabled with no credentials', async ({ page }) => {
  const submit = page.getByRole('button', { name: 'Sign in' });
  await expect(submit).toBeDisabled();
});

// Add tests for wrong credentials and a successful sign-in.
`,
  referenceTests: `test('Sign in needs both fields', async ({ page }) => {
  const submit = page.getByRole('button', { name: 'Sign in' });
  await expect(submit).toBeDisabled();
  await page.getByLabel('Email').fill('riley@example.test');
  await expect(submit).toBeDisabled();
});

test('Wrong password shows an alert and lets you retry', async ({ page }) => {
  await page.getByLabel('Email').fill('riley@example.test');
  await page.getByLabel('Password').fill('wrong-password');
  const submit = page.getByRole('button', { name: 'Sign in' });
  await submit.click();
  await expect(page.getByRole('status')).toHaveText('Signing in');
  await expect(submit).toBeDisabled();
  const alert = page.getByRole('alert');
  await expect(alert).toHaveText('Email or password is incorrect.');
  await expect(alert).toBeVisible();
  await expect(submit).toBeEnabled();
});

test('Valid credentials sign Riley in', async ({ page }) => {
  await expect(page.getByLabel('Email')).toHaveValue('');
  await page.getByLabel('Email').fill('riley@example.test');
  await page.getByLabel('Password').fill('orchard-82');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('status')).toHaveText('Signed in as Riley');
  await expect(page.getByRole('alert')).toBeHidden();
});
`,
};

export default item;
