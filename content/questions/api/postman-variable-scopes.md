---
title: "Postman shows Staging, but the health check says Local. How would you find what answered?"
topic: api
roles: [manual-qa, automation]
level: junior
type: tooling
oneLine: "I'd compare the URL Postman used with the selected environment. I'd use the health reply to see which deployment answered."
looksFor:
  - "Check the deployment name in the reply before trusting a passing health status."
  - "Trace which Postman variable supplied the final base URL."
  - "Leave the host out of the saved request so switching environments changes the target."
  - "Keep the shared API version separate from deployment settings and secrets."
trap: "Trusting the environment picker when a data row can override the host."
followUps:
  - question: "The URL matches Staging, but the body still says Local. What would you check next?"
    answer: "I'd check which service answered at that host and how it sets its deployment name. Changing the order of Postman variables won't fix a host that points to the wrong service."
sources:
  - label: Postman variable scopes and secret storage
    url: https://learning.postman.com/docs/use/send-requests/variables/variables/
  - label: Postman variable accessor precedence
    url: https://learning.postman.com/docs/tests-and-scripts/write-scripts/postman-sandbox-reference/pm-variables/
  - label: Postman test and expect API
    url: https://learning.postman.com/docs/tests-and-scripts/write-scripts/postman-sandbox-reference/pm-test-expect/
  - label: Postman response JSON
    url: https://learning.postman.com/docs/tests-and-scripts/write-scripts/postman-sandbox-reference/pm-response/
examples:
  - title: Check that the health response came from the selected environment
    variants:
      - lang: js
        label: Postman scripts (JavaScript)
        code: |
          pm.test("Health belongs to the selected environment", () => {
            pm.response.to.have.status(200);
            const deployment = pm.environment.get("deployment");
            pm.expect(deployment).to.be.oneOf(["local", "staging"]);
            pm.expect(pm.variables.get("baseUrl")).to.eql(pm.environment.get("baseUrl"));
            pm.expect(pm.response.json().deployment).to.eql(deployment);
          });
---

I'd compare `pm.variables.get("baseUrl")` with the value in the selected environment. If they differ, I'd look first for a variable local to the run, then for one in the data row. Both take priority over the environment. If none of these supplies a value, Postman tries the collection before the global value.

I'd set `baseUrl`, the starting address for requests, in both environments. I'd share the API version through the collection, the saved group of requests. With `{{baseUrl}}` in the request, I can switch targets without editing it. I'd keep the token in a supported vault or pass it in when the run starts. I'd keep it out of the shared export.

### Example

I'd define `baseUrl` and `deployment` in both environments. I'd send `GET {{baseUrl}}/health` in each. I'd check the address Postman used and expect the reply to say `local` or `staging`, depending on which environment I picked.
