---
title: A failed checkout Job left no usable report. What should CI collect before teardown?
topic: containers
roles: [sdet]
level: mid
type: tooling
oneLine: Preserve the first result and startup evidence outside the disposable namespace before removing it.
looksFor:
  - Preserves the HTTP result and Job status before removing `qa-pr-184`.
  - Uses Pod events and resource requests to explain a runner that never started.
  - Keeps the first failed result visible instead of replacing it with a retry.
  - Ties the runner image to the revision and mounts the URL and credential separately.
trap: Relying on kubectl cp from the test container after it has already stopped.
followUps:
  - question: The checkout Job now takes screenshots and has already exited. Where should the collector read them from?
    answer: "Write them to a mounted persistent volume claim and use a separate collector in the same namespace after the run. Upload the files before deleting the disposable namespace."
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

I'd have CI save the Job status and container logs before deleting its namespace. If the test never
started, I'd save the Pod events too, so a scheduling or image problem doesn't look like a failed
assertion. For screenshots and larger reports I'd collect them from separate storage. A stopped
container isn't a dependable place to fetch them from.

I'd keep the first ordinary test failure visible with `restartPolicy: Never` and `backoffLimit: 0`.
Each pull request can get a disposable namespace. A full runner image would carry the suite and
its dependencies, with CPU and memory requests and separate mounts for configuration and credentials.

### Example

For one HTTP check, the curl image is enough. The checkout service is deployed in `qa-pr-184` with an HTTPS certificate the runner trusts. The ConfigMap's `target.conf` sets curl's `url` option, and the Secret's `token.conf` sets the `header` option for a short-lived credential. The Job succeeds only on HTTP 200. CI saves `kubectl -n qa-pr-184 logs job/checkout-smoke` before removing the namespace.
