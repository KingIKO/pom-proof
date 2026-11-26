import type { LocatorItem } from '../../types';

const item: LocatorItem = {
  id: 'confirm-remove-member',
  kind: 'locator',
  title: 'Confirm removal from the open dialog',
  difficulty: 'Hard',
  topics: ['Locators', 'Dialogs', 'Hidden ancestors'],
  roles: ['automation', 'sdet'],
  summary: 'Distinguish the live confirmation from the opener and a hidden dialog copy.',
  prompt: 'Select the Remove member confirmation button in the open dialog for Taylor Brooks. The roster has a button with the same name that opens the dialog.',
  allow: ['css', 'xpath', 'playwright'],
  target: 'section[role="dialog"][data-state="open"] button[type="submit"]',
  html: `
<main>
  <h1>Team roster</h1>
  <section data-view="roster">
    <h2>Taylor Brooks</h2>
    <button class="css-1q2w3e" type="button" aria-haspopup="dialog">Remove member</button>
  </section>
  <div class="css-3c1x0v">
    <section role="dialog" aria-modal="true" data-state="closed" aria-labelledby="dialog-title-48320" style="display:none">
      <h2 id="dialog-title-48320">Remove Maya Patel?</h2>
      <form>
        <div><button class="css-1q2w3e" type="submit">Remove member</button></div>
      </form>
    </section>
    <section role="dialog" aria-modal="true" data-state="open" aria-labelledby="dialog-title-48321">
      <h2 id="dialog-title-48321">Remove Taylor Brooks?</h2>
      <p>Taylor will lose access to the team workspace.</p>
      <form>
        <fieldset>
          <legend>Removal details</legend>
          <label for="input-48321">Reason (optional)</label>
          <div class="css-8a2m1v"><input id="input-48321" name="reason"></div>
        </fieldset>
        <div class="css-8a2m1v">
          <button type="button">Cancel</button>
          <button class="css-1q2w3e" type="submit">Remove member</button>
        </div>
      </form>
    </section>
  </div>
</main>`,
  examples: {
    css: 'section[role="dialog"][data-state="open"] button[type="submit"]',
    xpath: "//section[@role='dialog' and @data-state='open']//button[@type='submit']",
    playwright: "page.getByRole('dialog', { name: 'Remove Taylor Brooks?', exact: true }).getByRole('button', { name: 'Remove member', exact: true })",
  },
  hints: ['The dialog takes its accessible name from its heading. Scope the button lookup to that dialog.'],
  solutionNotes: 'The roster opener shares the confirmation’s name. The other dialog stays mounted under `display:none`, so raw selectors can still reach its submit button. Find Taylor’s named dialog by role or use the component’s open-state attribute before looking for the confirmation.',
  interviewNotes: 'A confirmation locator should say which person and which dialog it acts on. Scoping the interaction to a dialog also allows the test to distinguish “dialog opened” from “removal submitted.” See the Playwright locator and best-practices references.',
  sources: [
    { label: 'Playwright locators', url: 'https://playwright.dev/docs/locators' },
    { label: 'Playwright best practices', url: 'https://playwright.dev/docs/best-practices' },
  ],
};

export default item;
