---
title: The invoicing image scan finds an old issue and a new one. Which should stop promotion?
topic: security
roles: [sdet, senior]
level: senior
type: tooling
oneLine: I'd apply the release rules to the results for this image. I'd keep past exceptions visible with their own conditions.
looksFor:
  - Explain why an exception for an older library doesn't cover a new issue.
  - Tie each finding or missing result to the exact image under review.
  - Say what a running test service can show that scanning the image can't, and vice versa.
  - Check source changes for secrets and defects before they reach a build.
trap: Ignoring old issues forever because the first scan reported too many.
followUps:
  - question: What would you record if a serious issue gets a temporary exception?
    answer: I'd write down the finding and the reason for the exception. I'd record who approved it, who owns it, and when it expires. I'd keep it visible and review it again if the affected component changes or becomes exposed in a different way.
sources:
  - label: OWASP DevSecOps guideline
    url: https://owasp.org/projects/devsecops-guideline
  - label: GitHub secret scanning
    url: https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning
  - label: GitHub dependency review configuration and severity threshold
    url: https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/manage-your-dependency-security/configure-dependency-review-action
  - label: GitHub Actions dependency-review v5.0.1 input reference
    url: https://github.com/actions/dependency-review-action/tree/v5.0.1
  - label: GitHub Actions workflow syntax
    url: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
  - label: GitHub Actions checkout
    url: https://github.com/actions/checkout/tree/v7
examples:
  - title: Apply the advisory policy to dependency changes
    variants:
      - lang: yaml
        label: GitHub Actions (YAML)
        code: |
          name: Invoicing dependency review
          on: [pull_request]
          permissions:
            contents: read
          jobs:
            dependency-review:
              runs-on: ubuntu-latest
              steps:
                - uses: actions/checkout@v7
                  with:
                    persist-credentials: false
                - uses: actions/dependency-review-action@v5
                  with:
                    fail-on-severity: high
---

I'd check which image, the packaged copy of the service, the scan covered. I'd compare its findings with the release rules. If the old finding has a current exception specific to that issue, I'd keep its owner and due date. I'd make a separate decision about the new finding.

If the new issue meets the agreed severity limit, I'd stop promotion, which means moving the image to the next stage.

If a scan result is missing, I don't have that evidence about the image.

An image scan can identify the packages we ship. A controlled scan of the running test service can check how it responds. If the release rules call for both, I'd require both. On source changes, I'd check for secrets and run static analysis, which looks for defects without running the code. That gives the author a chance to fix problems before the build.

### Example

I'd use a repository with GitHub dependency review enabled. It checks the dependencies, or packages, that a pull request proposes adding. If a pull request adds a dependency with a known high-severity advisory, I'd expect this job to fail. An advisory is a notice about a security issue. I'd leave an unchanged finding on the separate list of existing issues because the pull request didn't introduce it.
