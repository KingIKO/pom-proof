---
title: "Chromium crashes during warehouse search and saves no trace. What would you check before changing the test?"
topic: containers
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "I check whether the browser crashed or the test found a wrong result. I give the browser room to run and save evidence outside the container."
looksFor:
  - "Use the exit status and browser output to tell a crash from a failed check."
  - "Check that the runner can write reports and that the files survive its removal."
  - "Test whether Chromium is more reliable without a window when it has more shared memory."
  - "Match the exact Playwright package version to the browser image."
trap: "Treating every browser crash as a broken element lookup and giving the test more time."
followUps:
  - question: "If search needs more shared memory but CI requires IPC isolation, what would you try?"
    answer: "Docker can give the container more space at `/dev/shm` with `--shm-size`. Playwright recommends `--ipc=host` for Chromium. That shares the host's IPC namespace, where processes communicate. If the runner needs to keep that separate, I'd try a private mount first."
sources:
  - label: Playwright Docker images and Chromium guidance
    url: https://playwright.dev/docs/docker
  - label: Docker run flags and IPC modes
    url: https://docs.docker.com/reference/cli/docker/container/run/
  - label: Docker container exit status
    url: https://docs.docker.com/engine/containers/run/#exit-status
  - label: Docker bind mounts
    url: https://docs.docker.com/engine/storage/bind-mounts/
  - label: Playwright Test CLI
    url: https://playwright.dev/docs/test-cli
  - label: Playwright JUnit reporter
    url: https://playwright.dev/docs/test-reporters#junit-reporter
  - label: npm ci and the lockfile
    url: https://docs.npmjs.com/cli/v11/commands/npm-ci/
  - label: POSIX shell quoting and command lists
    url: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html
examples:
  - title: Keep JUnit output and failed browser traces
    variants:
      - lang: bash
        label: Docker CLI (Bash)
        code: |
          mkdir -p artifacts &&
          docker run --rm --init --shm-size=1g \
            --mount "type=bind,src=$PWD,dst=/source,readonly" \
            --mount "type=bind,src=$PWD/artifacts,dst=/artifacts" \
            --env PLAYWRIGHT_JUNIT_OUTPUT_FILE=/artifacts/junit.xml \
            --workdir /suite mcr.microsoft.com/playwright:v1.64.1-noble \
            sh -ec 'cp /source/package.json /source/package-lock.json .;
              cp -R /source/tests .;
              npm ci;
              ./node_modules/.bin/playwright test --trace=retain-on-failure \
                --reporter=junit --output=/artifacts/results'
---

I'd inspect the browser's exit status and any logs. If Chromium crashes with several tabs active, I'd check `/dev/shm`, the shared memory area, even in headless mode, which runs without a window. I'd rerun with more shared memory and leave the search check and its time limit alone. I'd make sure continuous integration (CI), the system running the job, publishes any evidence it has after a failure. A writable folder mounted from the host keeps the reports after the container goes away.

I'd match the image tag to the Playwright version in the lockfile, which lists exact package versions. The image includes the browsers and system software. I'd still install the test suite's locked packages.

### Example

On a Linux CI runner, I'd use a trusted warehouse search suite locked to Playwright `1.64.1`. I'd put a self-contained Chromium test under `tests/`. This example leaves out `playwright.config.ts`, so I'd get defaults except for options passed on the command line. I install packages inside the container. If a test assertion fails, I'd expect a nonzero exit and `artifacts/junit.xml` plus a trace under `artifacts/results`.
