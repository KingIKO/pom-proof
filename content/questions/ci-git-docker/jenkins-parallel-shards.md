---
title: One Jenkins browser agent finishes early. How would you give it more checkout work without rebuilding?
topic: ci-git-docker
roles: [sdet]
level: senior
type: tooling
oneLine: Give both agents the same build, then move test work based on how long each agent actually takes.
looksFor:
  - Uses the two JUnit reports and stage timings to decide what work to move.
  - Moves test cases without rebuilding the storefront for either agent.
  - Checks that separate workspaces and shard selections do not duplicate work or data.
  - Lets the other agent finish and publish when one shard fails.
trap: Sharing a mutable workspace or waiting for the suite to time out before finding one shard ran most of the tests.
followUps:
  - question: Both shards spend longer restoring dist than testing checkout. Would you redistribute the specs?
    answer: I'd leave the split alone and measure the build transfer first. If stash is the bottleneck, I'd try retrieving the same build by its identifier from a shared artifact store.
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

I'd read both agents' timings to see whether the gap comes from long tests or repeated setup. If a few specs account for most of the difference, I'd use their recorded durations to move work to the faster shard and check whether the last finish improves. Other setup time, such as downloading dependencies, needs a different fix.

The jobs should test the same storefront. I'd stash the compiled files once, then have parallel stages check out the same revision and restore that build into clean workspaces. I'd give each shard separate checkout records and publish its XML even if another shard fails.

### Example

This Jenkinsfile assumes a source-controlled pipeline, browser-ready agents, and a Playwright setup that serves the compiled `dist` directory. Each branch runs its own shard and publishes separate JUnit XML. A failure in either branch makes the overall run fail while the other shard can finish.
