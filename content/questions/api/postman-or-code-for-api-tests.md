---
title: "Support shares a closed-ticket request. Where would you test editing and reopening with two users?"
topic: api
roles: [manual-qa, automation, sdet]
level: mid
type: concept
oneLine: "I'd keep the closed-ticket request for support. I'd put the two-user edit and reopen tests beside the service code."
looksFor:
  - "Give support a read-only request it can share without setting up both users."
  - "Say who creates and resets the ticket for each test run that changes it."
  - "Keep the edit and reopen expectations near changes to the ticket code."
  - "Check that the small set of requests can run on its own with separate credentials."
trap: "Keeping the same test in two suites and letting their expected results drift apart."
followUps:
  - question: "Can support keep its original ticket once the code tests reopen tickets in parallel?"
    answer: "I'd keep it as a separate test record that support only reads. Each code run should create and clean up its own ticket so it never changes the record support uses."
sources:
  - label: Postman, writing tests in a collection
    url: https://learning.postman.com/docs/tests-and-scripts/write-scripts/test-scripts/
  - label: Postman test and expect API
    url: https://learning.postman.com/docs/tests-and-scripts/write-scripts/postman-sandbox-reference/pm-test-expect/
  - label: Postman response JSON
    url: https://learning.postman.com/docs/tests-and-scripts/write-scripts/postman-sandbox-reference/pm-response/
  - label: Postman, Newman support and limits
    url: https://learning.postman.com/docs/reference/newman-cli/command-line-integration-with-newman/
  - label: Postman Vault support by runner
    url: https://learning.postman.com/docs/tests-and-scripts/write-scripts/postman-sandbox-reference/pm-vault/
  - label: Postman, exporting collections
    url: https://learning.postman.com/docs/getting-started/importing-and-exporting/exporting-data/
examples:
  - title: Keep a small support reproduction as a Postman assertion
    variants:
      - lang: js
        label: Postman scripts (JavaScript)
        code: |
          pm.test("Closed tickets stay read-only", () => {
            pm.response.to.have.status(200);
            const ticket = pm.response.json();
            pm.expect(ticket.state).to.eql("closed");
            pm.expect(ticket.canEdit).to.eql(false);
          });
---

I'd decide based on who owns the ticket the test uses. Support can read one closed ticket in a sandbox, a test environment, to see a typical reply. The edit and reopen regression test checks that past behavior still works when two users change the ticket. I'd give each run a separate ticket and clean it up. I'd keep that test in code so reviewers see the expected results near changes to the service.

If the support request also works as a quick smoke test, I'd run just that small Postman collection in CI. The collection is a saved group of requests. Newman expects a v2.1 export and doesn't support Postman Vault methods. I'd supply a test credential when the run starts so I can review the export in Git without secrets. I'd keep the edit and reopen cases in code only.

### Example

I'd keep a shared request that reads a closed ticket. I'd check for `200`, `closed`, and `canEdit: false`. In code, I'd give the tests for multiple users their own ticket records.
