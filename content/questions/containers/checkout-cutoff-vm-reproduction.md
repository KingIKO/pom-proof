---
title: The VM closes checkout a day early. What evidence would make you blame its clock settings?
topic: containers
roles: [sdet]
level: senior
type: scenario
oneLine: Replay one instant on the affected host and change only the setting that could move it across the cutoff.
looksFor:
  - Starts with the business cutoff and identifies whose clock the decision uses.
  - Uses the known-good image on the same host to separate packaged settings from host effects.
  - Records differences that matter to the symptom and checks startup failures separately.
  - Changes one setting while keeping the instant, account, and target stable.
trap: Retrying on the VM until one run passes, then treating the failure as random.
followUps:
  - question: What if the same image also fails on the VM?
    answer: "I'd compare the two hosts' resource limits and mount permissions first. The image doesn't fix differences in the host kernel or the network path to the test service."
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

I'd establish which time zone the checkout rule uses and freeze the instant at the failing
boundary. On the affected VM I'd replay it in the known-good image. A pass there gives me a
reason to inspect the native setup, since the same host ran both. A pinned image carries its
packaged dependencies, whereas the VM's separately installed tools and defaults can change.
I'd compare the browser and service clocks and locale before changing one suspect setting.

If the native test didn't reach checkout at all, I'd look for a different cause. I'd compare
the actual browser and runtime, headless settings, resource pressure, and write permissions
using the fixture's account.

### Example

A checkout test uses a fixed instant that falls on Monday in UTC and Sunday in Los Angeles. I compare the browser and the server time zones to see which one the cutoff uses. If the VM's browser is in UTC and the container's is set to Los Angeles, I'd rerun the VM with only its browser time zone changed. The cutoff should then match if that setting explains the difference.
