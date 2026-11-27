---
title: Every checkout test edit triggers a fresh dependency install. What would you change in the Dockerfile?
topic: containers
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Keep test edits out of the dependency layer and give the non-root runner a separate place to write reports.
looksFor:
  - Matches the browser image to the suite's Playwright version.
  - Orders dependency installation before frequently edited source files.
  - Runs the tests as a non-root user and keeps environment settings outside the image.
  - Accounts for permissions on the mounted report directory.
trap: Copying the whole checkout before installing packages and baking a staging token into the image.
followUps:
  - question: What if the tests can reach staging but the reporter cannot write its XML?
    answer: "I'd check the runner's effective user and the permissions on the host directory. A bind mount covers the image's directory, so changing permissions in the Dockerfile alone won't fix the mounted directory."
sources:
  - label: Playwright Docker images and version matching
    url: https://playwright.dev/docs/docker
  - label: Playwright Noble image and pwuser
    url: https://raw.githubusercontent.com/microsoft/playwright/v1.64.1/utils/docker/Dockerfile.noble
  - label: Dockerfile instructions
    url: https://docs.docker.com/reference/dockerfile/
  - label: Docker build cache and layer order
    url: https://docs.docker.com/build/cache/optimize/
  - label: npm ci and the lockfile
    url: https://docs.npmjs.com/cli/v11/commands/npm-ci/
  - label: Docker runtime environment variables
    url: https://docs.docker.com/reference/cli/docker/container/run/
  - label: Docker container exit status
    url: https://docs.docker.com/engine/containers/run/#exit-status
  - label: Docker bind mount behavior
    url: https://docs.docker.com/engine/storage/bind-mounts/
  - label: Playwright Test CLI
    url: https://playwright.dev/docs/test-cli
  - label: Playwright JUnit reporter
    url: https://playwright.dev/docs/test-reporters#junit-reporter
examples:
  - title: Build a checkout runner with a separate reports path
    variants:
      - lang: dockerfile
        label: Dockerfile
        code: |
          FROM mcr.microsoft.com/playwright:v1.64.1-noble
          WORKDIR /suite
          COPY package.json package-lock.json ./
          RUN npm ci
          COPY playwright.config.ts ./
          COPY tests/ ./tests/
          USER pwuser
          ENV PLAYWRIGHT_JUNIT_OUTPUT_FILE=/reports/junit.xml
          CMD ["./node_modules/.bin/playwright", "test", "--reporter=junit", "--output=/reports/results"]
---

I'd rebuild after changing just a test assertion and see which layer gets invalidated. The package
install should depend on the manifest and lockfile, so I'd copy those first. I'd copy the config
and specs after `npm ci`, and base the runner on the image that matches the locked Playwright version.

Before shipping the image I'd run it as `pwuser` and check it can write its mounted report. The
target URL belongs in runtime configuration because the same image can test more than one environment.
I'd pass any credentials at runtime too, rather than put them in an image layer.

### Example

The checkout suite locks Playwright `1.64.1`. Its config reads `APP_BASE_URL` and its tests live under `tests/`. CI passes that URL with `--env` and mounts a directory writable by `pwuser` at `/reports`. A green run produces `junit.xml` there. A failed assertion should still write the report and leave CI with a nonzero exit code.
