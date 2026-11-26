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
    prompt: "Which problem can leave the whole check green when all returned column lists are wrong?"
    choices:
      - { id: base, text: "The base URL is injected by a pytest fixture." }
      - { id: combine, text: "The test reports only the first failed preset." }
      - { id: timeout, text: "The request uses an explicit timeout." }
      - { id: status, text: "The assertion checks HTTP status and ignores the expected columns." }
reference:
  review: [l08, l12]
  category: status
decoy:
  review: [l12]
  category: status
---

The endpoint returns JSON with a `columns` field. The team needs one result per preset in CI, even when an earlier preset fails. Each result must check both HTTP status and the exact ordered columns. `api_base` and `auth_headers` come from existing fixtures.
