---
title: What does Docker make repeatable in a browser test environment?
topic: ci-git-docker
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Pin the test environment and run it the same way locally and in CI while keeping external dependencies visible.
looksFor:
  - Browser, dependency, and image versions
  - The test process and supporting services
  - Readiness and lifecycle of dependencies
  - The difference between a container and production parity
trap: Using a floating image tag and calling the result reproducible because it runs in a container.
followUps:
  - question: Why measure image pull time separately?
    answer: Browser tests can get faster while fresh jobs get slower if they spend more time downloading an image.
  - question: Two jobs use the same image. Why can only one write its trace?
    answer: The image defines the packaged filesystem and defaults. Each running container gets its own process and mount settings. I'd compare the host report directory and the user's write access in each job.
  - question: Which checkout failure would you still try on a real phone?
    answer: I'd try a payment handoff that depends on the phone's browser or another app. The browser container also can't account for remote service behavior or the data shapes seen in production, so I check those separately.
sources:
  - label: Playwright Docker
    url: https://playwright.dev/docs/docker
  - label: Docker image pinning
    url: https://docs.docker.com/build/building/best-practices/#pin-base-image-versions
  - label: Docker images and containers
    url: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/
  - label: Docker run options
    url: https://docs.docker.com/reference/cli/docker/container/run/
  - label: Docker anonymous volumes
    url: https://docs.docker.com/engine/storage/volumes/#named-and-anonymous-volumes
  - label: npm clean install
    url: https://docs.npmjs.com/cli/v11/commands/npm-ci
  - label: Playwright test command options
    url: https://playwright.dev/docs/test-cli
examples:
  - title: Run the same checkout smoke suite locally and in CI
    variants:
      - lang: bash
        label: Docker CLI (Bash)
        code: |
          mkdir -p artifacts
          docker run --rm --init --shm-size=1g \
            --mount "type=bind,source=$PWD,target=/app" \
            --mount type=volume,target=/app/node_modules \
            --mount "type=bind,source=$PWD/artifacts,target=/reports" \
            --workdir /app mcr.microsoft.com/playwright:v1.64.1-noble \
            sh -c 'npm ci && npx playwright test --grep @smoke \
              --output=/reports --trace retain-on-failure'
---

I use an image to make the test runner's system dependencies and browser binaries predictable. For Playwright, I'd match the project package version to the version in the chosen Playwright image and install the project's locked dependencies. I'd record the image used so a developer can reproduce the environment from a failed run.

If the app needs a database, I'd make the test startup wait until the app and database are ready, load test-owned data, and tear down the temporary services later. A container doesn't control a remote identity service or production traffic. I keep coverage for those differences somewhere explicit.

### Example

Assume the checkout project locks Playwright to `1.64.1`, starts its synthetic storefront from its test setup, and tags smoke cases with `@smoke`. I give Chromium shared memory and keep installed dependencies in an anonymous volume. A failed checkout check should exit nonzero and leave its trace in the host's `artifacts` folder.
