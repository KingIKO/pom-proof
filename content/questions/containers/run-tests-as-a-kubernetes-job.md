---
title: "A failed Kubernetes checkout Job left no useful report. What would you save before cleanup?"
topic: containers
roles: [sdet]
level: mid
type: tooling
oneLine: "I save the first test result and startup evidence outside the temporary namespace before deleting it."
looksFor:
  - "Save the HTTP result and Job status before removing `qa-pr-184`."
  - "Use Pod events and resource requests to explain why a runner didn't start."
  - "Keep the first failure in the report even if you try again."
  - "Tie the runner image to the tested revision and mount the URL and credential separately."
trap: "Trying to copy files with `kubectl cp` after the test container has stopped."
followUps:
  - question: "If the Job already stopped, where could a collector read the screenshots?"
    answer: "I'd write them to a mounted persistent volume claim, a request for storage outside the container. I'd read them with a separate collector in the same namespace after the run. I'd upload them before deleting that temporary namespace."
sources:
  - label: Kubernetes Jobs and failure policy
    url: https://kubernetes.io/docs/concepts/workloads/controllers/job/
  - label: Kubernetes Pod commands, arguments, and mounts
    url: https://kubernetes.io/docs/reference/kubernetes-api/core/pod-v1/
  - label: Kubernetes ConfigMap files
    url: https://kubernetes.io/docs/concepts/configuration/configmap/
  - label: Kubernetes Secret files
    url: https://kubernetes.io/docs/concepts/configuration/secret/#using-secrets-as-files-from-a-pod
  - label: Kubernetes container resource requests
    url: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
  - label: Kubernetes namespaces
    url: https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/
  - label: Kubernetes persistent volume claims
    url: https://kubernetes.io/docs/concepts/storage/persistent-volumes/#claims-as-volumes
  - label: kubectl logs for Jobs
    url: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_logs/
  - label: kubectl namespace option
    url: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_options/
  - label: kubectl copy and its container requirements
    url: https://kubernetes.io/docs/reference/kubectl/generated/kubectl_cp/
  - label: Kubernetes Pod events for startup failures
    url: https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/
  - label: Official curl image tag
    url: https://hub.docker.com/v2/repositories/curlimages/curl/tags/8.23.0
  - label: Official curl image shell entrypoint
    url: https://raw.githubusercontent.com/curl/curl-container/main/etc/entrypoint.sh
  - label: curl config files and output options
    url: https://curl.se/docs/manpage.html
  - label: POSIX shell quoting, substitutions, and command lists
    url: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html
  - label: POSIX shell test and exit status
    url: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/test.html
examples:
  - title: Record the checkout HTTP status and fail unless it is 200
    variants:
      - lang: yaml
        label: Kubernetes manifest (YAML)
        code: |
          apiVersion: batch/v1
          kind: Job
          metadata:
            name: checkout-smoke
            namespace: qa-pr-184
          spec:
            backoffLimit: 0
            template:
              spec:
                restartPolicy: Never
                containers:
                  - name: smoke
                    image: curlimages/curl:8.23.0
                    command: ["/bin/sh", "-c"]
                    args:
                      - |
                        status=$$(curl --silent --show-error --max-time 15 \
                          --config /test-config/target.conf --config /test-auth/token.conf \
                          --output /dev/null --write-out '%{response_code}')
                        rc=$?
                        printf 'checkout status=%s curl_exit=%s\n' "$status" "$rc"
                        test "$rc" -eq 0 && test "$status" = 200
                    resources:
                      requests:
                        cpu: 100m
                        memory: 64Mi
                    volumeMounts:
                      - name: config
                        mountPath: /test-config
                        readOnly: true
                      - name: auth
                        mountPath: /test-auth
                        readOnly: true
                volumes:
                  - name: config
                    configMap:
                      name: checkout-smoke-config
                  - name: auth
                    secret:
                      secretName: checkout-smoke-auth
---

I'd have continuous integration (CI) save the Kubernetes Job status and container logs. A Job runs a task to completion. If my test never starts, I'd save the Pod events too. They help tell scheduling or image problems apart from a failed assertion, a check for an expected result. I'd collect screenshots and larger reports from separate storage because I can't count on reading them from a stopped container.

I'd use `restartPolicy: Never` and `backoffLimit: 0` to keep the first ordinary test failure visible. I can give each pull request its own temporary namespace, a group of resources. My full runner image would carry the tests and the software they need. I'd request CPU and memory and mount settings separately from credentials.

### Example

For one HTTP check, I'd use a curl image. I'd deploy checkout in `qa-pr-184` with an HTTPS certificate the runner trusts. The ConfigMap stores settings, and its `target.conf` sets curl's `url` option. The Secret stores the short-lived credential, and its `token.conf` sets the `header` option.

I'd expect the Job to succeed only on HTTP 200. Before deleting the namespace, I'd save the logs with `kubectl -n qa-pr-184 logs job/checkout-smoke`.
