---
title: "How would you make a Postman catalog smoke test block a bad build?"
topic: api
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "Make a failed catalog assertion block the build even when the pipeline still needs to upload its test report."
looksFor:
  - "Runs an exported collection with a pinned command-line runner."
  - "Supplies credentials without committing or printing them."
  - "Publishes JUnit results and keeps a failed assertion fatal."
  - "Explains when complex fixtures and setup belong in code."
trap: "Publishing a report while suppressing the runner's nonzero exit code."
followUps:
  - question: "Your team wants the full failure report. Should you remove --bail?"
    answer: "Yes, if they want Newman to keep running after the first failed test. Postman's guide describes --bail as stopping the run and exiting with status 1. Newman's CLI source shows that a failed test already sets exit status 1 without the flag, unless exit-code suppression is enabled."
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

For an existing Newman job I'd export the collection as v2.1 JSON, run it with a pinned version, and supply the test credential from the CI secret store. I'd keep the token out of the collection and exported environment. The job can pass it with `--env-var` through a masked secret variable and with command tracing disabled.

I'd keep Newman's failure exit code and publish JUnit XML even on failure. Newman's documentation points new projects to the Postman CLI. I'd move a growing suite into code if it needed reusable data builders or more control over setup and cleanup.

### Example

Attach the script to the local catalog request, which uses `{{catalogToken}}` for authorization. Run `newman run catalog.json -r cli,junit --reporter-junit-export catalog.xml` with `--env-var "catalogToken=$CATALOG_TOKEN"` from the job's secret environment. If `CI-NOTEBOOK` is unavailable, the assertion should fail the job.
