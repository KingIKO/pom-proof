---
title: Jenkins has a red shipping job and no report. What would you change so the next failure is diagnosable?
topic: ci-git-docker
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Publish JUnit results after the test step and map the runner's exit status using its documented meanings.
looksFor:
  - Collects reports in a post section that runs after a failed test step.
  - Keeps a test failure distinct from runner or setup errors.
  - Archives diagnostic evidence scoped to the same run.
  - Treats an unexpectedly missing report as a failure.
trap: Suppressing every nonzero exit code and relying on a green build when the runner never started.
followUps:
  - question: Why can a normal failed test still show the build as failed?
    answer: If a shell step already failed on a nonzero exit, JUnit publishing cannot make that result better. Handle known runner exit codes explicitly if the distinction matters.
sources:
  - label: Jenkins Declarative post conditions
    url: https://www.jenkins.io/doc/book/pipeline/syntax/#post
  - label: Jenkins shell step and returnStatus
    url: https://www.jenkins.io/doc/pipeline/steps/workflow-durable-task-step/#sh-shell-script
  - label: Jenkins JUnit results and unstable status
    url: https://www.jenkins.io/doc/pipeline/steps/junit/
  - label: Jenkins archiveArtifacts step
    url: https://www.jenkins.io/doc/pipeline/steps/core/#archiveartifacts-archive-the-artifacts
  - label: Jenkins error step
    url: https://www.jenkins.io/doc/pipeline/steps/workflow-basic-steps/#error-error-signal
  - label: pytest exit codes
    url: https://docs.pytest.org/en/stable/reference/exit-codes.html
  - label: pytest output and JUnit XML
    url: https://docs.pytest.org/en/stable/how-to/output.html#creating-junitxml-format-files
examples:
  - title: Keep test failures visible without hiding runner errors
    variants:
      - lang: groovy
        label: Jenkins declarative pipeline (Groovy)
        code: |
          pipeline {
            agent { label 'linux-pytest' }
            stages {
              stage('Shipping tests') {
                steps {
                  sh 'mkdir -p results && rm -f results/shipping.xml results/pytest.log'
                  script {
                    int code = sh(
                      script: 'python -m pytest tests/shipping --junitxml=results/shipping.xml ' +
                        '> results/pytest.log 2>&1',
                      returnStatus: true
                    )
                    if (code != 0 && code != 1) {
                      error("Shipping test runner exited ${code}")
                    }
                  }
                }
                post {
                  always {
                    archiveArtifacts artifacts: 'results/pytest.log', allowEmptyArchive: true
                    junit 'results/shipping.xml'
                  }
                }
              }
            }
          }
---

First I'd make sure a missing report can't be confused with yesterday's output. I'd clear the report before running the suite and archive the run's log in the `post` section. A missing or invalid result belongs with runner and setup failures, where the log is the starting point.

For pytest, status 1 means the tests ran and some failed. I'd handle that status so the JUnit publisher can read the XML, mark the build unstable, and show which assertion failed. Other nonzero statuses fail the pipeline. I want the person on call to know where to start without downloading the whole workspace.

### Example

On a Linux agent with pytest installed, one wrong shipping total should leave an unstable build with the failed test and its log. If collection aborts or pytest is missing, the runner status fails the job and Jenkins still attempts to collect evidence.
