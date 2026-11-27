---
title: "A quick checkout test gets a 503 after rollout. What would you check in Kubernetes?"
topic: containers
roles: [automation, sdet]
level: junior
type: concept
oneLine: "I check which Pods the checkout Service sends requests to. I look for the expected copies of the app and check they're ready to receive traffic."
looksFor:
  - "Explain how a Deployment keeps app copies running and how a Service reaches them."
  - "Tell readiness to receive requests apart from liveness checks that can trigger restarts."
  - "Check Pod status and events before looking for the error in the app logs."
  - "Check the Service selector and its ready endpoints before blaming the test."
trap: "Assuming the Service can use a Pod just because its status says Running."
followUps:
  - question: "Where would you look if a container restarted?"
    answer: "I'd check the Pod's events. I'd run `kubectl logs --previous` on the Pod to read the previous container's logs if they're still available."
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

The Deployment keeps the requested number of checkout Pods and rolls out new versions. A Pod is where the app container runs. The Service gives my tests one address. It uses a selector, a rule that matches Pod labels, to find the Pods it should use. I'd check how many copies are ready and look at Pod events if any are missing.

If a container starts, I'd read its logs. A failed readiness probe, a check that the app can take requests, takes that Pod out of normal Service traffic. The liveness probe checks whether the app needs a restart. When it fails enough times to reach its limit, Kubernetes restarts the container. I'd check that the Service selector still matches the new Pods.

### Example

I'd look for the `checkout-api` Deployment and Service in the `qa` namespace, a named group of resources. I'd expect the Pods to have `app=checkout-api`. If the database is still starting, the new Pods can be running without being ready.

If none of the old Pods are ready either, I'd expect no ready endpoints, the network addresses that can accept Service traffic. I'd look for failed probes in Pod events and confirm the database connection error in the app logs.
