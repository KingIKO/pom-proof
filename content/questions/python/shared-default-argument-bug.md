---
title: Why does a Python cart builder carry one test's product into the next?
topic: python
roles: [automation, sdet]
level: junior
type: concept
oneLine: Replace the mutable default with None and allocate a fresh list inside the helper.
looksFor:
  - Says when Python evaluates a default argument.
  - Traces how mutation from one call becomes input to the next.
  - Shows the None sentinel with an identity check.
  - States whether the builder mutates or copies explicitly supplied input.
trap: Using an empty list as the default and appending to it for each test case.
followUps:
  - question: Why check items is None instead of checking whether items is falsey?
    answer: An explicitly supplied empty list is meaningful input. An identity check distinguishes it from the sentinel.
sources:
  - label: Python default argument values
    url: https://docs.python.org/3/tutorial/controlflow.html#default-argument-values
  - label: Python list constructor
    url: https://docs.python.org/3/library/stdtypes.html#list
examples:
  - title: Keep separate cart orders isolated
    variants:
      - lang: python
        label: Python 3
        code: |
          def build_cart(sku, items=None):
              lines = [] if items is None else list(items)
              lines.append(sku)
              return {"items": lines}


          assert build_cart("PEN") == {"items": ["PEN"]}
          assert build_cart("PAD") == {"items": ["PAD"]}

          starter = ["BAG"]
          assert build_cart("PEN", starter) == {"items": ["BAG", "PEN"]}
          assert starter == ["BAG"]
---

The default expression runs when Python defines the function. With `items=[]` in the signature,
calls that omit `items` receive the same list, so appending a pen in one test can change what a
later test sees.

I'd default `items` to `None` and allocate the list inside the helper. I'd also decide what should
happen if a caller supplies an existing list. For this builder I'd copy it before appending so the
caller can reuse the same starting items in another case.

### Example

I order a pen and a pad in separate calls. Each cart should contain just its own product. Then I
pass a list that already has a bag and check that the helper adds the pen without changing the
original list.
