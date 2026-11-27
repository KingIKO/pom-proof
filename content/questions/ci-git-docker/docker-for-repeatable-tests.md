---
title: "Which parts of a browser test setup does Docker make repeatable?"
topic: ci-git-docker
roles: [automation, sdet]
level: mid
type: tooling
oneLine: "I fix the test setup at known versions and use it locally and in CI. I keep anything outside that setup visible."
looksFor:
  - "Name the browser, software packages, and image versions."
  - "Describe how the tests and the services they need run together."
  - "Explain how you wait for those services and clean them up."
  - "Explain which parts of the live setup a container cannot reproduce."
trap: "Using an image tag that can change and assuming the container will always run the same way."
followUps:
  - question: "Why measure the time to download the image on its own?"
    answer: "I can speed up the browser tests and still slow down fresh jobs if they spend longer downloading the image."
  - question: "If both jobs use the same image, why might only one be able to save its trace?"
    answer: "The image supplies the files and defaults. Each running container has its own process and settings for which host folders it can see. I'd compare those report folders and check who can write to them."
  - question: "Which checkout problem would you still test on a real phone?"
    answer: "I'd test a payment that hands control to the phone's browser or another app. I'd separately check remote services and the kinds of data customers use, because the browser container can't account for either."
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

I use Docker to run tests in a container, an isolated environment started from an image of files and settings. The image keeps the test runner's system packages and browser versions predictable. For Playwright, I'd match the project package version to the Playwright image. I'd install the exact dependencies the project lists and save the image version with failures.

I use the same setup on my machine and in continuous integration (CI), where jobs run automatically. If the app uses a database, I'd wait for the app and database before starting tests. I'd load data the tests own and remove the temporary services afterward. I plan separate checks for remote services such as sign-in, and for live traffic patterns a container can't control.

### Example

Suppose I use a checkout project that locks Playwright to `1.64.1`. Its setup starts a test storefront and labels quick checks `@smoke`. I give Chromium shared memory for its processes. I keep installed packages in an anonymous volume, a storage area Docker gives a random name. If the checkout check fails, I expect a nonzero exit status and a trace, or record of the run, in the host's `artifacts` folder.
