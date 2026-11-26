import type { BugHuntItem } from '../../types';

const item: BugHuntItem = {
  id: 'bughunt-signup-form',
  kind: 'bughunt',
  app: 'signup-form',
  title: 'Investigate a signup form',
  difficulty: 'Medium',
  topics: ['Exploratory testing', 'Validation', 'Bug reports'],
  roles: ['manual', 'automation', 'sdet', 'lead'],
  summary: 'Test signup validation, inline errors, and the handling of a rejected account request.',
  prompt: 'Test this account form with made-up credentials. Find discrepancies against the signup spec, then file separate reports with the exact inputs and what the page displayed.',
  spec: `- A username has 3 to 20 characters, each an ASCII letter, digit, or underscore. Spaces, including at either end, are invalid. Show an error on the username and do not create an account.
- An email has a nonempty part before a single **@** and a domain that ends in a dot followed by at least two ASCII letters. Whitespace is invalid.
- A password is at least 10 characters and includes an ASCII letter and a digit. The terms checkbox must be checked before creating an account.
- Submitting an invalid form shows inline errors for the invalid fields and never shows account creation success. Editing a field clears only that field's error until the next submission.
- After validation, a simulated account service checks availability. The username \`reserved\` is already taken (case-insensitive). A rejection shows **Username is already taken.** on that field and does not show success. An available username shows **Account created.** with the accepted username.`,
  areas: ['Username', 'Email', 'Password', 'Terms', 'Account creation'],
  bugs: [
    { id: 'username-trailing', title: 'Username with trailing spaces is accepted', area: 'Username', severity: 'Minor', hint: 'Append a space to an otherwise valid username.' },
    { id: 'email-no-tld', title: 'Email without a top-level domain is accepted', area: 'Email', severity: 'Major', hint: 'Try an address like qa@company.' },
    { id: 'wrong-field-clear', title: 'Changing Password clears the Email error', area: 'Email', severity: 'Minor', hint: 'Produce an Email error, then edit only Password.' },
    { id: 'password-short', title: 'A password shorter than ten characters is accepted', area: 'Password', severity: 'Major', hint: 'Use eight or nine characters with both a letter and a digit.' },
    { id: 'terms-skipped', title: 'Account created without accepting the terms', area: 'Terms', severity: 'Major', hint: 'Submit valid fields without checking the box.' },
    { id: 'false-success', title: 'Signup shows success for a taken username', area: 'Account creation', severity: 'Major', hint: 'Use the known-taken username and make the other inputs valid.' },
  ],
  hints: [
    'Start with a valid baseline: `riley_qa`, `qa@example.test`, `samplepass7`, and the terms checked.',
    'Change one property from the baseline at a time. Pay attention to spaces and exact lengths.',
    'An inline error and a success notice communicate different outcomes. Check both after a service rejection.',
    'After causing an inline error, edit a different field and see whether the original error stays in place.',
  ],
  solutionNotes: `Submit otherwise-valid data with one change per case: add a trailing space to the username, use \`qa@company\`, use \`samplep7\`, or leave the terms unchecked. Each case should block account creation and name the invalid field.

For the error-clearing bug, submit \`broken-email\` with valid values elsewhere. The Email error should remain when you edit Password. Finally, use \`reserved\` with valid details. The app shows the correct rejection but also claims it created the account.`,
  interviewNotes: 'Separate validation from account creation in the report. An input may be accepted by the form and rejected by the service; contradictory success after a rejection is its own problem.',
};

export default item;
