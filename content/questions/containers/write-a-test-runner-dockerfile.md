---
title: "Every checkout test edit reinstalls packages. What would you change in the Dockerfile?"
topic: containers
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "I keep test edits from forcing a new package install. I give the runner a writable report folder without running it as root."
looksFor:
  - "Use a browser image that matches the Playwright package version."
  - "Install packages before copying files people edit often."
  - "Run with a regular account and pass environment settings when the container starts."
  - "Check permission to write to the folder mounted for reports."
trap: "Copying every file before installing packages or storing a staging token inside the image."
followUps:
  - question: "What if the tests can reach staging but the reporter can't write its XML file?"
    answer: "I'd check which account runs the tests and whether it can write to the host folder. A bind mount shows that host folder in place of the image's directory. Changing the Dockerfile permissions alone won't change the host folder."
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

I'd change just one test assertion, or expected result, and rebuild to see which image layer Docker rebuilds. A layer is a saved set of changes to the image. I'd copy the package manifest and lockfile first so the install depends on those files. They list the packages and exact versions. I'd copy settings and tests after `npm ci` and use the image that matches the locked Playwright version.

I'd run the container as `pwuser`, an ordinary account, and check that the reporter can write to the mounted folder. The reporter is the part of the runner that writes test results. I'd pass the target URL when the container starts so the same image can test several environments. One example is staging, the setup used before release. I'd pass credentials the same way instead of saving them in an image layer.

### Example

Suppose my checkout tests lock Playwright to `1.64.1`, read `APP_BASE_URL`, and live under `tests/`. My automated job passes the URL with `--env` and mounts a folder at `/reports` that `pwuser` can write to. I'd expect `junit.xml` there after a pass. If an assertion fails, I'd expect the same report and a nonzero exit code.
