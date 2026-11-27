---
title: Review status checks for export presets
kind: diagnosis
topic: test-code-review
difficulty: medium
minutes: 6
roles: [sdet, senior]
items:
  - id: review
    type: line-marking
    language: python
    prompt: "Mark every line with a problem."
    lines:
      - { id: l01, text: "import requests" }
      - { id: l02, text: "PRESETS = (" }
      - { id: l03, text: "    ('orders', ('id', 'total_cents'))," }
      - { id: l04, text: "    ('refunds', ('id', 'amount_cents'))," }
      - { id: l05, text: "    ('returns', ('id', 'reason'))," }
      - { id: l06, text: ")" }
      - { id: l07, text: "def test_export_presets(api_base, auth_headers):" }
      - { id: l08, text: "    for preset, columns in PRESETS:" }
      - { id: l09, text: "        response = requests.get(" }
      - { id: l10, text: "            f'{api_base}/report-presets/{preset}', headers=auth_headers, timeout=5," }
      - { id: l11, text: "        )" }
      - { id: l12, text: "        assert response.status_code == 200, preset" }
  - id: category
    type: single-choice
    prompt: "Which problem can let the whole check pass even when every returned column list is wrong?"
    choices:
      - { id: base, text: "A pytest fixture supplies the base URL to the test." }
      - { id: combine, text: "The test reports only the first preset that fails." }
      - { id: timeout, text: "The request sets its timeout explicitly." }
      - { id: status, text: "The assertion checks the HTTP status but ignores the expected columns." }
reference:
  review: [l08, l12]
  category: status
decoy:
  review: [l12]
  category: status
---

For each export preset, the endpoint returns JSON with a `columns` field. In CI, the team needs one result for each preset, even when an earlier preset fails. Each result must check both the HTTP status and the exact columns in their order. The `api_base` and `auth_headers` values come from existing fixtures. A fixture is a helper that pytest sets up and passes to the test.
