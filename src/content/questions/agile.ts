import type { Question, Source } from '../types';

const ISTQB: Source = { label: 'ISTQB CTFL Syllabus v4.0.1', url: 'https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/' };
const SCRUM: Source = { label: 'The Scrum Guide (2020)', url: 'https://scrumguides.org/scrum-guide.html' };
const MANIFESTO: Source = { label: 'Manifesto for Agile Software Development', url: 'https://agilemanifesto.org/' };
const PRINCIPLES: Source = { label: 'Principles behind the Agile Manifesto', url: 'https://agilemanifesto.org/principles.html' };
const topic = 'Agile and process';

const questions: Question[] = [
  {
    id: 'q-agile-001',
    topic,
    roles: ['manual', 'automation', 'lead'],
    level: 'Mid',
    type: 'Concept',
    question: 'The Scrum Guide does not mention testers. Where does testing fit in a Scrum team?',
    answer:
      'Scrum defines three accountabilities: the Product Owner, the Scrum Master and the Developers. Developers means everyone who builds the increment, not only programmers, so a tester is one of the Developers. The guide also says a Scrum Team is cross-functional and has no sub-teams, so testing is not a separate phase or a separate group. In practice I test during the sprint alongside coding, help shape acceptance criteria in refinement, and contribute to the Definition of Done. Quality is a whole team responsibility, with testers bringing specialist skills.',
    lookFor: [
      'Names the three accountabilities accurately',
      'Explains that testers are part of the Developers',
      'Mentions cross-functional teams with no sub-teams',
      'Describes testing throughout the sprint rather than at the end',
    ],
    mistakes: ['Inventing a "QA role" in Scrum', 'Describing a mini waterfall with testing at sprint end'],
    followUps: ['How do you avoid becoming a bottleneck in the last two days of a sprint?'],
    sources: [SCRUM, ISTQB],
  },
  {
    id: 'q-agile-002',
    topic,
    roles: ['manual', 'lead'],
    level: 'Mid',
    type: 'Concept',
    question: 'What is the Definition of Done, and what happens to a story that does not meet it by the end of a sprint?',
    answer:
      'The Definition of Done is the shared description of the quality an increment must have before it counts as done. For testing it might include passing automated tests, no open critical defects, acceptance criteria verified and regression run. The Scrum Guide is clear that an item which does not meet the Definition of Done cannot be released or even presented at the Sprint Review; it goes back to the Product Backlog. So partly tested work does not count. As a tester, I help keep the Definition of Done honest and push to raise it over time.',
    lookFor: [
      'Defines the Definition of Done as a shared quality standard for the increment',
      'Gives concrete testing-related items it might include',
      'States that unfinished items return to the Product Backlog and are not presented at review',
      'Sees testers as contributors to improving it',
    ],
    mistakes: ['Confusing it with acceptance criteria for a single story', 'Saying the item can be demoed as nearly done'],
    followUps: ['How is the Definition of Done different from acceptance criteria?'],
    sources: [SCRUM],
  },
  {
    id: 'q-agile-003',
    topic,
    roles: ['manual', 'automation'],
    level: 'Mid',
    type: 'Scenario',
    question: 'A story reaches you on the last afternoon of the sprint with no time to test it properly. What do you do?',
    answer:
      'In the moment, I tell the team straight away, at the next opportunity rather than at the review, that the story cannot meet the Definition of Done. I would not rush it through with a quick look. If there is time, I test the riskiest part first and share what I found. The story then goes back to the backlog. The bigger fix comes in the retrospective: why did it arrive so late? Usually the stories are too big or testing waits until coding finishes. I would suggest smaller stories, pairing with developers, and testing pieces as they land.',
    lookFor: [
      'Makes the problem visible quickly',
      'Refuses to lower the Definition of Done',
      'Tests highest-risk parts first if possible',
      'Raises the root cause in the retrospective',
      'Proposes concrete flow changes such as smaller stories or pairing',
    ],
    mistakes: ['Working all night to absorb the problem silently', 'Signing off untested work'],
    followUps: ['What if this happens every sprint despite raising it?'],
    sources: [SCRUM],
  },
  {
    id: 'q-agile-004',
    topic,
    roles: ['lead', 'sdet'],
    level: 'Senior',
    type: 'Concept',
    question: 'What are the testing quadrants and how do you use them?',
    answer:
      'The testing quadrants group tests along two axes: whether they face the business or the technology, and whether they support the team during development or critique the product. Quadrant one is technology-facing support, like unit tests. Quadrant two is business-facing support, like functional and story tests. Quadrant three is business-facing critique, such as exploratory and usability testing. Quadrant four is technology-facing critique, such as performance and security testing. I use them as a planning check, to see whether our strategy has quietly neglected a whole area, often quadrant three or four.',
    lookFor: [
      'Explains both axes: business versus technology, supporting versus critiquing',
      'Places example test types correctly in each quadrant',
      'Uses the model to find gaps in a strategy',
      'Does not treat quadrant numbers as a required order',
    ],
    mistakes: ['Confusing the quadrants with the test pyramid', 'Placing performance testing in a business-facing quadrant'],
    followUps: ['Which quadrant do teams most often underinvest in, in your experience?'],
    sources: [ISTQB],
  },
  {
    id: 'q-agile-005',
    topic,
    roles: ['manual', 'automation'],
    level: 'Junior',
    type: 'Concept',
    question: 'What can a tester contribute during backlog refinement?',
    answer:
      'Refinement is where stories are broken down and detailed, so it is the cheapest point to prevent defects. I ask questions that expose ambiguity, like what happens with an empty cart or an expired session. I help write acceptance criteria that are testable, including negative cases and edge cases. I point out dependencies, test data needs and environments early. I also flag testing effort when the team sizes the story, because a small code change can still need a large regression check. Many teams do this in a small group of product, development and testing perspectives.',
    lookFor: [
      'Asks questions that reveal ambiguity and edge cases',
      'Helps write testable acceptance criteria',
      'Raises test data, environment and dependency needs',
      'Includes test effort in sizing',
      'Links refinement to defect prevention',
    ],
    mistakes: ['Staying silent until the story is in test', 'Saying refinement is only for the product owner'],
    followUps: ['Give an example question you would ask about a "reset password" story.'],
    sources: [SCRUM, ISTQB],
  },
  {
    id: 'q-agile-006',
    topic,
    roles: ['lead', 'manual'],
    level: 'Mid',
    type: 'Behavioral',
    question: 'Tell me about a time you used a retrospective to fix a recurring quality problem.',
    answer:
      'Our team kept finding the same kind of bug, where API changes broke the mobile app because nobody updated the contract. Instead of venting about it, I brought data to the retrospective: five escaped defects over three sprints with the same cause. We agreed on one experiment, adding a contract check to the pipeline and an item in the Definition of Done. I owned following up. Two sprints later we reviewed it, and that type of defect had stopped appearing. The lesson for me was to bring evidence and a small, testable change, not a complaint.',
    lookFor: [
      'Specific recurring problem with a clear cause',
      'Brings evidence to the retrospective',
      'Agrees one concrete, owned experiment',
      'Follows up and measures the result',
    ],
    mistakes: ['Describing a retrospective that produced no action', 'Blaming individuals'],
    followUps: ['What do you do when retrospective actions keep getting ignored?'],
    sources: [SCRUM],
  },
  {
    id: 'q-agile-007',
    topic,
    roles: ['sdet', 'automation'],
    level: 'Senior',
    type: 'Tooling',
    question: 'How would you organize automated tests across a CI/CD pipeline?',
    answer:
      'I arrange stages by speed and confidence so feedback arrives fast. On every commit or pull request: static analysis, unit tests and component tests, aiming for a few minutes. After merge: integration and contract tests against a deployed test environment, plus a small set of critical end-to-end journeys. Before production: smoke tests on the release build, and slower suites such as performance or wider regression on a schedule. After deployment, I would use smoke checks and monitoring in production. Any stage failure stops the pipeline, and flaky tests get fixed or quarantined so people keep trusting it.',
    lookFor: [
      'Orders stages by speed and feedback value',
      'Places fast checks on every commit or pull request',
      'Runs slower suites later or on a schedule',
      'Includes post-deployment checks and monitoring',
      'Keeps the pipeline trustworthy by handling flaky tests',
    ],
    mistakes: ['Running the full end-to-end suite on every commit', 'Letting failing stages be ignored'],
    followUps: ['How would you cut a forty-minute pull request pipeline down to ten?'],
    sources: [ISTQB],
  },
  {
    id: 'q-agile-008',
    topic,
    roles: ['manual', 'lead'],
    level: 'Junior',
    type: 'Concept',
    question: 'The Agile Manifesto values working software over comprehensive documentation. Does that mean agile teams skip test documentation?',
    answer:
      'No. The manifesto says that while there is value in the items on the right, it values the items on the left more. So documentation still has value; it just should not replace working software. For testing, that means lighter, useful documentation: acceptance criteria, exploratory session notes, a concise test strategy, and automated tests that act as living documentation. What I avoid is writing hundreds of detailed manual scripts nobody reads. One principle says working software is the primary measure of progress, so I document enough to support that, plus whatever regulations require.',
    lookFor: [
      'Explains the left over right wording accurately',
      'Says documentation still has value',
      'Names lightweight test documentation that agile teams keep',
      'Mentions regulatory or contractual needs',
    ],
    mistakes: ['Saying agile means no documentation', 'Misquoting the manifesto values'],
    followUps: ['What documentation would you insist on in a regulated domain like healthcare?'],
    sources: [MANIFESTO, PRINCIPLES],
  },
];

export default questions;
