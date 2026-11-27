---
title: "Chrome sessions wait even when Selenium Grid looks idle. What would you change in Kubernetes?"
topic: containers
roles: [sdet]
level: senior
type: tooling
oneLine: "I check whether Chrome needs a matching browser slot. I add capacity where requests are actually waiting."
looksFor:
  - "Count slots for the requested browser rather than idle Pods."
  - "Use queue wait, scheduling, and time to register a node to explain slow starts."
  - "Tell the time limit for a waiting request apart from the time limit for an unused session."
  - "Measure CPU, memory, and shared memory for a real session."
trap: "Adding capacity based on CPU alone and leaving requests waiting when there are no spare browser slots."
followUps:
  - question: "If the queue grows but browsers don't start, what would you check?"
    answer: "I'd check the scaler and look for Chrome Jobs. If Pods are pending, I'd check scheduling and image downloads. If Pods are running but have no registered slots, I'd check how Grid registers them and what browsers and settings clients requested."
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

I'd compare the Chrome requests waiting in Selenium Grid with the available slots that can run Chrome. Grid runs browser sessions on machines called nodes. Nodes for other browsers can't help those requests. I'd use the Selenium Grid Helm chart, a package of Kubernetes settings, to let KEDA add nodes when Chrome requests wait. I'd start at one slot per node, measure a session's resource use, and keep the scaler's slot count in sync with the node.

I'd time how long a Pod, the unit that runs a container, takes to get assigned to a machine and register with Grid. The queued request timeout must allow for that delay. The idle session timeout frees a slot when its client stops using the session. I'd check that a burst of requests clears and that extra nodes stop after the work finishes.

### Example

I'd use a test cluster where the chart can install KEDA and save these settings as `grid-values.yaml`. After adding the official chart repository, I'd run `helm install qa-grid docker-selenium/selenium-grid --version 0.65.1 -f grid-values.yaml`. The settings allow up to six Chrome nodes with one session each. I'd send four Chrome requests together and expect slots before the queue timeout if the cluster has capacity.
