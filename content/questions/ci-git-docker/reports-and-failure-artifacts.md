---
title: What test results and artifacts should CI save when browser tests fail?
topic: ci-git-docker
roles: [manual-qa, automation, sdet]
level: mid
type: tooling
oneLine: I save a result people can scan. I attach just enough evidence to explain the specific failing attempt.
looksFor:
  - Include the test and attempt IDs in the structured result.
  - Save a trace, screenshot, or focused log that helps explain the failure.
  - Upload evidence even when a test fails and keep jobs' files separate.
  - Protect sensitive data and decide how long to keep the files.
trap: Uploading files without showing which failure they explain. Uploading only on success can also lose the files you need.
followUps:
  - question: What value does a trace add to a screenshot?
    answer: A screenshot shows me one moment. With a trace, I can see earlier actions, snapshots, and network activity that may explain that moment.
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

I save a structured test result with the test name, browser, commit, and attempt. A CI artifact is a file the run keeps for later use. For Playwright, I might use a JUnit result for the CI summary and attach a failure trace, a record of what happened. If the visual state matters, I'd attach a screenshot too.

I make sure the upload still runs after an ordinary test failure. I label each file with its shard, the group of tests the job ran. That keeps people from confusing a later job with the one that failed.

I'd make a test fail on purpose and check what the run saves. A teammate should find the right attempt without downloading every file. I keep sensitive data out of tests and artifacts. I restrict access to the files and keep them for as long as the team's investigations need them.

I name test steps after the user's actions. I check that each assertion reports the expected and actual values. If the application build and test revision differ, I record both. A teammate should then have enough information to start investigating without running the test again.

### Example

If a repository tests only in Chromium, I can use a test export with synthetic data against the checked-out build. If the export test fails, I expect the saved XML, the commit and run IDs, and the trace. A teammate can find the Generate action in the trace and see why the file differed.
