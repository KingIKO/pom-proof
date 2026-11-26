import type { Question, Source } from '../types';

const src = (label: string, url: string): Source => ({ label, url });
const RFC9110 = src('RFC 9110: HTTP Semantics', 'https://www.rfc-editor.org/rfc/rfc9110');
const MDN_STATUS = src('MDN: HTTP response status codes', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status');

const questions: Question[] = [
  {
    id: 'q-api-001',
    topic: 'API testing',
    roles: ['manual', 'automation', 'sdet'],
    level: 'Junior',
    type: 'Concept',
    question: 'What is the difference between a safe and an idempotent HTTP method, and why does it matter when you test an API?',
    answer:
      'A safe method is one the client uses only to read, so GET, HEAD and OPTIONS should not change server state. An idempotent method gives the same end state whether you send it once or several times. PUT and DELETE are idempotent, POST is not, and PATCH is not guaranteed to be.\n\nThis matters because clients, proxies and test frameworks retry requests. I check that repeating a PUT leaves one record, that a second DELETE does not break anything, and that a retried POST either creates a duplicate on purpose or is protected by something like an idempotency key.',
    lookFor: [
      'Names GET and HEAD as safe and PUT and DELETE as idempotent',
      'Explains idempotency as same end state, not same response',
      'Connects the idea to retries and duplicate side effects',
      'Mentions a concrete check, such as sending a request twice',
    ],
    mistakes: [
      'Saying idempotent means the response body must be identical every time',
      'Assuming PATCH is idempotent by definition',
    ],
    followUps: [
      'A second DELETE returns 404. Does that break idempotency?',
      'How would you test an idempotency key on a payment endpoint?',
    ],
    sources: [src('RFC 9110, section 9.2: Common method properties', 'https://www.rfc-editor.org/rfc/rfc9110#section-9.2')],
  },
  {
    id: 'q-api-002',
    topic: 'API testing',
    roles: ['manual', 'automation', 'sdet'],
    level: 'Junior',
    type: 'Concept',
    question: 'When should an API return 401 and when 403? Where does 404 fit in?',
    answer:
      '401 Unauthorized means the request lacks valid authentication, for example no token or an expired one, and the server should send a WWW-Authenticate header saying how to authenticate. 403 Forbidden means the server knows who you are but refuses the action, such as a regular user calling an admin endpoint.\n\nThe spec also allows a 404 instead of a 403 when the server does not want to reveal that a resource exists. So in tests I check the status matches the team\'s documented choice, and that the response for another user\'s record does not leak whether it exists.',
    lookFor: [
      'Separates authentication (401) from authorization (403)',
      'Knows 401 should come with a WWW-Authenticate header',
      'Knows 404 can be used to hide a resource from unauthorized users',
      'Tests against the documented contract rather than personal preference',
    ],
    mistakes: [
      'Treating 401 and 403 as interchangeable',
      'Returning or accepting 500 when a token is malformed',
    ],
    followUps: ['What would you expect for a valid token that has the wrong scope?'],
    sources: [
      src('RFC 9110, section 15.5.2: 401 Unauthorized', 'https://www.rfc-editor.org/rfc/rfc9110#section-15.5.2'),
      src('RFC 9110, section 15.5.4: 403 Forbidden', 'https://www.rfc-editor.org/rfc/rfc9110#section-15.5.4'),
      MDN_STATUS,
    ],
  },
  {
    id: 'q-api-003',
    topic: 'API testing',
    roles: ['manual', 'automation', 'sdet'],
    level: 'Mid',
    type: 'Scenario',
    question: 'How would you test a POST /orders endpoint that creates an order?',
    answer:
      'I start with the contract: required fields, types, limits and the expected response. For the happy path I expect 201 Created, a Location header or an id for the new order, and a body that matches the schema. Then I read the order back with GET to prove it was stored, and check side effects like stock reduced or an event published.\n\nNegative cases cover missing and invalid fields, boundary values, unknown products, and a missing or expired token. I send the same request twice to see how duplicates are handled, and I confirm error responses use one consistent format without stack traces.',
    lookFor: [
      'Expects 201 and a way to locate the new resource',
      'Verifies persistence with a follow-up read, not only the response',
      'Covers validation, auth and boundary cases',
      'Considers duplicates and side effects on other systems',
      'Checks that errors are consistent and do not expose internals',
    ],
    mistakes: [
      'Asserting only the status code',
      'Leaving created orders behind so later tests depend on them',
    ],
    followUps: [
      'How would you clean up test data in a shared environment?',
      'What changes if order creation is asynchronous and returns 202?',
    ],
    sources: [
      src('RFC 9110, section 15.3.2: 201 Created', 'https://www.rfc-editor.org/rfc/rfc9110#section-15.3.2'),
      src('RFC 9457: Problem Details for HTTP APIs', 'https://www.rfc-editor.org/rfc/rfc9457'),
    ],
  },
  {
    id: 'q-api-004',
    topic: 'API testing',
    roles: ['automation', 'sdet', 'lead'],
    level: 'Mid',
    type: 'Concept',
    question: 'What is consumer-driven contract testing, and how is it different from an end-to-end API test?',
    answer:
      'In consumer-driven contract testing, each consumer records the requests it sends and the parts of the responses it relies on. That record, the contract, is then replayed against the provider in the provider\'s own pipeline. If the provider changes a field a consumer depends on, its build fails before deployment.\n\nAn end-to-end test needs every service running together and checks a whole flow. Contract tests are faster, run in isolation and point straight at the broken interface, but they do not prove business behavior across services. I use contracts for interface drift and keep a small number of end-to-end tests for critical journeys.',
    lookFor: [
      'Explains that consumers define the contract and providers verify it',
      'Notes contract tests run without deploying all services together',
      'Is clear about what contract tests do not cover',
      'Keeps a few end-to-end tests for complete journeys',
    ],
    mistakes: [
      'Confusing contract testing with schema validation of a single response',
      'Claiming contract tests replace functional tests of the provider',
    ],
    followUps: ['How do you stop a provider from deploying when a contract fails?'],
    sources: [src('Pact documentation: Introduction', 'https://docs.pact.io/')],
  },
  {
    id: 'q-api-005',
    topic: 'API testing',
    roles: ['manual', 'automation', 'sdet'],
    level: 'Mid',
    type: 'Scenario',
    question: 'A list endpoint supports pagination. What would you test?',
    answer:
      'First I learn whether it uses page numbers and sizes, offsets, or cursors. Then I seed a known number of records so I can predict results. I check the first, middle and last pages, an empty result, a page past the end, and page sizes at zero, one, the maximum and above it.\n\nThe important property is that walking every page returns each record exactly once, so I collect ids across pages and compare against the seeded set. I also insert or delete a record mid-walk to see whether offset paging skips or repeats items, and I confirm sort order is stable when sort keys tie.',
    lookFor: [
      'Seeds known data so results are predictable',
      'Covers boundaries such as last page, empty page and page size limits',
      'Checks that every record appears exactly once across pages',
      'Considers changes to the data during paging',
      'Mentions stable sort order or a tie-breaker',
    ],
    mistakes: ['Testing only page one with default parameters'],
    followUps: [
      'Why do cursor-based APIs handle concurrent inserts better than offsets?',
      'How would you test next and prev links in a Link header?',
    ],
    sources: [src('RFC 8288: Web Linking', 'https://www.rfc-editor.org/rfc/rfc8288')],
  },
  {
    id: 'q-api-006',
    topic: 'API testing',
    roles: ['automation', 'sdet'],
    level: 'Mid',
    type: 'Concept',
    question: 'Why validate API responses against a JSON Schema, and why is that not enough on its own?',
    answer:
      'A schema check catches structural drift quickly: a renamed field, a number that became a string, a required property that disappeared, or an unexpected null. It is cheap to apply to every response, so it gives broad coverage with little code.\n\nIt only proves shape, though. A response can match the schema and still return the wrong customer, a total that does not add up, or yesterday\'s data. So I pair schema validation with targeted value assertions on the fields that matter for the behavior under test, and I keep the schema in sync with the published API description rather than hand-copying it into tests.',
    lookFor: [
      'Explains what structural problems schemas catch',
      'States clearly that a valid shape does not mean correct values',
      'Combines schema checks with specific value assertions',
      'Mentions keeping the schema tied to the source of truth',
    ],
    mistakes: ['Writing a schema so loose that almost any response passes'],
    followUps: ['How do you handle optional fields and additionalProperties in the schema?'],
    sources: [src('JSON Schema documentation', 'https://json-schema.org/learn')],
  },
  {
    id: 'q-api-007',
    topic: 'API testing',
    roles: ['automation', 'sdet'],
    level: 'Senior',
    type: 'Scenario',
    question: 'Two users edit the same record at once and one change silently overwrites the other. How would you test a fix based on ETags?',
    answer:
      'The usual fix is optimistic concurrency. A GET returns an ETag for the current version, and an update must send it back in an If-Match header. If the record changed in between, the server returns 412 Precondition Failed instead of overwriting.\n\nMy test has two clients read the same record and keep their ETags. Client A updates successfully and I confirm the ETag changes. Client B then updates with the old ETag and should get 412, with the stored data still showing A\'s change. I also check what happens when If-Match is missing, since the team must decide whether to reject or allow it.',
    lookFor: [
      'Describes the read, compare and conditional write flow',
      'Expects 412 for a stale ETag',
      'Verifies stored state after the rejected write',
      'Raises the missing If-Match case as a design decision',
    ],
    mistakes: [
      'Trying to reproduce the race with timing and sleeps instead of controlling the sequence',
      'Checking only the status code and not the final stored value',
    ],
    followUps: ['How would the client recover after receiving 412?'],
    sources: [
      src('RFC 9110, section 13.1.1: If-Match', 'https://www.rfc-editor.org/rfc/rfc9110#section-13.1.1'),
      src('RFC 9110, section 15.5.13: 412 Precondition Failed', 'https://www.rfc-editor.org/rfc/rfc9110#section-15.5.13'),
      src('MDN: ETag', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag'),
    ],
  },
  {
    id: 'q-api-008',
    topic: 'API testing',
    roles: ['automation', 'sdet'],
    level: 'Mid',
    type: 'Scenario',
    question: 'An API limits each client to 100 requests per minute. How would you test the rate limit?',
    answer:
      'I confirm the rules first: per key, per user or per IP, and whether the window is fixed or sliding. Then, in a test environment, I send requests up to the limit and expect all to succeed, and the next one to get 429 Too Many Requests, ideally with a Retry-After header. After waiting that long, requests should succeed again.\n\nI also check that one client hitting the limit does not block another, that rejected calls have no side effects, and that any rate limit headers the API documents count down correctly. I avoid running this against shared or production systems.',
    lookFor: [
      'Clarifies scope and window type before testing',
      'Expects 429 and checks Retry-After or documented headers',
      'Verifies recovery after the window resets',
      'Checks isolation between clients',
      'Keeps the test in an appropriate environment',
    ],
    mistakes: ['Asserting exact timing so tightly that the test becomes flaky'],
    followUps: ['How would you make this test fast if the window is one hour?'],
    sources: [
      src('RFC 6585, section 4: 429 Too Many Requests', 'https://www.rfc-editor.org/rfc/rfc6585#section-4'),
      src('MDN: Retry-After', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After'),
    ],
  },
  {
    id: 'q-api-009',
    topic: 'API testing',
    roles: ['manual', 'automation'],
    level: 'Junior',
    type: 'Concept',
    question: 'Beyond the status code, what do you check in an API response?',
    answer:
      'The status code tells me the category of outcome, not whether the result is right. I check the body values that matter for the case, not only that fields exist. I check headers such as Content-Type, caching headers and Location after a create.\n\nI look at what the response should not contain, like passwords, internal ids or stack traces. Where the call changes data, I verify the change with a follow-up read or a database query. I keep an eye on response time as a signal, and for errors I check the message is useful and follows the agreed error format.',
    lookFor: [
      'Asserts meaningful body values',
      'Checks relevant headers',
      'Looks for sensitive data that should be absent',
      'Verifies side effects outside the response',
    ],
    mistakes: ['Treating a 200 as proof the feature works'],
    followUps: ['How would you assert on a field whose value changes every run, like a timestamp?'],
    sources: [MDN_STATUS, RFC9110],
  },
  {
    id: 'q-api-010',
    topic: 'API testing',
    roles: ['automation', 'sdet', 'lead'],
    level: 'Senior',
    type: 'Scenario',
    question: 'Your service calls a third-party payment API whose sandbox is slow and often down. How do you test your integration?',
    answer:
      'I split the problem. Most tests run against a stub of the payment API that I control, so I can return success, declines, timeouts, malformed bodies and slow responses on demand. That lets me check our retries, timeouts and error handling deterministically, which the real sandbox cannot do reliably.\n\nThe stub is only useful if it matches reality, so I keep it based on the provider\'s documented API and recorded real responses, and I run a small scheduled suite against the sandbox to catch drift. Sandbox failures alert the team but do not block every pull request.',
    lookFor: [
      'Uses a controllable stub for most tests',
      'Tests failure modes such as timeouts and declines',
      'Keeps the stub honest against the real provider',
      'Separates scheduled sandbox checks from PR gating',
    ],
    mistakes: [
      'Mocking so much that our own HTTP client and error mapping are never exercised',
      'Letting an unreliable sandbox block every merge',
    ],
    followUps: ['How would you detect that the provider changed a response field?'],
    sources: [src('Martin Fowler: Contract Test', 'https://martinfowler.com/bliki/ContractTest.html')],
  },
  {
    id: 'q-api-011',
    topic: 'API testing',
    roles: ['automation', 'sdet'],
    level: 'Mid',
    type: 'Concept',
    question: 'An API uses OAuth 2.0 bearer tokens with scopes. What authentication and authorization cases would you cover?',
    answer:
      'Bearer tokens go in the Authorization header, so I test a valid token, no header, a malformed header, an expired token and a token for a different audience or environment. Missing or invalid tokens should get 401, and a valid token without the needed scope should be refused, typically with 403 and an insufficient_scope error.\n\nFor each protected endpoint I map which scopes and roles should succeed and test both sides of that line. I also confirm tokens never show up in URLs or logs, and that a revoked token stops working within the documented time.',
    lookFor: [
      'Covers missing, malformed, expired and wrong-audience tokens',
      'Distinguishes invalid token from insufficient scope',
      'Builds a permission matrix and tests both allowed and denied',
      'Checks tokens are kept out of URLs and logs',
    ],
    mistakes: ['Testing only with an admin token, so permission gaps never show'],
    followUps: ['How would you get tokens for different roles in automated tests without hard-coding secrets?'],
    sources: [
      src('RFC 6750: OAuth 2.0 Bearer Token Usage', 'https://www.rfc-editor.org/rfc/rfc6750'),
      src('RFC 6749: The OAuth 2.0 Authorization Framework', 'https://www.rfc-editor.org/rfc/rfc6749'),
    ],
  },
  {
    id: 'q-api-012',
    topic: 'API testing',
    roles: ['sdet', 'lead'],
    level: 'Senior',
    type: 'Scenario',
    question: 'You join a team with 400 slow, flaky UI tests and almost no API tests. How do you move coverage down to the API layer?',
    answer:
      'I would not rewrite everything at once. I start by sorting the UI tests by what they actually verify. Many check business rules such as pricing, validation or permissions that the UI only displays, and those move to API tests that run in seconds.\n\nI keep a thin set of UI tests for real user journeys and things only the browser can show, like layout and client-side behavior. Each API test creates its own data through the API, so tests stay independent. I track suite time, flake rate and escaped defects so the team can see whether the shift is paying off.',
    lookFor: [
      'Moves tests incrementally, not a big rewrite',
      'Decides layer by what the test verifies',
      'Keeps a small UI layer for genuine user journeys',
      'Addresses test data independence',
      'Measures the outcome',
    ],
    mistakes: ['Deleting UI tests before equivalent API coverage exists'],
    followUps: ['Which UI tests would you refuse to move to the API layer, and why?'],
    sources: [src('Martin Fowler: The Practical Test Pyramid', 'https://martinfowler.com/articles/practical-test-pyramid.html')],
  },
];

export default questions;
