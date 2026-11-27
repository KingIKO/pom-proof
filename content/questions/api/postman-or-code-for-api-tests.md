---
title: "Support shares a closed-ticket request. Which checks should move when reopening adds a second user?"
topic: api
roles: [manual-qa, automation, sdet]
level: mid
type: concept
oneLine: "Keep the closed-ticket reproduction for support and give the two-user edit and reopen regression one home beside the service."
looksFor:
  - "Gives support a read-only reproduction they can share without setting up both users."
  - "Explains who creates and resets the writable ticket for each test run."
  - "Keeps the edit and reopen expectations beside changes to the ticket behavior."
  - "Checks whether the small collection can still run unattended with its own credentials."
trap: "Maintaining the same regression in two suites and letting their expectations drift."
followUps:
  - question: "Can support keep its original ticket once the code suite starts reopening tickets in parallel?"
    answer: "Yes, if it stays a separate read-only fixture. Each code run should create and clean up its own ticket so a reopen never changes the record support uses."
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

I'd draw the line at who owns the ticket state. Support can use one closed sandbox ticket to see what a read-only response looks like. The edit and reopen regression changes state under two identities. I'd give each run its own ticket and cleanup, and keep that regression in code so reviewers see its expectations beside the service change.

If the support read is also useful as a smoke test, I'd run just that small collection from CI. Newman expects a v2.1 export and doesn't support Postman Vault methods, so I'd supply its test credential at run time. I can review a secret-free export in Git without duplicating the edit and reopen matrix there.

### Example

Leave a shared sandbox request for a closed ticket. It should return `200`, `closed`, and `canEdit: false`. I'd put the multi-user edit and reopen matrix in code with independent fixtures.
