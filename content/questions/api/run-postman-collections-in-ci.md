---
title: "How would you make a Postman catalog smoke test block a bad build?"
topic: api
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "I'd make the build fail when the catalog smoke test, a quick check of basic behavior, fails. I'd still upload the test report."
looksFor:
  - "Export the collection and run it with an exact version of the command-line runner."
  - "Supply credentials without saving them in Git or printing them."
  - "Publish JUnit results without letting a failed check pass the job."
  - "Explain when to move complex test data and setup into code."
trap: "Publishing a test report but hiding the failure code the runner sent back."
followUps:
  - question: "If the team wants the full failure report, would you remove --bail?"
    answer: "I'd remove it if the team wants Newman to continue after the first failed check. Postman documents that --bail stops the run and exits with status 1. Newman's code still exits with status 1 for a failed check without that flag, unless the job suppresses failure codes."
sources:
  - label: Postman guide, stopping a run on failure
    url: https://learning.postman.com/docs/reference/newman-cli/command-line-integration-with-newman/
  - label: Newman flags and reporters
    url: https://github.com/postmanlabs/newman#reporters
  - label: Newman CLI source, exit code on failed tests
    url: https://raw.githubusercontent.com/postmanlabs/newman/develop/bin/newman.js
  - label: Postman test and expect API
    url: https://learning.postman.com/docs/tests-and-scripts/write-scripts/postman-sandbox-reference/pm-test-expect/
  - label: Postman response JSON
    url: https://learning.postman.com/docs/tests-and-scripts/write-scripts/postman-sandbox-reference/pm-response/
examples:
  - title: A catalog assertion that can fail the Newman job
    variants:
      - lang: js
        label: Postman scripts (JavaScript)
        code: |
          pm.test("The catalog smoke item is available", () => {
            pm.response.to.have.status(200);
            const item = pm.response.json();
            pm.expect(item.sku).to.eql("CI-NOTEBOOK");
            pm.expect(item.available).to.eql(true);
          });
---

For an existing Newman job, I'd export the Postman collection, a saved group of requests, as v2.1 JSON. I'd run it with a fixed Newman version. I'd get the test credential from the CI secret store. I'd keep it out of the saved collection and exported environment. I'd pass it with `--env-var` using a masked secret and turn off command tracing so the job doesn't print it.

I'd preserve Newman's failure exit code and publish the JUnit XML test report even when the run fails. Newman's docs point new projects to the Postman CLI. If the suite needs reusable code to build test data or more control over setup and cleanup, I'd move it into code.

### Example

I'd attach the script to the local catalog request that uses `{{catalogToken}}` to authorize the call. I'd run `newman run catalog.json -r cli,junit --reporter-junit-export catalog.xml` and add `--env-var "catalogToken=$CATALOG_TOKEN"` using the job's secret environment. If `CI-NOTEBOOK` is unavailable, I'd expect the check to fail the job.
