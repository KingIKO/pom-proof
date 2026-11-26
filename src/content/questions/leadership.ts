import type { Question, Source } from '../types';

/*
  Leadership and strategy questions. Behavioral items use an illustrative
  situation, so the Result step tells the candidate to report their own
  real outcome.
*/

const TOPIC = 'Leadership and strategy';

const STAR: Source = {
  label: 'MIT CAPD: Using the STAR method for behavioral interviews',
  url: 'https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/',
};
const DORA_TEST_AUTOMATION: Source = {
  label: 'DORA: Test automation capability',
  url: 'https://dora.dev/capabilities/test-automation/',
};
const SRE_RISK: Source = { label: 'Google SRE book: Embracing risk', url: 'https://sre.google/sre-book/embracing-risk/' };

const questions: Question[] = [
  {
    id: 'q-lead-001',
    topic: TOPIC,
    roles: ['lead', 'sdet'],
    level: 'Senior',
    type: 'Concept',
    question: 'How do you decide what goes into a test strategy for a new product?',
    answer: `I start from risk and the delivery model rather than a template. What would hurt users or the business most if it broke, and how often do we ship? From there the strategy answers a handful of questions. Which layers test what, usually with most checks at the unit and service level and a thin set of end-to-end journeys. Who owns which tests, ideally developers and testers together. What environments and test data we need. What runs on every commit versus nightly. And how we'll know the strategy is working. I keep it short enough that people read it, and I revisit it when the architecture or release cadence changes.`,
    lookFor: [
      'Risk and release cadence as the starting point',
      'A layered approach weighted toward fast, low-level tests',
      'Shared ownership between developers and testers',
      'A plan to review and revise the strategy',
    ],
    mistakes: ['Listing test types with no link to product risk', 'Writing a long document nobody maintains'],
    followUps: ['How would the strategy differ for a mobile app versus an internal API?', 'How do you measure whether it works?'],
    sources: [
      { label: 'Martin Fowler: The practical test pyramid', url: 'https://martinfowler.com/articles/practical-test-pyramid.html' },
      DORA_TEST_AUTOMATION,
    ],
  },
  {
    id: 'q-lead-002',
    topic: TOPIC,
    roles: ['lead'],
    level: 'Senior',
    type: 'Concept',
    question: 'Which metrics would you use to report on quality, and which would you avoid?',
    answer: `I pick metrics that describe outcomes and help the team improve, and avoid ones that reward the wrong behavior. For delivery, DORA's measures are a solid base: change lead time, deployment frequency, change fail rate, and how long it takes to recover from a failed deployment. For quality I'd add escaped defects by severity, the flaky test rate, and how long the pipeline takes to give feedback. I'd avoid bug counts per tester or number of test cases as targets, because people learn to inflate them. And I present trends with context, never a single number on its own.`,
    lookFor: [
      'Outcome metrics over activity metrics',
      'Awareness of DORA delivery measures',
      'Recognition that targets distort counting metrics',
      'Trends and context over snapshots',
    ],
    mistakes: ['Ranking testers by bugs found', 'Treating test coverage percentage as proof of quality'],
    followUps: ['How would you explain a rising change fail rate to leadership?', 'What would you do if a metric started being gamed?'],
    sources: [{ label: 'DORA: Software delivery performance metrics', url: 'https://dora.dev/guides/dora-metrics/' }],
  },
  {
    id: 'q-lead-003',
    topic: TOPIC,
    roles: ['lead', 'sdet'],
    level: 'Senior',
    type: 'Scenario',
    question: 'Release is tomorrow, about 30% of the regression suite is failing, and the product manager wants to ship. What do you do?',
    answer: `First I find out what the red actually means, because a failure rate like that often comes from a few root causes. I triage with the team: group failures by error, separate environment and flaky failures from real product failures, and check which failures touch this release's changes. Then I give the product manager a short, plain summary: what we know is broken, what's still unknown, the user impact, and options such as shipping with a feature turned off, a short delay, or a staged rollout. The release call belongs to the business. My job is to make it an informed call, and afterward to fix the suite's health.`,
    lookFor: [
      'Fast triage before any recommendation',
      'Separating test problems from product problems',
      'Options with risk, in plain language',
      'Clarity on who owns the decision',
    ],
    mistakes: ['Blocking or approving the release without investigating', 'Rerunning the suite until it goes green'],
    followUps: ['What if triage cannot finish before the deadline?', 'How do you prevent the suite getting into this state again?'],
    sources: [{ label: 'Martin Fowler: Eradicating non-determinism in tests', url: 'https://martinfowler.com/articles/nonDeterminism.html' }, SRE_RISK],
  },
  {
    id: 'q-lead-004',
    topic: TOPIC,
    roles: ['lead', 'sdet'],
    level: 'Senior',
    type: 'Scenario',
    question: 'You join a team with no automation and a two-week manual regression cycle. What do you do in your first 90 days?',
    answer: `I'd spend the first few weeks learning before building anything: sit in on a regression cycle, read recent escaped bugs, and find out where the time really goes. Then I'd pick a narrow, high-value slice, usually the API or service layer around the riskiest flow, and automate it in the pipeline so developers get feedback on every change. I'd pair testers with developers on those first tests so the skills spread and no single person owns the suite. By day 90 I'd want a small suite people trust, less manual regression for that slice, and a plan for the next areas.`,
    lookFor: [
      'Discovery before tooling decisions',
      'A small, high-value starting slice',
      'Tests running in the pipeline early',
      'Spreading skills across the team',
    ],
    mistakes: ['Building a large framework before any test runs in CI', 'Automating the whole manual regression script as written'],
    followUps: ['How would you choose the first slice?', 'What would you tell leadership after 30 days?'],
    sources: [DORA_TEST_AUTOMATION, { label: 'DORA: Continuous integration capability', url: 'https://dora.dev/capabilities/continuous-integration/' }],
  },
  {
    id: 'q-lead-005',
    topic: TOPIC,
    roles: ['lead'],
    level: 'Senior',
    type: 'Behavioral',
    question: 'Tell me about a time you changed how a team thought about who owns quality.',
    answer: `*Illustrative shape. Use your own real story.*

**Situation:** on a previous team, testing started only after developers called a story done, so QA became a queue at the end of every sprint. **Task:** as the lead, I wanted testing to start during refinement. **Action:** I proposed adding test considerations to refinement and agreed with the team on a Definition of Done that included automated checks and a short exploratory session. I paired with developers on the first few stories so it felt like help instead of a new rule. **Result:** share the honest outcome, including any pushback. The lesson I'd highlight is that the change stuck because the team shaped it with me.`,
    lookFor: [
      'A concrete process change',
      'Using a shared team agreement such as the Definition of Done',
      'Leading by pairing and example',
      'Honest account of resistance',
    ],
    mistakes: ['Imposing a rule and calling it culture change', 'Claiming the whole team changed overnight'],
    followUps: ['Who resisted, and how did you handle it?', 'How did you know the change was working?'],
    sources: [STAR, { label: 'The Scrum Guide (Definition of Done)', url: 'https://scrumguides.org/scrum-guide.html' }],
  },
  {
    id: 'q-lead-006',
    topic: TOPIC,
    roles: ['lead', 'sdet'],
    level: 'Mid',
    type: 'Concept',
    question: 'What does a blameless postmortem for an escaped defect look like, and what is QA\'s role in it?',
    answer: `It looks at how the system let the bug through, assuming everyone acted in good faith with what they knew at the time. It covers the timeline, user impact, contributing causes across code, review, testing, and release, and specific action items with owners. QA's role is to bring evidence about why existing checks missed it. Was the case missing, at the wrong layer, using unrealistic data, or ignored because the suite is flaky? The output should be a concrete change, like a new test at the right layer or a better environment, and never just "test more carefully next time."`,
    lookFor: [
      'Focus on contributing causes over individuals',
      'Timeline, impact, and owned action items',
      'QA bringing evidence about test gaps',
      'Concrete, checkable follow-up actions',
    ],
    mistakes: ['Naming the person who wrote or tested the code as the cause', 'Action items too vague to verify'],
    followUps: ['How do you make sure action items actually get done?'],
    sources: [
      { label: 'Google SRE book: Postmortem culture', url: 'https://sre.google/sre-book/postmortem-culture/' },
      { label: 'Google SRE workbook: Postmortem culture', url: 'https://sre.google/workbook/postmortem-culture/' },
    ],
  },
  {
    id: 'q-lead-007',
    topic: TOPIC,
    roles: ['lead'],
    level: 'Mid',
    type: 'Scenario',
    question: 'A tester on your team files bug reports that developers keep ignoring because they are hard to act on. How do you handle it?',
    answer: `I'd start with a private conversation. I'd bring two or three specific reports, ask how they approach writing them, and listen, because the cause might be time pressure or unclear expectations rather than skill. Then I'd make expectations concrete: a shared template with steps, expected and actual results, environment, and evidence, plus a strong example from our own tracker. I'd review their next few reports with them and point out what improved. And since developers have been ignoring reports, I'd talk with them too, so the fix includes a faster feedback loop on both sides.`,
    lookFor: [
      'Private, specific feedback',
      'Seeking the cause before prescribing a fix',
      'Concrete expectations and examples',
      'Addressing the developer side of the loop',
    ],
    mistakes: ['Correcting the tester publicly', 'Treating it purely as a performance problem'],
    followUps: ['What if nothing improves after a month?', 'What makes a bug report actionable?'],
    sources: [{ label: 'ISTQB Glossary (defect report)', url: 'https://glossary.istqb.org/' }],
  },
  {
    id: 'q-lead-008',
    topic: TOPIC,
    roles: ['lead', 'sdet'],
    level: 'Senior',
    type: 'Behavioral',
    question: 'Tell me about a time you got buy-in for quality work that was not on the roadmap.',
    answer: `*Illustrative shape. Use your own real story and measurements.*

**Situation:** our pipeline took close to an hour, mostly end-to-end tests, and developers batched changes to avoid waiting. **Task:** win roadmap time to fix it against feature work. **Action:** I framed it in product terms. I measured how long changes waited for feedback, showed how often failures were flaky, and described it as technical debt with interest the team paid every day. I proposed a small, time-boxed first step, moving some checks to the API layer and running suites in parallel, with a clear measure to judge it by. **Result:** tell the true outcome and what you measured. The skill is making a hidden cost visible and asking for a small bet.`,
    lookFor: [
      'Cost framed in terms leadership cares about',
      'Measurement before the ask',
      'A small, time-boxed proposal',
      'A clear success measure',
    ],
    mistakes: ['Asking for a big rewrite with no evidence', 'Framing it as QA wanting nicer tools'],
    followUps: ['What would you have done if the request was rejected?'],
    sources: [
      STAR,
      { label: 'Martin Fowler: Technical debt', url: 'https://martinfowler.com/bliki/TechnicalDebt.html' },
      { label: 'DORA: Continuous integration capability', url: 'https://dora.dev/capabilities/continuous-integration/' },
    ],
  },
];

export default questions;
