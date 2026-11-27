---
title: "The vote container started, but ballot submission failed. What should CI report?"
topic: containers
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "I use the ballot check to decide if the CI job passed. I save enough output to tell a rejected ballot from services that never became ready."
looksFor:
  - "Use the quick test's exit status and save its output before removing the containers."
  - "Tell a rejected ballot apart from a failed readiness check for Redis or the app."
  - "Keep the ballot on the project's own network and send it to `vote`."
  - "Check voting during a Kubernetes rollout separately in the environment used before release."
trap: "Using a fixed wait and counting a started container as a passing test."
followUps:
  - question: "If vote job 185 starts while job 184 deletes its storage, what keeps the ballots separate?"
    answer: "I'd use `-p` to give each Compose run its own project name. I'd avoid publishing host ports and use only that project's network and storage volumes."
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

I'd report the exit status, the code the quick test returns, in continuous integration (CI), where tests run automatically. I'd keep the output before I remove the project. Seeing `vote` start doesn't show whether it accepted a ballot. If the test command never ran, I'd report a setup failure. I'd check whether Redis answered and the app responded over HTTP.

The `service_healthy` dependencies tell Compose to wait until the services the test needs pass their health checks. They separate services that never became ready from a failed POST, the request that submits the ballot.

I send the ballot to `vote` over the project's own Docker Compose network. I don't need to reserve a port on the host. That checks whether the group of services can accept a ballot. I'd test voting during a Kubernetes rolling update, when traffic moves to new copies of the app, in staging where the traffic switch happens.

### Example

I'd save `compose.smoke.yaml` at the root of Docker's example voting app. I'd run `docker compose -p vote-184 -f compose.smoke.yaml up --exit-code-from smoke`. The test container sends a vote and the app writes it to Redis before replying. For a successful reply, I expect exit zero. I'd use `down --volumes` with the same project and file to remove the temporary setup.
