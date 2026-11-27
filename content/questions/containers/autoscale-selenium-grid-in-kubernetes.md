---
title: Chrome sessions wait while the Grid seems idle. Which Kubernetes change would help?
topic: containers
roles: [sdet]
level: senior
type: tooling
oneLine: Check whether Chrome requests are waiting for a matching slot, then add capacity where the queue actually builds.
looksFor:
  - Counts slots that can take the requested browser instead of counting idle Pods.
  - Uses queue wait, node registration time, and the scheduler to explain slow starts.
  - Distinguishes the queued request timeout from the idle session timeout.
  - Tests how much CPU, memory, and shared memory a real session uses.
trap: Scaling from CPU alone, leaving new session requests waiting when there are no spare browser slots.
followUps:
  - question: What would you check if the queue grows but browsers never start?
    answer: "I'd check the scaler and whether Chrome Jobs are created. Pending Pods point me toward scheduling or image pulls. Running Pods with no registered slots point me toward Grid registration or the capabilities requested by the clients."
sources:
  - label: Official docker-selenium chart installation and autoscaling
    url: https://github.com/SeleniumHQ/docker-selenium/tree/4.54.0-20261124/charts/selenium-grid
  - label: Published Selenium Grid chart versions
    url: https://www.selenium.dev/docker-selenium/index.yaml
  - label: Selenium Grid chart 0.65.1 values
    url: https://raw.githubusercontent.com/SeleniumHQ/docker-selenium/4.54.0-20261124/charts/selenium-grid/values.yaml
  - label: docker-selenium session timeout environment variables
    url: https://github.com/SeleniumHQ/docker-selenium/tree/4.54.0-20261124#grid-url-and-session-timeout
  - label: Selenium Grid queue and node registration
    url: https://www.selenium.dev/documentation/grid/components/
  - label: Selenium Grid queued request and idle session timeouts
    url: https://www.selenium.dev/documentation/grid/configuration/cli_options/
  - label: KEDA Selenium Grid scaler and ScaledJobs
    url: https://keda.sh/docs/2.21/scalers/selenium-grid-scaler/
  - label: Helm install with a values file and chart version
    url: https://helm.sh/docs/helm/helm_install/
  - label: Kubernetes Pod scheduling diagnostics
    url: https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/
examples:
  - title: Scale Chrome nodes from the new session queue
    variants:
      - lang: yaml
        label: Helm values for Selenium Grid (YAML)
        code: |
          global:
            seleniumGrid:
              nodeMaxSessions: 1
              sessionRequestTimeout: 180
          autoscaling:
            enabled: true
            scalingType: job
            scaledOptions:
              minReplicaCount: 0
              maxReplicaCount: 6
          chromeNode:
            enabled: true
            dshmVolumeSizeLimit: 1Gi
            resources:
              requests:
                cpu: "1"
                memory: 2Gi
            extraEnvironmentVariables:
              - name: SE_NODE_SESSION_TIMEOUT
                value: "120"
          firefoxNode:
            enabled: false
          edgeNode:
            enabled: false
---

I'd compare the Chrome requests waiting in Grid with the slots that can actually serve them.
Idle nodes for another browser won't help those requests. With the Selenium Grid Helm chart
I'd let KEDA react to the pending Chrome sessions. I'd start at one slot per node, measure
browser resource use, and keep the scaler's slot count consistent with the node.

I'd watch how long a new Pod takes to schedule and register. The queued request timeout
must leave room for that delay. The idle session timeout frees a slot when its client stops
using it. I'd check that the burst clears and nodes leave after the work drains.

### Example

On a test cluster where the chart can install KEDA, save this as `grid-values.yaml`. After adding the official chart repository, run `helm install qa-grid docker-selenium/selenium-grid --version 0.65.1 -f grid-values.yaml`. These values allow up to six single-session Chrome nodes. Send four concurrent Chrome requests and expect them to get slots within the queue timeout when the cluster has capacity.
