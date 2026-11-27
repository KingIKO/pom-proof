---
title: Maven fails an order test and Jenkins hides the assertion. Where would you put XML publishing?
topic: ci-git-docker
roles: [automation, sdet]
level: junior
type: tooling
oneLine: Put the publisher in the order stage's Declarative post section so it can read the report after a failed test command.
looksFor:
  - Shows where the order stage reads Surefire XML after Maven fails.
  - Keeps the agent, test command, and post action easy to locate in the Jenkinsfile.
  - Uses a small scripted step for a local exception instead of rewriting the whole job.
  - Gives a reason to choose Scripted Pipeline when the job's stages genuinely vary at runtime.
trap: Generating routine test stages in complex Groovy before anyone needs dynamic behavior.
followUps:
  - question: The order stage needs one conditional setup step. Would you rewrite it before adding the publisher?
    answer: I'd keep the existing stage and use a small script block if the setup needs Groovy. The test command and its post action can stay visible in Declarative.
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

I'd put `junit` in the order stage's `post` section with `always`, pointing to the Surefire XML.
Then I'd force a test assertion to fail and check that Jenkins still shows it. Declarative lets
the team see the agent, the Maven command, and the publisher in fixed places.

If there's one setup exception that needs Groovy, I'd keep it in a `script` block. I'd consider
Scripted Pipeline when the job needs to build its stages from data only available at runtime.
That complexity doesn't help this fixed order test stage.

### Example

Assume the order service is a Maven project using Surefire and the job has a Linux agent with Java and Maven. The test stage runs the suite and publishes the generated XML from its post section, including when a failing assertion makes Maven exit nonzero.
