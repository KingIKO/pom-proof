---
title: Checkout smoke tests get a 503 after a rollout. What would you inspect in Kubernetes?
topic: containers
roles: [automation, sdet]
level: junior
type: concept
oneLine: Follow the checkout Service to the expected Pods and check whether the rollout produced healthy, ready backends.
looksFor:
  - Explains how a Deployment manages replicas and how a Service reaches Pods.
  - Distinguishes readiness to receive traffic from liveness and container restarts.
  - Checks Pod status and events, then reads application logs for the failure.
  - Checks the Service selector and ready endpoints before blaming the test.
trap: Taking a Pod's Running phase as proof that the Service can route requests to it.
followUps:
  - question: Where would you look after a container has restarted?
    answer: "I'd check the Pod's events and use `kubectl logs --previous` on that Pod to read the prior instance's logs, if they're still available."
sources:
  - label: Kubernetes Pods
    url: https://kubernetes.io/docs/concepts/workloads/pods/
  - label: Kubernetes Deployments
    url: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
  - label: Kubernetes Services
    url: https://kubernetes.io/docs/concepts/services-networking/service/
  - label: Kubernetes probe behavior
    url: https://kubernetes.io/docs/concepts/workloads/pods/probes/
  - label: Kubernetes EndpointSlice conditions
    url: https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/#conditions
  - label: Kubernetes troubleshooting for Pods and Services
    url: https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/
  - label: kubectl get reference
    url: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_get/
  - label: kubectl describe reference
    url: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_describe/
  - label: kubectl logs reference
    url: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_logs/
  - label: kubectl namespace option
    url: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_options/
examples:
  - title: Check the rollout, Pods, and Service endpoints
    variants:
      - lang: bash
        label: kubectl (Bash)
        code: |
          kubectl -n qa get deployment checkout-api
          kubectl -n qa get pods -l app=checkout-api
          kubectl -n qa describe pods -l app=checkout-api
          kubectl -n qa logs -l app=checkout-api --all-containers=true --tail=80
          kubectl -n qa get service checkout-api -o yaml
          kubectl -n qa get endpointslices -l kubernetes.io/service-name=checkout-api -o yaml
---

The Deployment keeps the desired number of checkout Pods and rolls out new versions. A Pod is where the app container runs. The Service gives the tests one address and uses its selector to find Pods with matching labels. I'd check the rollout's ready replica count and inspect Pod events if any replicas are missing. If a container starts, I'd read its logs.

Readiness answers whether the app can accept traffic. A failed readiness probe removes the Pod from the ready backends for normal Service traffic. When liveness failures reach the probe's threshold, Kubernetes restarts the app container. I'd also check whether the Service selector still matches the new Pods.

### Example

The `checkout-api` Deployment and Service are in the `qa` namespace, and the Pods should have `app=checkout-api`. If the new Pods are running but readiness fails because their database is still starting, I'd expect no ready endpoints when no older ready Pod remains. I'd look for probe failures in the Pod events and confirm the database connection error in the app logs.
