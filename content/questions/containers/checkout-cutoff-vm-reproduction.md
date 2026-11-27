---
title: The VM closes checkout a day early. What evidence would make you blame its clock settings?
topic: containers
roles: [sdet]
level: senior
type: scenario
oneLine: I replay the same instant on the affected host. I change only the setting that could move it across the cutoff.
looksFor:
  - Find the business cutoff and the clock that controls it.
  - Run the image that already works on the same host to tell image settings apart from host effects.
  - Record differences that could explain the failure and check startup failures separately.
  - Change one setting and keep the instant, account, and target the same.
trap: Running the test on the VM until it passes once and then calling the failure random.
followUps:
  - question: What if the same image also fails on the VM?
    answer: "I'd start by checking resource limits and mount permissions on both hosts. I'd remember that the image cannot make the host kernels or the network paths to the test service the same."
sources:
  - label: Docker containers and virtual machines
    url: https://docs.docker.com/learn/content/what-is-a-container/
  - label: Docker run resources, mounts, and users
    url: https://docs.docker.com/reference/cli/docker/container/run/
  - label: Playwright browser image and version matching
    url: https://playwright.dev/docs/docker
  - label: Playwright headless, locale, and time zone options
    url: https://playwright.dev/docs/test-use-options
---

I'd find the time zone the checkout rule uses and freeze time at the instant where the test fails. On the affected virtual machine (VM), I'd replay that instant in the image that already works. If it passes, I'd inspect the tools that run directly on the VM, since the same host ran both tests.

A pinned image keeps its packaged dependencies at fixed versions. The tools installed separately on the VM and their defaults can change. I'd compare the browser and service clocks and locale before changing one suspect setting.

If the test that runs directly on the VM never reaches checkout, I'd look for a different cause. I'd use the test fixture's account to compare the browser and runtime that actually ran. I'd also check the headless settings, resource pressure, and write permissions.

### Example

My checkout test uses a fixed instant that falls on Monday in UTC and Sunday in Los Angeles. I'd compare the browser and server time zones to see which one the cutoff uses. Suppose the VM's browser uses UTC and the container's browser uses Los Angeles time. I'd rerun the test on the VM after changing only its browser time zone to Los Angeles. If that setting caused the difference, the cutoff should match.
