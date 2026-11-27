---
title: "One Jenkins browser agent finishes early. How could it run more checkout tests without building the app again?"
topic: ci-git-docker
roles: [sdet]
level: senior
type: tooling
oneLine: "I give both machines the same build. I move tests between them based on measured run times."
looksFor:
  - "Use the two JUnit reports and stage timings to pick which tests to move."
  - "Move tests without rebuilding the storefront on either machine."
  - "Check that each group gets different tests and uses separate files and data."
  - "Let the other group finish and publish its report if one fails."
trap: "Sharing a workspace that both jobs can change or waiting for a timeout to notice an uneven split."
followUps:
  - question: "If both groups spend more time restoring `dist` than running checkout tests, would you change the split?"
    answer: "I'd keep the split and measure the transfer first. If Jenkins's stash, its temporary file copy for the run, is slow, I'd try downloading the same build by ID from shared storage."
sources:
  - label: Jenkins Declarative parallel stages and agents
    url: https://www.jenkins.io/doc/book/pipeline/syntax/#parallel
  - label: Jenkins stash and unstash
    url: https://www.jenkins.io/doc/pipeline/steps/workflow-basic-steps/#stash-stash-some-files-to-be-used-later-in-the-build
  - label: Jenkins clean workspace step
    url: https://www.jenkins.io/doc/pipeline/steps/workflow-basic-steps/#deletedir-recursively-delete-the-current-directory-from-the-workspace
  - label: Jenkins checkout of the triggering revision
    url: https://www.jenkins.io/doc/book/pipeline/jenkinsfile/#getting-started
  - label: Jenkins JUnit publication
    url: https://www.jenkins.io/doc/pipeline/steps/junit/
  - label: Playwright sharding
    url: https://playwright.dev/docs/test-sharding
  - label: Playwright JUnit reporter file
    url: https://playwright.dev/docs/test-reporters#junit-reporter
  - label: npm clean install
    url: https://docs.npmjs.com/cli/v11/commands/npm-ci
examples:
  - title: Build once and publish results from both shards
    variants:
      - lang: groovy
        label: Jenkins declarative pipeline (Groovy)
        code: |
          pipeline {
            agent none
            options { skipDefaultCheckout() }
            stages {
              stage('Build storefront') {
                agent { label 'linux-node' }
                steps {
                  deleteDir()
                  checkout scm
                  sh 'npm ci && npm run build'
                  stash name: 'storefront', includes: 'dist/**'
                }
              }
              stage('Browser checks') {
                parallel {
                  stage('Shard 1') {
                    agent { label 'linux-playwright' }
                    steps {
                      deleteDir()
                      checkout scm
                      unstash 'storefront'
                      sh 'npm ci'
                      sh 'PLAYWRIGHT_JUNIT_OUTPUT_FILE=shard-1.xml ' +
                        'npx playwright test --shard=1/2 --reporter=junit'
                    }
                    post {
                      always { junit 'shard-1.xml' }
                    }
                  }
                  stage('Shard 2') {
                    agent { label 'linux-playwright' }
                    steps {
                      deleteDir()
                      checkout scm
                      unstash 'storefront'
                      sh 'npm ci'
                      sh 'PLAYWRIGHT_JUNIT_OUTPUT_FILE=shard-2.xml ' +
                        'npx playwright test --shard=2/2 --reporter=junit'
                    }
                    post {
                      always { junit 'shard-2.xml' }
                    }
                  }
                }
              }
            }
          }
---

I'd check the times for both agents, the machines Jenkins uses to run work. I'd see whether long tests or repeated setup explain the difference. A shard is one group of tests. If a few test files explain most of the gap, I'd use their recorded times to move work to the faster shard.

I'd check whether the last group finishes sooner. Setup such as downloading packages needs a different fix.

I'd use the same storefront for both jobs. I'd stash the compiled files once, meaning save a copy for other stages in the same run. I'd check out the same revision in each parallel stage and restore the files into clean workspaces. I'd give each shard its own checkout records and publish its XML report even if the other shard fails.

### Example

I use a Jenkinsfile saved in Git, agents that can run a browser, and Playwright serving the compiled `dist` folder. Each branch runs one shard and writes a separate JUnit XML test report. If either branch fails, I'd expect the whole run to fail and the other shard to finish.
