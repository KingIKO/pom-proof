---
title: The invoicing image scan reports an old finding and a new one. Which should stop promotion?
topic: security
roles: [sdet, senior]
level: senior
type: tooling
oneLine: Decide from the policy and evidence for the candidate image, and keep prior exceptions visible on their own terms.
looksFor:
  - Explains why an exception for an older library does not cover a different finding.
  - Links findings and missing results to the exact candidate under review.
  - Distinguishes what can be learned from the live test service and the built image.
  - Keeps checks for secrets and source defects close to the change that introduced them.
trap: Ignoring historical findings permanently because the first scan produced too many alerts.
followUps:
  - question: How would you handle a temporary exception for a severe finding?
    answer: I'd record the finding, reasoning, approver, owner, and expiry. I'd keep it visible and reevaluate it if the affected component or its exposure changes.
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

I'd check which image was scanned and compare the findings with the release policy. If the old
one has a current, specific exception, it keeps its owner and due date. The new finding needs
its own decision. If it meets the agreed blocking severity, I'd hold promotion. A missing scan
result leaves me without evidence about the image.

An image result can identify packages in the shipped artifact, while a controlled scan of the
deployed test service can check how it responds. I need both when the release policy calls for
them. I'd use secret checks and static analysis on source changes so the author can catch those
problems before they become part of a build.

### Example

On a repo with GitHub dependency review enabled, a pull request adding a dependency with a known high-severity advisory should fail this job. An unchanged finding isn't newly introduced by that pull request and stays in the separate backlog.
