---
title: "A Jenkins shipping job fails without a report. What would you change so the next failure is easier to investigate?"
topic: ci-git-docker
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "I publish the JUnit test report after the test step. I use the runner's written exit status rules to tell different failures apart."
looksFor:
  - "Collect the report in a step that runs even after the test command fails."
  - "Tell failed tests apart from problems that stop the runner or setup."
  - "Save evidence only from the run you're reporting."
  - "Treat a report that's unexpectedly missing as a job failure."
trap: "Ignoring every nonzero exit status and trusting a passing build when the test runner never started."
followUps:
  - question: "Why can an ordinary test failure leave the Jenkins build failed even after you publish the report?"
    answer: "If the shell step already failed on a nonzero exit, publishing JUnit results can't improve the build result. I'd handle known exit codes directly if I need to distinguish them."
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

I'd remove the old report before running the suite so I can't mistake it for the current one. I'd save the run's log in Jenkins's `post` section, which runs afterward. If the report is missing or unreadable, I'd treat it as a runner or setup failure and start with the log.

In pytest, exit status 1 means the tests ran and some failed. I'd handle that code so the report step can read the JUnit XML, a structured test report. Jenkins can then mark the build unstable and show which assertion, or expected result, failed. I'd fail the pipeline for other nonzero codes. I want the person on call to find the evidence without downloading the whole workspace.

### Example

On a Linux agent with pytest installed, I'd expect a wrong shipping total to leave an unstable build with the failed test and its log. If pytest can't collect the tests or isn't installed, I'd fail the job using the runner status. I'd still have Jenkins try to collect evidence.
