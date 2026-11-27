---
title: What test results and artifacts should CI save when browser tests fail?
topic: ci-git-docker
roles: [manual-qa, automation, sdet]
level: mid
type: tooling
oneLine: Save a result people can scan, then attach the smallest evidence needed to understand the named failing attempt.
looksFor:
  - Test and attempt identifiers in a structured result
  - A useful trace, screenshot, or narrow log
  - Evidence uploaded on failure and separated by job
  - Sensitive data handling and retention
trap: Uploading a large pile of files with no link to the failure, or losing the files because the upload only runs on success.
followUps:
  - question: What value does a trace add to a screenshot?
    answer: A screenshot shows one moment. A trace can show the preceding actions, snapshots, and network activity that explain it.
sources:
  - label: Playwright reporters
    url: https://playwright.dev/docs/test-reporters
  - label: Playwright Trace Viewer
    url: https://playwright.dev/docs/trace-viewer
  - label: Playwright named test steps
    url: https://playwright.dev/docs/api/class-test#test-step
  - label: Playwright command and trace options
    url: https://playwright.dev/docs/test-cli
  - label: GitHub Actions workflow artifacts
    url: https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts
  - label: GitHub Actions checkout
    url: https://github.com/actions/checkout/tree/v7
  - label: GitHub Actions Node setup
    url: https://github.com/actions/setup-node/tree/v7
  - label: GitHub Actions run metadata
    url: https://docs.github.com/en/actions/reference/workflows-and-actions/variables
  - label: GitHub Actions conditional steps
    url: https://docs.github.com/en/actions/reference/workflows-and-actions/expressions#status-check-functions
  - label: GitHub Actions step outcome and run attempt contexts
    url: https://docs.github.com/en/actions/reference/workflows-and-actions/contexts
  - label: GitHub Actions artifact upload
    url: https://github.com/actions/upload-artifact/tree/v7
  - label: Playwright CI installation
    url: https://playwright.dev/docs/ci
examples:
  - title: Keep the failed export attempt and its build identifier
    variants:
      - lang: yaml
        label: GitHub Actions (YAML)
        code: |
          name: Export smoke
          on: [pull_request]
          permissions:
            contents: read
          jobs:
            export:
              runs-on: ubuntu-latest
              steps:
                - uses: actions/checkout@v7
                - uses: actions/setup-node@v7
                  with:
                    node-version: '24'
                - run: npm ci
                - run: npx playwright install --with-deps chromium
                - run: printf 'commit=%s\nrun=%s\n' "$GITHUB_SHA" "$GITHUB_RUN_ID" > build.txt
                - id: tests
                  run: npx playwright test tests/export.spec.ts --reporter=line,junit --trace retain-on-failure
                  env:
                    PLAYWRIGHT_JUNIT_OUTPUT_FILE: export.xml
                - if: ${{ failure() && steps.tests.outcome == 'failure' }}
                  uses: actions/upload-artifact@v7
                  with:
                    name: export-failure-${{ github.run_attempt }}
                    path: |
                      build.txt
                      export.xml
                      test-results/**/trace.zip
                    retention-days: 5
---

I save a structured test result with the test name, browser, commit, and attempt. For Playwright I might use a JUnit result for the CI summary and attach a failure trace with a screenshot when visual state matters. I make sure the upload runs after a normal test failure, and label files with the shard so a later job can't be mistaken for the one that failed.

I'd inspect the output from a deliberately failing test. Someone should be able to find the right attempt without downloading every file. I keep sensitive data out of tests and artifacts, restrict access, and set a retention period suited to how the team investigates.

I name steps for user actions and make sure the assertion reports the expected and actual values. The run should identify the application build as well as the test revision when they differ. That gives someone enough to start investigating without a rerun.

### Example

In a Chromium-only repo with a synthetic export spec, the workflow tests the checked-out build. A failed export should leave XML, the commit and run identifiers, and the retained trace. A teammate can find the Generate action and see why the file differed.
