import type { Question, Source } from '../types';

const src = (label: string, url: string): Source => ({ label, url });
const WAI = 'https://www.w3.org/WAI/';

const questions: Question[] = [
  {
    id: 'q-a11y-001',
    topic: 'Accessibility',
    roles: ['manual', 'automation', 'sdet', 'lead'],
    level: 'Junior',
    type: 'Concept',
    question: 'What is WCAG, and what do levels A, AA and AAA mean?',
    answer:
      'WCAG, the Web Content Accessibility Guidelines, is the W3C standard for making web content accessible. Its principles cover how people perceive, operate and understand content, and how reliably browsers and assistive technologies interpret it. Each criterion has a conformance level.\n\nLevel A is the minimum, AA includes all A criteria and adds requirements such as 4.5 to 1 contrast for normal text, and AAA adds further criteria. I confirm the required level with the team and turn each relevant criterion into a concrete check, such as whether a form field has an accessible name.',
    lookFor: [
      'Identifies WCAG as the W3C guideline',
      'Names the four principles',
      'Explains levels and that AA includes A',
      'Uses success criteria as the testable unit',
    ],
    mistakes: ['Believing a passing automated scan means WCAG AA conformance'],
    followUps: ['What changed in WCAG 2.2 that affects mobile and touch users?'],
    sources: [
      src('W3C: WCAG 2.2', 'https://www.w3.org/TR/WCAG22/'),
      src('W3C: Understanding contrast (minimum)', WAI + 'WCAG22/Understanding/contrast-minimum.html'),
    ],
  },
  {
    id: 'q-a11y-002',
    topic: 'Accessibility',
    roles: ['manual', 'automation', 'sdet'],
    level: 'Mid',
    type: 'Scenario',
    question: 'How would you test a modal dialog for keyboard accessibility?',
    answer:
      'I use only the keyboard. When the dialog opens, focus should move into it, usually to the first control or the heading. Tab and Shift+Tab should cycle through its controls without escaping to the page behind, and the focus indicator should always be visible. Escape should close it, as should the close button, and focus should return to the control that opened it.\n\nWith a screen reader I check that it is announced as a dialog with a meaningful name, and that content behind it is not reachable while it is open. The ARIA Authoring Practices dialog pattern describes this expected behavior.',
    lookFor: [
      'Checks focus moves in and returns on close',
      'Checks focus stays within the dialog',
      'Checks Escape and a visible focus indicator',
      'Checks the dialog role and accessible name',
    ],
    mistakes: ['Testing only with a mouse and an automated scanner'],
    followUps: ['How would you automate the focus-return check?'],
    sources: [
      src('W3C ARIA Authoring Practices: Dialog (modal) pattern', WAI + 'ARIA/apg/patterns/dialog-modal/'),
      src('W3C: Understanding keyboard', WAI + 'WCAG22/Understanding/keyboard.html'),
      src('W3C: Understanding focus visible', WAI + 'WCAG22/Understanding/focus-visible.html'),
    ],
  },
  {
    id: 'q-a11y-003',
    topic: 'Accessibility',
    roles: ['automation', 'sdet'],
    level: 'Mid',
    type: 'Concept',
    question: 'Your team runs axe in CI and it reports zero violations. Is the app accessible?',
    answer:
      'Not necessarily. Automated tools reliably catch things like missing alt attributes, missing form labels, some contrast failures and invalid ARIA. W3C notes that evaluation tools cannot determine accessibility on their own; they only help.\n\nMany criteria need human judgment: whether alt text actually describes the image, whether focus order makes sense, whether a custom widget works with a keyboard and a screen reader, and whether error messages are understandable. So I treat a clean scan as a floor and add manual keyboard and screen reader checks for key flows. Scans also only cover the states the test visited.',
    lookFor: [
      'Says no, with a reason',
      'Gives examples of what tools catch',
      'Gives examples needing human judgment',
      'Notes scans only cover visited states',
    ],
    mistakes: ['Adding ARIA attributes just to silence a scanner warning'],
    followUps: ['How would you scan a dropdown that only renders its options when opened?'],
    sources: [
      src('W3C: Selecting web accessibility evaluation tools', WAI + 'test-evaluate/tools/selecting/'),
      src('axe-core on GitHub', 'https://github.com/dequelabs/axe-core'),
    ],
  },
  {
    id: 'q-a11y-004',
    topic: 'Accessibility',
    roles: ['sdet', 'lead'],
    level: 'Senior',
    type: 'Scenario',
    question: 'Accessibility has been an afterthought on your team. How would you make it part of normal delivery?',
    answer:
      'I would start with a baseline audit of the most used flows against WCAG AA, so we know where we stand and can prioritize. Then I add accessibility to the definition of done: keyboard support, labels and contrast are checked before a story closes.\n\nIn automation, I add an axe scan to existing end-to-end tests, for example through Playwright, and fail on new serious violations while tracking existing ones. I encourage native HTML elements over custom widgets, since ARIA cannot fix everything. Finally I schedule regular manual screen reader passes and involve disabled users where possible.',
    lookFor: [
      'Starts from a baseline audit',
      'Adds accessibility to the definition of done',
      'Automates scans without blocking on old debt',
      'Prefers native HTML over custom ARIA widgets',
      'Keeps manual and real-user testing',
    ],
    mistakes: ['Relying on a one-time audit with no ongoing checks'],
    followUps: ['How would you handle 300 existing violations when you turn on the CI scan?'],
    sources: [
      src('Playwright: Accessibility testing', 'https://playwright.dev/docs/accessibility-testing'),
      src('W3C: Using ARIA (first rule of ARIA)', 'https://www.w3.org/TR/using-aria/'),
      src('W3C: WCAG 2.2', 'https://www.w3.org/TR/WCAG22/'),
    ],
  },
];

export default questions;
