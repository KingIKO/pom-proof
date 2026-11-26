import type { Question, Source } from '../types';

const src = (label: string, url: string): Source => ({ label, url });
const CS = 'https://cheatsheetseries.owasp.org/cheatsheets/';

const questions: Question[] = [
  {
    id: 'q-sec-001',
    topic: 'Security basics',
    roles: ['manual', 'automation', 'sdet'],
    level: 'Junior',
    type: 'Concept',
    question: 'You are not a security specialist. What security checks can you reasonably include in everyday testing?',
    answer:
      'Quite a lot, as long as it stays within what I am authorized to test. I check that pages and API calls require login where they should, that one user cannot see or change another user\'s data, and that logging out actually ends the session. I look for sensitive data where it should not be: in URLs, error messages, logs or responses.\n\nI also check that input is validated on the server, not only in the browser. The OWASP Top 10 is a good reference for common risks, and anything that looks serious goes to the security team rather than being explored further on my own.',
    lookFor: [
      'Stays within authorized scope',
      'Focuses on access control and session handling',
      'Looks for sensitive data exposure',
      'References OWASP as a guide',
      'Escalates findings to specialists',
    ],
    mistakes: ['Running attack tools against production without permission'],
    followUps: ['How would you write up a possible security issue in a bug tracker that many people can read?'],
    sources: [src('OWASP Top 10', 'https://owasp.org/Top10/')],
  },
  {
    id: 'q-sec-002',
    topic: 'Security basics',
    roles: ['manual', 'automation', 'sdet'],
    level: 'Mid',
    type: 'Scenario',
    question: 'Orders are fetched with GET /orders/{id}. How would you check that users can only see their own orders?',
    answer:
      'This is an object-level authorization check. In a test environment I create two accounts, A and B, each with their own orders. Logged in as A, I request one of B\'s order ids and expect a refusal, either 403 or 404 depending on the team\'s rule, and no order data in the body.\n\nI repeat that for every operation on the resource, including update and delete, and for related endpoints like invoices. I also automate it, because these checks regress easily when new endpoints are added. The underlying fix is a server-side ownership check on every request, not hiding links in the UI.',
    lookFor: [
      'Names it as an authorization problem',
      'Uses two test accounts the tester owns',
      'Covers read, update and delete',
      'Expects a refusal with no data leaked',
      'Places the fix on the server',
    ],
    mistakes: ['Assuming ids that are hard to guess make the check unnecessary'],
    followUps: ['How would you build this into a reusable automated test for every new endpoint?'],
    sources: [
      src('OWASP Insecure Direct Object Reference Prevention Cheat Sheet', CS + 'Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html'),
      src('OWASP API Security Top 10', 'https://owasp.org/API-Security/'),
    ],
  },
  {
    id: 'q-sec-003',
    topic: 'Security basics',
    roles: ['manual', 'automation', 'sdet'],
    level: 'Mid',
    type: 'Concept',
    question: 'What should you check on a session cookie?',
    answer:
      'I look at the Set-Cookie header after login. HttpOnly should be set so page scripts cannot read the cookie. Secure should be set so it is only sent over HTTPS. SameSite should be Lax or Strict unless there is a documented reason for None, which then requires Secure.\n\nBeyond the flags, I check that the session id changes after login, that logout invalidates the session on the server and not just in the browser, and that idle and absolute timeouts behave as specified. The value itself should be random and carry no readable user details.',
    lookFor: [
      'Checks HttpOnly, Secure and SameSite',
      'Knows SameSite=None requires Secure',
      'Verifies session id rotation at login',
      'Verifies server-side logout and timeouts',
    ],
    mistakes: ['Checking logout only by confirming the browser redirects to the login page'],
    followUps: ['How would you confirm in a test that logout invalidated the session on the server?'],
    sources: [
      src('MDN: Set-Cookie', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie'),
      src('OWASP Session Management Cheat Sheet', CS + 'Session_Management_Cheat_Sheet.html'),
    ],
  },
  {
    id: 'q-sec-004',
    topic: 'Security basics',
    roles: ['manual', 'automation', 'sdet'],
    level: 'Mid',
    type: 'Scenario',
    question: 'How would you check that a form handles input safely, without trying to attack the application?',
    answer:
      'I focus on confirming the defenses exist. Functionally, I enter names with apostrophes, angle brackets, accented letters and non-Latin scripts, and check they are stored and displayed exactly as typed, as plain text, with no errors. Correct display of ordinary special characters is a good sign that output is encoded.\n\nI also check server-side validation by sending the API request directly with values the UI would block. With the developers, I confirm queries use parameterized statements, and in an approved test environment the security team can run a scanner such as ZAP. Anything suspicious is reported, not explored.',
    lookFor: [
      'Tests ordinary special characters for correct storage and display',
      'Checks validation on the server, not just the browser',
      'Confirms parameterized queries and output encoding with developers',
      'Uses scanners only in approved environments',
    ],
    mistakes: ['Pasting attack strings found online into a shared or production system'],
    followUps: ['Why is client-side validation not a security control?'],
    sources: [
      src('OWASP SQL Injection Prevention Cheat Sheet', CS + 'SQL_Injection_Prevention_Cheat_Sheet.html'),
      src('OWASP Cross Site Scripting Prevention Cheat Sheet', CS + 'Cross_Site_Scripting_Prevention_Cheat_Sheet.html'),
      src('OWASP Input Validation Cheat Sheet', CS + 'Input_Validation_Cheat_Sheet.html'),
    ],
  },
  {
    id: 'q-sec-005',
    topic: 'Security basics',
    roles: ['sdet', 'lead'],
    level: 'Senior',
    type: 'Scenario',
    question: 'How would you build security checks into a team\'s delivery pipeline?',
    answer:
      'I layer them by speed. On every pull request: secret scanning, dependency checks for known vulnerable packages, and static analysis, plus our automated authorization tests. Against a deployed test environment, on a schedule: a dynamic scanner configured and approved by the security team, with results triaged rather than dumped into a backlog.\n\nI agree severity rules with security up front, so only high-risk findings block a release, and every exception has an owner and a date. The OWASP ASVS is useful for turning vague goals into testable requirements. Periodic manual testing by specialists still covers what tools miss.',
    lookFor: [
      'Orders checks by speed and pipeline stage',
      'Includes secrets, dependencies and static analysis',
      'Runs dynamic scans only in approved environments',
      'Defines severity rules and exception ownership',
      'Keeps specialist manual testing in the plan',
    ],
    mistakes: ['Blocking every merge on every scanner warning until the team disables the tool'],
    followUps: ['How would you handle a critical vulnerability in a dependency with no fixed version yet?'],
    sources: [
      src('OWASP Application Security Verification Standard', 'https://owasp.org/www-project-application-security-verification-standard/'),
      src('OWASP Web Security Testing Guide', 'https://owasp.org/www-project-web-security-testing-guide/'),
      src('ZAP documentation', 'https://www.zaproxy.org/docs/'),
    ],
  },
];

export default questions;
