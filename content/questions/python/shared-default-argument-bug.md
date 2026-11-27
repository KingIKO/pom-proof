---
title: Why does a Python cart helper put a product from one test into another test's cart?
topic: python
roles: [automation, sdet]
level: junior
type: concept
oneLine: I'd use `None` as the default. If the caller leaves out the list, I'd make a fresh one inside the helper.
looksFor:
  - Say when Python computes a default argument value.
  - Explain how a change made by one call shows up in the next.
  - Show how to check whether the caller's value is `None`.
  - Say whether the helper changes or copies a list the caller supplies.
trap: Using an empty list as the default and adding each test's items to that same list.
followUps:
  - question: Why check `items is None` rather than use a test that also treats an empty list as false?
    answer: I'd treat an empty list as input the caller chose. The identity check tells me if `items` is `None` itself, the marker I use for missing input.
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

Python computes the default value when it defines the function. If I declare `items=[]` in the function's parameter list, every call that leaves out `items` gets the same list. If I add a pen in one test, a later test may see it.

I'd set the default for `items` to `None`, a special value I use here to mark missing input. If I get `None`, I'd create a new list inside the helper. If the caller gives me a list, I'd copy it before adding anything. The caller can then reuse the original list in another test.

### Example

I'd order a pen and a pad in separate calls. I'd expect each cart to contain only its own product. Then I'd pass a list that already has a bag. I'd check that my helper adds the pen to the cart without changing the original list.
