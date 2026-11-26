import type { Question, Source } from '../types';

/*
  Behavioral questions answered in STAR form. Every model answer is an
  illustrative shape built on a made-up situation, so the Result step tells
  the candidate to report their own real outcome instead of copying one.
*/

const STAR: Source = {
  label: 'MIT CAPD: Using the STAR method for behavioral interviews',
  url: 'https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/',
};

const TOPIC = 'Behavioral STAR for QA';

const questions: Question[] = [
  {
    id: 'q-beh-001',
    topic: TOPIC,
    roles: ['manual', 'automation', 'sdet'],
    level: 'Mid',
    type: 'Behavioral',
    question: 'Tell me about a time you found a critical bug late in a release cycle.',
    answer: `*Illustrative shape. Tell a real story of your own.*

**Situation:** two days before a release, during exploratory testing on a payments change, I noticed a double-click could submit the same refund twice. **Task:** I owned sign-off for that feature, so I had to confirm it and get a decision quickly. **Action:** I reproduced it, captured the network calls showing two refund requests, and messaged the developer and product owner together instead of only filing a ticket. I gave them options: hold the release, or ship with refunds behind a flag. **Result:** say what actually happened in your case. The lesson I'd name is testing duplicate submissions on money flows much earlier.`,
    lookFor: [
      'Evidence gathered before raising the alarm',
      'Direct, fast communication to the people who decide',
      'Options offered alongside the problem',
      'An honest result and a change in future practice',
    ],
    mistakes: [
      'Inventing a dramatic outcome or a precise number they cannot back up',
      'Casting the developer as careless instead of describing the bug',
    ],
    followUps: ['Why was this not caught earlier, and what did you change?', 'Who made the final release call?'],
    sources: [STAR],
  },
  {
    id: 'q-beh-002',
    topic: TOPIC,
    roles: ['manual', 'automation', 'sdet', 'lead'],
    level: 'Junior',
    type: 'Behavioral',
    question: 'Tell me about a time you disagreed with a developer about whether something was a bug.',
    answer: `*Illustrative shape. Swap in your own example.*

**Situation:** I logged that a search filter ignored accented characters, and the developer closed it as working as designed. **Task:** settle whether it was a defect or a requirements gap without turning it into an argument. **Action:** I asked what behavior they expected, then checked the acceptance criteria, which said nothing either way. So I reframed it as a product question, attached a few realistic customer names that failed, and asked the product owner to decide. **Result:** give the real decision, whichever way it went. The point I'd make is that I moved the conversation from who was right to what users need, and accepted the call once it was made.`,
    lookFor: [
      'Curiosity about the other person\'s view',
      'Checking the requirement or spec before escalating',
      'Evidence framed around user impact',
      'Accepting the decision gracefully',
    ],
    mistakes: ['Telling a story where they "won" by escalating over someone', 'No mention of what the requirement actually said'],
    followUps: ['What would you have done if the product owner sided with the developer?'],
    sources: [STAR],
  },
  {
    id: 'q-beh-003',
    topic: TOPIC,
    roles: ['manual', 'automation', 'sdet', 'lead'],
    level: 'Mid',
    type: 'Behavioral',
    question: 'Tell me about a bug you missed that reached production.',
    answer: `*Illustrative shape. Use a real miss of your own.*

**Situation:** after a release I had signed off, a date field showed the wrong day for users in one time zone. **Task:** help contain it, then understand why my testing missed it. **Action:** I reproduced it quickly by changing my machine's time zone, which helped the developer confirm the fix. In the review I said plainly that every environment and test account I used ran in the same zone, so I never exercised that path. I added time zone variation to our test data and a date-handling item to our checklist. **Result:** describe the real impact honestly. The lesson is fixing the gap in the process, without blaming myself or anyone else.`,
    lookFor: [
      'Clear ownership without excessive self-blame',
      'A specific root cause in the testing approach',
      'A concrete preventive change',
      'Blameless framing toward teammates',
    ],
    mistakes: ['Claiming they have never missed a bug', 'Blaming the developer, the deadline, or the requirements'],
    followUps: ['How do you know the change you made actually helps?', 'How did you communicate it to stakeholders?'],
    sources: [STAR, { label: 'Google SRE book: Postmortem culture', url: 'https://sre.google/sre-book/postmortem-culture/' }],
  },
  {
    id: 'q-beh-004',
    topic: TOPIC,
    roles: ['manual', 'automation'],
    level: 'Junior',
    type: 'Behavioral',
    question: 'Tell me about a time you had to test something with unclear or missing requirements.',
    answer: `*Illustrative shape. Bring your own example.*

**Situation:** I got a ticket that just said "add export to CSV," mid-sprint, with no other detail. **Task:** test it properly without waiting days for a spec. **Action:** I wrote my assumptions down as questions: which columns, what encoding, how big an export can get, what happens with commas or line breaks inside a field. I took them to a ten-minute chat with the product owner and developer, and we turned the answers into acceptance criteria on the ticket. Where nobody knew, I tested both options and reported what the build did. **Result:** say what actually came of it. The habit I'd highlight is making assumptions visible early so the team decides together.`,
    lookFor: [
      'Turning ambiguity into explicit questions',
      'Involving product and development early',
      'Recording agreed criteria where the team can see them',
      'Continuing to test useful things while waiting',
    ],
    mistakes: ['Blocking all work until a full spec arrives', 'Silently guessing and testing only their own assumption'],
    followUps: ['What if the product owner was unavailable for a week?'],
    sources: [STAR],
  },
  {
    id: 'q-beh-005',
    topic: TOPIC,
    roles: ['manual', 'sdet', 'lead'],
    level: 'Senior',
    type: 'Behavioral',
    question: 'Tell me about a time you recommended not shipping a release.',
    answer: `*Illustrative shape. Tell a real story, including if the team shipped anyway.*

**Situation:** the day before a planned release, I found that upgrading from the previous version wiped saved settings for some users, while fresh installs were fine. **Task:** give a clear recommendation, knowing a launch date had been announced. **Action:** I separated facts from opinion. I showed the reproduction, estimated who was affected from usage data, and laid out the options with their risks: delay, ship with a migration fix, or ship and patch. I recommended a short delay and said what evidence would change my mind. **Result:** share the honest outcome. What matters is that I informed the decision instead of trying to own it alone, and the risk was written down either way.`,
    lookFor: [
      'Facts separated from opinion',
      'Impact estimated from data',
      'Options with tradeoffs, plus a clear recommendation',
      'Respect that the business owns the release decision',
    ],
    mistakes: ['Presenting QA as the gatekeeper who "blocked" the release', 'No data on who or how many users were affected'],
    followUps: ['What would have changed your recommendation?', 'How did you handle it if they overruled you?'],
    sources: [STAR, { label: 'Google SRE book: Embracing risk', url: 'https://sre.google/sre-book/embracing-risk/' }],
  },
  {
    id: 'q-beh-006',
    topic: TOPIC,
    roles: ['automation', 'sdet'],
    level: 'Mid',
    type: 'Behavioral',
    question: 'Tell me about a time you made an unreliable test suite trustworthy again.',
    answer: `*Illustrative shape. Use your own numbers only if you measured them.*

**Situation:** our UI suite failed often enough that people reran it until green, so real failures got ignored. **Task:** I volunteered to make its results mean something again. **Action:** I pulled several weeks of CI history and ranked tests by how often they flipped between pass and fail on the same commit. I moved the worst ones into a separate non-blocking job, so the main pipeline could be trusted, then fixed causes one at a time: fixed sleeps replaced with waits on real conditions, shared test accounts split per test. **Result:** describe what actually changed. Flaky tests are common even at large companies, so the story should focus on method.`,
    lookFor: [
      'Data used to find the worst offenders',
      'Quarantine as a temporary step, with fixes after',
      'Root causes named, such as timing or shared state',
      'Trust in the pipeline as the goal',
    ],
    mistakes: ['Adding automatic retries and calling it fixed', 'Deleting failing tests without checking what they covered'],
    followUps: ['How did you stop quarantined tests from staying there forever?', 'What was the most common root cause?'],
    sources: [
      STAR,
      { label: 'Google Testing Blog: Flaky tests at Google and how we mitigate them', url: 'https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html' },
      { label: 'Martin Fowler: Eradicating non-determinism in tests', url: 'https://martinfowler.com/articles/nonDeterminism.html' },
    ],
  },
  {
    id: 'q-beh-007',
    topic: TOPIC,
    roles: ['manual', 'automation'],
    level: 'Mid',
    type: 'Behavioral',
    question: 'Tell me about a time you had more to test than time allowed.',
    answer: `*Illustrative shape. Swap in your own release.*

**Situation:** a release had a large checkout refactor plus a dozen small changes, and I had about a day and a half to test. **Task:** decide what to cover and be clear about what I couldn't. **Action:** I listed every change and rated it by how likely it was to break and how bad a break would be. Checkout and anything touching payment got deep exploratory sessions first; low-risk text changes got a quick look. Then I sent the team a short note: what I tested, what I skipped, and why. **Result:** give the real outcome. The key point is that the risk we accepted was visible to everyone, so nobody was surprised later.`,
    lookFor: [
      'Prioritization by likelihood and impact',
      'Depth on high-risk areas, lighter checks elsewhere',
      'Written communication of what was not tested',
      'Shared ownership of the accepted risk',
    ],
    mistakes: ['Claiming they tested everything by working all night', 'Skipping areas without telling anyone'],
    followUps: ['How did you decide the impact rating?', 'What would you automate so this is easier next time?'],
    sources: [STAR, { label: 'ISTQB Glossary (risk-based testing)', url: 'https://glossary.istqb.org/' }],
  },
  {
    id: 'q-beh-008',
    topic: TOPIC,
    roles: ['automation', 'sdet'],
    level: 'Junior',
    type: 'Behavioral',
    question: 'Tell me about a time you had to learn a new tool or technology quickly.',
    answer: `*Illustrative shape. Use a tool you really learned.*

**Situation:** my team moved our API tests to a framework I had never used. **Task:** I needed to write useful tests within the sprint. **Action:** I read the official getting-started guide before any tutorials, then rebuilt a few of our existing tests in the new framework so I could compare results against something I already trusted. I kept notes on what surprised me, like how it handled async setup, and asked a teammate to review my first pull request early. **Result:** say honestly how far you got. What interviewers listen for is the method: official docs, a small real task, and feedback early.`,
    lookFor: [
      'A deliberate learning method',
      'Official documentation as a starting point',
      'Applying it to a real task quickly',
      'Seeking review early',
    ],
    mistakes: ['Saying they "picked it up in a day" with no detail on how', 'Learning only from tutorials and never checking the docs'],
    followUps: ['What was the hardest concept to get right?'],
    sources: [STAR],
  },
  {
    id: 'q-beh-009',
    topic: TOPIC,
    roles: ['manual', 'automation'],
    level: 'Junior',
    type: 'Behavioral',
    question: 'Tell me about a time you received critical feedback on your work.',
    answer: `*Illustrative shape. Use feedback you really got.*

**Situation:** a senior developer told me my bug reports were slow to act on because the steps were vague. **Task:** fix that, even though it stung a little. **Action:** I asked for two examples, and they were right: I had written "checkout fails sometimes" with no data, build, or environment. I started using a short template with steps, expected and actual results, environment, and a recording or log. I also asked the same developer to flag any report that still fell short. **Result:** describe the real change you saw. What I'd stress is that I asked for specifics and followed up instead of defending the old reports.`,
    lookFor: [
      'Asking for specific examples',
      'No defensiveness',
      'A concrete change in practice',
      'Closing the loop with the person who gave the feedback',
    ],
    mistakes: ['Picking feedback that is really a disguised strength', 'Describing the feedback as unfair'],
    followUps: ['What makes a bug report easy to act on?', 'Have you given critical feedback to someone else?'],
    sources: [STAR],
  },
  {
    id: 'q-beh-010',
    topic: TOPIC,
    roles: ['manual', 'sdet'],
    level: 'Mid',
    type: 'Behavioral',
    question: 'Tell me about a time you advocated for an issue others wanted to dismiss.',
    answer: `*Illustrative shape. Use your own example.*

**Situation:** testing a new signup form, I found it couldn't be completed with a keyboard alone, and errors were shown only as red text. The team called it polish for later. **Task:** get it judged as a defect instead of a preference. **Action:** I recorded a keyboard-only attempt, tried the form with a screen reader, and mapped each problem to the matching WCAG success criterion, such as keyboard access and use of color. I also sized the fix with the developer, since the focus order change was small. **Result:** say what really happened. The skill I'd point to is turning a values argument into evidence, a standard, and a cost.`,
    lookFor: [
      'Evidence a stakeholder can watch or read',
      'Reference to a recognized standard',
      'Fix effort estimated with the developer',
      'Persuasion without moralizing',
    ],
    mistakes: ['Arguing on principle alone with no evidence', 'Overstating what the standard requires'],
    followUps: ['What if the team still deferred it?', 'How would you catch this earlier next time?'],
    sources: [
      STAR,
      { label: 'W3C WAI: WCAG 2 overview', url: 'https://www.w3.org/WAI/standards-guidelines/wcag/' },
      { label: 'W3C: Understanding SC 2.1.1 Keyboard', url: 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html' },
      { label: 'W3C: Understanding SC 1.4.1 Use of Color', url: 'https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html' },
    ],
  },
  {
    id: 'q-beh-011',
    topic: TOPIC,
    roles: ['automation', 'sdet'],
    level: 'Mid',
    type: 'Behavioral',
    question: 'Tell me about a mistake you made in test automation and how you handled it.',
    answer: `*Illustrative shape. Tell a real mistake of your own.*

**Situation:** while refactoring test fixtures, I made a shared login helper swallow errors, so a group of tests passed without actually logging in. **Task:** once a teammate noticed a test passing against a broken build, I had to own it and restore trust in the suite. **Action:** I said in the team channel that it was my change, reverted it, and reran the affected tests against the broken build to prove they now failed. Then I made the fixture fail loudly and started watching each new test fail once on purpose before trusting it. **Result:** describe the real impact honestly. The point is fast ownership plus a guard so the same mistake can't hide again.`,
    lookFor: [
      'Quick, public ownership',
      'Proof that the fix works, by seeing tests fail',
      'A structural safeguard',
      'Understanding that a false pass is worse than a failure',
    ],
    mistakes: ['Choosing a trivial mistake with no real stakes', 'Fixing it quietly without telling the team'],
    followUps: ['How do you check that a new test can actually fail?'],
    sources: [STAR],
  },
  {
    id: 'q-beh-012',
    topic: TOPIC,
    roles: ['automation', 'sdet', 'lead'],
    level: 'Senior',
    type: 'Behavioral',
    question: 'Tell me about a time you helped a teammate grow their testing skills.',
    answer: `*Illustrative shape. Use someone you really helped.*

**Situation:** a manual tester on my team wanted to write automated checks but felt stuck. **Task:** help them without writing the tests for them. **Action:** we picked one regression case they ran every sprint and paired on automating it, with them driving and me asking questions. Afterward I reviewed their pull requests with comments that explained why, such as preferring role-based locators over long CSS paths, and we kept a half-hour weekly check-in. **Result:** share what actually happened, ideally what they now do on their own. A senior answer measures success by the other person's growth.`,
    lookFor: [
      'Letting the learner drive',
      'Reviews that explain reasoning',
      'Sustained support over time',
      'Success defined by the teammate\'s independence',
    ],
    mistakes: ['Describing mentoring as doing the work for them', 'Taking credit for the teammate\'s results'],
    followUps: ['How did you adjust when they got stuck?', 'How did you know they were ready to work alone?'],
    sources: [
      STAR,
      { label: 'DORA: Test automation capability', url: 'https://dora.dev/capabilities/test-automation/' },
      { label: 'Playwright docs: Locators', url: 'https://playwright.dev/docs/locators' },
    ],
  },
];

export default questions;
