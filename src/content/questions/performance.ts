import type { Question, Source } from '../types';

const src = (label: string, url: string): Source => ({ label, url });
const K6 = 'https://grafana.com/docs/k6/latest/';

const questions: Question[] = [
  {
    id: 'q-perf-001',
    topic: 'Performance',
    roles: ['manual', 'automation', 'sdet'],
    level: 'Junior',
    type: 'Concept',
    question: 'What is the difference between a load test, a stress test, a spike test and a soak test?',
    answer:
      'A load test runs the system at the traffic we expect, often a normal or peak day, to check it meets its response time and error targets. A stress test pushes beyond that to find where it breaks and how it fails. A spike test jumps suddenly to a high level, which shows how autoscaling and queues react to a burst.\n\nA soak test holds a realistic load for hours. It finds problems that only build up over time, such as memory leaks, growing queues, or connection pools that slowly run out.',
    lookFor: [
      'Defines each test type by its purpose',
      'Ties load tests to expected traffic and targets',
      'Notes stress tests look at failure behavior',
      'Connects soak tests to leaks and slow degradation',
    ],
    mistakes: ['Using the terms interchangeably without saying what question each test answers'],
    followUps: ['Which of these would you run first for a brand new service, and why?'],
    sources: [src('Grafana k6: Load test types', K6 + 'testing-guides/test-types/')],
  },
  {
    id: 'q-perf-002',
    topic: 'Performance',
    roles: ['automation', 'sdet', 'lead'],
    level: 'Mid',
    type: 'Concept',
    question: 'Why do performance reports use percentiles like p95 and p99 instead of the average response time?',
    answer:
      'Response times are usually skewed: most requests are fast and a few are very slow. An average blends those together, so a handful of ten-second requests can hide behind a healthy-looking mean, or a few outliers can make it jump.\n\nPercentiles describe what users actually experience. A p95 of 400 milliseconds means 95 percent of requests finished within 400 milliseconds, and the p99 shows the tail that your unluckiest users hit. I set targets on percentiles, look at the error rate alongside them, and compare runs using the same percentile rather than mixing measures.',
    lookFor: [
      'Explains that response times are skewed',
      'Correctly defines a percentile',
      'Mentions the tail and user experience',
      'Pairs latency targets with error rate',
    ],
    mistakes: ['Averaging percentiles from several servers to get an overall percentile'],
    followUps: ['Why might p99 matter more for a page that makes 20 backend calls?'],
    sources: [
      src('Google SRE book: Service level objectives', 'https://sre.google/sre-book/service-level-objectives/'),
      src('Grafana k6: Thresholds', K6 + 'using-k6/thresholds/'),
    ],
  },
  {
    id: 'q-perf-003',
    topic: 'Performance',
    roles: ['automation', 'sdet', 'lead'],
    level: 'Mid',
    type: 'Scenario',
    question: 'A big sale starts in three weeks. How would you plan a load test for the checkout flow?',
    answer:
      'I start with numbers: expected peak orders per minute from past sales or marketing estimates, the mix of browsing to buying, and the response time and error targets the business needs. That becomes the workload model.\n\nI script the real journey with varied test data, such as different users, products and payment results, so caches do not make results look better than reality. The environment should resemble production closely, and third parties like payment providers are stubbed or coordinated with. I set pass criteria as thresholds, ramp up gradually, watch server metrics alongside client timings, and leave time to fix and retest.',
    lookFor: [
      'Builds a workload model from real data',
      'Uses realistic, varied test data',
      'Addresses environment similarity and third parties',
      'Defines pass and fail thresholds up front',
      'Monitors server side metrics during the run',
    ],
    mistakes: ['Hitting one URL with one user account at a constant rate and calling it a checkout test'],
    followUps: ['What would you do if the test environment is half the size of production?'],
    sources: [
      src('Grafana k6: Thresholds', K6 + 'using-k6/thresholds/'),
      src('Grafana k6: Load test types', K6 + 'testing-guides/test-types/'),
    ],
  },
  {
    id: 'q-perf-004',
    topic: 'Performance',
    roles: ['sdet', 'lead'],
    level: 'Senior',
    type: 'Concept',
    question: 'What is the difference between an open and a closed workload model, and why does it matter?',
    answer:
      'In a closed model, a fixed number of virtual users each send a request, wait for the reply, then send the next. If the system slows down, they automatically send fewer requests, so the test eases off exactly when the system struggles.\n\nIn an open model, new requests arrive at a set rate regardless of how fast earlier ones complete, which is closer to how independent users hit a public website. With an open model, a slowdown shows up as queues and rising latency instead of being absorbed. In k6 that means using an arrival-rate executor rather than a fixed number of looping users.',
    lookFor: [
      'Defines closed as fixed concurrency and open as fixed arrival rate',
      'Explains how a closed model under-reports slowdowns',
      'Matches the model to real traffic patterns',
      'Knows how to configure it in a tool',
    ],
    mistakes: ['Reporting requests per second from a closed test as the system\'s capacity without saying how it was produced'],
    followUps: ['When is a closed model the right choice?'],
    sources: [
      src('Grafana k6: Open and closed models', K6 + 'using-k6/scenarios/concepts/open-vs-closed/'),
      src('Grafana k6: Scenario executors', K6 + 'using-k6/scenarios/executors/'),
    ],
  },
  {
    id: 'q-perf-005',
    topic: 'Performance',
    roles: ['manual', 'automation', 'sdet'],
    level: 'Mid',
    type: 'Scenario',
    question: 'Product says the home page "feels slow" on phones. How would you test and report on front-end performance?',
    answer:
      'I would measure the Core Web Vitals. Largest Contentful Paint covers loading, Interaction to Next Paint covers responsiveness, and Cumulative Layout Shift covers visual stability. Google\'s guidance is good at or under 2.5 seconds, 200 milliseconds and 0.1, measured at the 75th percentile of real visits.\n\nIf the site collects field data, I start there since it reflects real devices. For investigation I use Lighthouse and the browser performance panel with mobile CPU and network throttling, then report the slowest element, large scripts or images, and layout shifts, with before and after numbers once fixes land.',
    lookFor: [
      'Names LCP, INP and CLS with what each measures',
      'Knows the published good thresholds',
      'Distinguishes field data from lab tools',
      'Tests with mobile throttling',
      'Reports specific causes and measured improvements',
    ],
    mistakes: ['Testing only on a fast laptop and wired connection'],
    followUps: ['Why can a Lighthouse score differ between two runs of the same page?'],
    sources: [
      src('web.dev: Web Vitals', 'https://web.dev/articles/vitals'),
      src('web.dev: Interaction to Next Paint', 'https://web.dev/articles/inp'),
    ],
  },
];

export default questions;
