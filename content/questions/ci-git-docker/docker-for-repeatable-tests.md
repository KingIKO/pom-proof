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
sources:
  - label: Playwright Docker
    url: https://playwright.dev/docs/docker
  - label: Docker image pinning
    url: https://docs.docker.com/build/building/best-practices/#pin-base-image-versions
---

I use an image to make the test runner's system dependencies and browser binaries predictable. For Playwright, I'd match the project package version to the version in the chosen Playwright image and install the project's locked dependencies. I'd record the image used so a developer can reproduce the environment from a failed run.

If the app needs a database, I'd make the test startup wait until the app and database are ready, load test-owned data, and tear down the temporary services later. A container doesn't control a remote identity service or production traffic. I keep coverage for those differences somewhere explicit.

### Example

For a checkout smoke test I'd start a synthetic storefront and database, use the pinned test image for the runner, and collect failure artifacts outside the temporary services.
