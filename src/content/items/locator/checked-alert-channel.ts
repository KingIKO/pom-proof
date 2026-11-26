import type { LocatorItem } from '../../types';

const item: LocatorItem = {
  id: 'checked-alert-channel',
  kind: 'locator',
  title: 'Find the checked Email channel',
  difficulty: 'Medium',
  topics: ['Locators', 'Checkbox state'],
  roles: ['automation', 'sdet'],
  summary: 'Distinguish checkboxes by their name and current state.',
  prompt: 'In the alert-channel migration preview, select the Email checkbox that is currently checked. Leave the unchecked Email checkbox and the checked SMS checkbox alone. Use Playwright only.',
  allow: ['playwright'],
  target: 'input[type="checkbox"][value="email"]:checked',
  html: `
<main>
  <h1>Alert-channel migration preview</h1>
  <form>
    <div class="css-1q2w3e">
      <fieldset>
        <legend>Existing preferences</legend>
        <div><label><input type="checkbox" name="existing" value="email"><span>Email</span></label></div>
        <div><label><input type="checkbox" name="existing" value="sms" checked><span>SMS</span></label></div>
      </fieldset>
      <fieldset>
        <legend>Proposed preferences</legend>
        <div><label><input type="checkbox" name="proposed" value="email" checked><span>Email</span></label></div>
        <div><label><input type="checkbox" name="proposed" value="sms"><span>SMS</span></label></div>
      </fieldset>
    </div>
  </form>
</main>`,
  examples: { playwright: "page.getByRole('checkbox', { name: 'Email', exact: true, checked: true })" },
  hints: ['A role locator can filter matches by checked state.'],
  solutionNotes: 'A name-only locator returns both Email controls; `checked: true` without a name returns the checked SMS control too. Combining the name and state matches the checked Email checkbox.',
  interviewNotes: 'Use a state filter when state identifies the target. If the goal is instead to verify an individual checkbox, identify it independently and assert that it is checked. See the Playwright locator and best-practices references.',
  sources: [
    { label: 'Playwright locators', url: 'https://playwright.dev/docs/locators' },
    { label: 'Playwright best practices', url: 'https://playwright.dev/docs/best-practices' },
  ],
};

export default item;
