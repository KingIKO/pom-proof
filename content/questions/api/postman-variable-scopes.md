---
title: "Postman says Staging is selected, but health reports Local. Where would you look?"
topic: api
roles: [manual-qa, automation]
level: junior
type: tooling
oneLine: "Compare the resolved host with the selected environment and use the health response to tell which deployment answered."
looksFor:
  - "Checks the deployment marker before trusting a successful health status."
  - "Traces the winning base URL through the scopes Postman uses."
  - "Keeps the host out of saved request text so an environment change retargets the collection."
  - "Separates a shared API version from deployment-specific settings and secrets."
trap: "Trusting the environment picker when an iteration data field silently overrides the host."
followUps:
  - question: "The resolved URL matches Staging but the body still says Local. What's your next check?"
    answer: "I'd check which service answered that host and whether the deployment marker is configured correctly. Reordering Postman variables won't fix a host that points to the wrong service."
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

I'd compare `pm.variables.get("baseUrl")` with the value on the selected environment. If they differ, I'd look for a local value first, then the iteration data. Those beat the environment. Collection and global values are fallbacks, with collection taking precedence over global.

I'd define `baseUrl` in both environments and share the API version through the collection. With `{{baseUrl}}` in the request, I can switch targets without editing it. I keep the token in a supported vault or inject it at run time. It stays out of the shared export.

### Example

Both environments define `baseUrl` and `deployment`. Send `GET {{baseUrl}}/health` in each. Its script checks the resolved URL and expects the returned deployment to be `local` or `staging` as selected.
