import type { ReviewItem } from '../../types';

const item: ReviewItem = {
  id: 'pytest-invoice-review',
  title: 'Review a pytest invoice suite',
  kind: 'review',
  difficulty: 'Medium',
  topics: ['API testing', 'Pytest', 'Test isolation'],
  roles: ['automation', 'sdet', 'lead'],
  summary: 'Find how two HTTP tests can report green with a broken invoice API.',
  prompt: 'The test service creates invoices at `POST /invoices`. A successful create returns 201 and an ID. Conflict returns 409. A successful read returns 200 and the caller’s original amount. Use the snippet to flag what weakens confidence in these tests.',
  lang: 'python',
  code: `
import requests

BASE = "https://billing-sandbox.example.test"

def test_creates_invoice():
    global invoice_id
    with requests.Session() as session:
        session.headers.update({"Accept": "application/json"})
        try:
            response = session.post(f"{BASE}/invoices", json={"amount_cents": 1800}, timeout=4)
            assert response.status_code in (201, 409)
            invoice_id = response.json()["id"]
        except requests.exceptions.RequestException:
            pass

def test_reads_original_amount():
    with requests.Session() as session:
        session.headers.update({"Accept": "application/json"})
        response = session.get(f"{BASE}/invoices/{invoice_id}", timeout=4)
        assert response.status_code == 200`,
  issues: [
    { id: 'conflict', lines: [11, 11], category: 'Missing or weak assertion', title: 'Conflict is accepted as successful creation', explanation: 'The contract requires 201. Give the create test independent data and assert that it actually created a fresh invoice.' },
    { id: 'catch', lines: [13, 14], category: 'Swallowed error', title: 'Request exception can make the create test pass', explanation: 'If POST raises a request error, the test exits successfully without testing anything. Let the exception fail the test or fail with the request context.' },
    { id: 'setup', lines: [17, 18], category: 'Duplicated setup', title: 'Session setup is copied', explanation: 'Both tests configure and close a JSON session the same way. A function-scoped fixture can own this setup without sharing session state.' },
    { id: 'order', lines: [19, 19], category: 'Shared state between tests', title: 'Read test depends on the create test running first', explanation: 'The read test has no invoice when run alone. A fixture can seed a known invoice and clean it up independently of test order.' },
    { id: 'amount', lines: [20, 20], category: 'Missing or weak assertion', title: 'A 200 does not prove the amount was preserved', explanation: 'Assert the invoice ID and exact amount in the JSON response, using the data the fixture created.' },
  ],
  hints: ['Run the read test alone in your head.', 'Trace the create test when the request fails and when the server replies with a conflict.'],
  solutionNotes: 'Test a fresh create independently with a strict 201 assertion. Seed a known invoice for the read, then check its ID and amount. Keep the explicit timeouts and let connection failures fail the test.',
  interviewNotes: 'Separate transport success, protocol status and the business fields that prove the contract. Explain how failures remain understandable without being suppressed.',
  sources: [
    { label: 'Requests: Session objects', url: 'https://requests.readthedocs.io/en/latest/user/advanced/#session-objects' },
    { label: 'Requests: Errors and exceptions', url: 'https://requests.readthedocs.io/en/latest/user/quickstart/#errors-and-exceptions' },
    { label: 'Pytest: Fixtures and cleanup', url: 'https://docs.pytest.org/en/stable/how-to/fixtures.html' },
  ],
};

export default item;
