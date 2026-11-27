---
title: "Maven fails an order test, but Jenkins hides the failed assertion. Where would you publish the XML report?"
topic: ci-git-docker
roles: [automation, sdet]
level: junior
type: tooling
oneLine: "I publish the report in the order stage's Declarative `post` section, which runs after the stage. I set it to run even if the test command fails."
looksFor:
  - "Show where the order stage reads the report that Surefire writes after Maven fails."
  - "Make the machine, test command, and `post` action easy to find in the Jenkinsfile."
  - "Use one small block of code if a setup step needs an exception."
  - "Explain when stages that change during a run are worth using Scripted Pipeline."
trap: "Using complex Groovy to generate test stages that can be written down ahead of time."
followUps:
  - question: "If the order stage needs one conditional setup step, would you rewrite it before adding the report?"
    answer: "I'd keep the stage and use a small script block if setup needs Groovy. I'd leave the test command and its `post` action visible in Declarative."
sources:
  - label: Jenkins Declarative and Scripted Pipeline syntax
    url: https://www.jenkins.io/doc/book/pipeline/syntax/
  - label: Jenkins tests and artifacts
    url: https://www.jenkins.io/doc/pipeline/tour/tests-and-artifacts/
  - label: Maven Surefire test reports
    url: https://maven.apache.org/surefire/maven-surefire-plugin/
  - label: Maven noninteractive command option
    url: https://maven.apache.org/ref/3.9.11/maven-embedder/cli.html
examples:
  - title: Run and publish order-service tests
    variants:
      - lang: groovy
        label: Jenkins declarative pipeline (Groovy)
        code: |
          pipeline {
            agent { label 'linux-maven' }
            stages {
              stage('Order service tests') {
                steps {
                  sh 'mvn -B test'
                }
                post {
                  always {
                    junit 'target/surefire-reports/TEST-*.xml'
                  }
                }
              }
            }
          }
---

I'd point the `junit` report reader at the XML file Maven's Surefire test runner writes. I'd put that step under `always` in the order stage's `post` section. I'd make one assertion, a check for an expected result, fail on purpose and look for it in Jenkins.

Declarative Pipeline uses a fixed layout. It lets me find the agent, the machine that runs the work, along with the Maven command and report step in set places. If one setup step needs Groovy, a scripting language, I'd put it in a small `script` block. I'd consider Scripted Pipeline if I need to create stages from information that only exists once the job is running. The fixed order stage doesn't need that.

### Example

Suppose my Maven order service uses Surefire. I run the tests on a Linux agent with Java and Maven. I publish the XML report in `post`, even when a failed assertion makes Maven return a nonzero exit status.
