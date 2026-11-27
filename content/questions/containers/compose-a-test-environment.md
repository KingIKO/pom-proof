---
title: The vote container started, but ballot submission failed. What result should CI report?
topic: containers
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Use the ballot submission result as the CI verdict, and keep enough output to tell a bad vote from a stack that never became ready.
looksFor:
  - Uses the smoke container's exit status for CI and saves its output before teardown.
  - Distinguishes a rejected ballot from Redis or the app failing its health check.
  - Keeps the ballot on the project's network and addresses the app as `vote`.
  - Leaves traffic during a Kubernetes rollout to a separate staging check.
trap: Adding a fixed sleep before tests and treating a successfully started container as a passing check.
followUps:
  - question: Vote job 185 starts while job 184 is deleting its test volumes. What keeps their ballots separate?
    answer: "Give each run a unique Compose project name with `-p`, leave host ports unpublished, and use only that project's network and data volumes."
sources:
  - label: Docker Compose dependency health checks
    url: https://docs.docker.com/compose/how-tos/startup-order/
  - label: Docker Compose service networking
    url: https://docs.docker.com/compose/how-tos/networking/
  - label: Docker Compose build contexts
    url: https://docs.docker.com/reference/compose-file/build/
  - label: Docker Compose service configuration
    url: https://docs.docker.com/reference/compose-file/services/
  - label: Docker Compose dollar escaping
    url: https://docs.docker.com/reference/compose-file/interpolation/
  - label: Docker Compose project names and file selection
    url: https://docs.docker.com/reference/cli/docker/compose/
  - label: Docker Compose runner exit status
    url: https://docs.docker.com/reference/cli/docker/compose/up/
  - label: Docker Compose teardown and volume removal
    url: https://docs.docker.com/reference/cli/docker/compose/down/
  - label: Docker voting sample application and build
    url: https://github.com/dockersamples/example-voting-app/tree/main/vote
  - label: Redis official image and tags
    url: https://hub.docker.com/_/redis
  - label: Redis PING response
    url: https://redis.io/docs/latest/commands/ping/
  - label: Official curl image tag
    url: https://hub.docker.com/v2/repositories/curlimages/curl/tags/8.23.0
  - label: curl HTTP options
    url: https://curl.se/docs/manpage.html
  - label: Kubernetes Deployment rollouts
    url: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
  - label: POSIX shell substitutions and tests
    url: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html
examples:
  - title: Submit a vote after both health checks pass
    variants:
      - lang: yaml
        label: Docker Compose (YAML)
        code: |
          services:
            redis:
              image: redis:7.4.12-alpine
              healthcheck:
                test: ["CMD-SHELL", 'test "$$(redis-cli ping)" = PONG']
                interval: 2s
                timeout: 2s
                retries: 10
            vote:
              build: ./vote
              depends_on:
                redis:
                  condition: service_healthy
              healthcheck:
                test: ["CMD", "curl", "--fail", "http://127.0.0.1/"]
                interval: 2s
                timeout: 2s
                retries: 10
            smoke:
              image: curlimages/curl:8.23.0
              depends_on:
                vote:
                  condition: service_healthy
              entrypoint: ["curl"]
              command: ["--fail", "--silent", "--show-error", "--data", "vote=a", "http://vote/"]
---

I'd report the smoke container's exit status and keep its output before removing the project.
Seeing `vote` start tells me little about whether it accepted a ballot. If the smoke command
never ran, I'd report a setup failure and check whether Redis answered and the app served HTTP.
The `service_healthy` dependencies keep those startup failures separate from a failed POST.

The test posts to `vote` over its own Compose project's network, with no host port to reserve.
This shows the stack can accept a ballot. I'd test what happens to votes during a Kubernetes
rolling update in staging, where that traffic switch actually happens.

### Example

Save this as `compose.smoke.yaml` at the root of Docker's example voting app. Run `docker compose -p vote-184 -f compose.smoke.yaml up --exit-code-from smoke`. The smoke container posts a vote to the app, which writes it to Redis before replying. Expect exit zero for a successful response. On the disposable stack's cleanup step, use the same project and file with `down --volumes`.
