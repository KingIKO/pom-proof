---
title: Chromium dies during warehouse search and leaves no trace. What would you check before changing the test?
topic: containers
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Keep browser crashes distinct from assertion failures by giving the runner room to work and saving its evidence outside the container.
looksFor:
  - Uses the exit status and browser output to distinguish a process crash from a failed search assertion.
  - Checks whether the report directory is writable and survives removal of the runner.
  - Tests whether headless Chromium runs more reliably with more shared memory.
  - Confirms the locked Playwright version matches the browser image.
trap: Treating every browser crash as a locator failure and increasing the test timeout.
followUps:
  - question: Warehouse search only passes with more shared memory, but CI requires IPC isolation. Which option would you test?
    answer: "Docker can give the container more space at `/dev/shm` with `--shm-size`. Playwright recommends `--ipc=host` for Chromium, but that shares the host IPC namespace. I'd start with a private mount if the runner needs IPC isolation."
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

I'd start with the process exit and any browser logs. A sudden crash with several active tabs
would make me check `/dev/shm`, even in headless mode. I'd rerun with more shared memory and
leave the search assertion and its timeout alone. I'd check that CI publishes whatever evidence
is available on failure. A writable host mount keeps reports after the container is removed.

I'd also match the image tag with the Playwright version in the lockfile. The image supplies
the browsers and system dependencies; the test suite still needs its locked package install.

### Example

On a Linux CI runner, use a trusted warehouse search suite with Playwright `1.64.1` locked and a self-contained Chromium spec under `tests/`. This example doesn't copy `playwright.config.ts`, so Playwright uses defaults except for the options passed on the command line. The package install stays in the container. A failed assertion should give CI a nonzero exit and leave `artifacts/junit.xml` and its trace under `artifacts/results`.
