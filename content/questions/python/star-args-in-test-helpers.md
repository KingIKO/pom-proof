---
title: How would you pass line items and optional overrides through an order fixture helper?
topic: python
roles: [automation, sdet]
level: junior
type: concept
oneLine: Collect extra positional and keyword arguments with stars, then unpack them when a wrapper forwards the call.
looksFor:
  - Identifies the tuple produced by a starred parameter.
  - Identifies the dictionary produced by a double-starred parameter.
  - Distinguishes collecting parameters from unpacking arguments.
  - Keeps required fields and common options visible in the signature.
trap: Wrapping a helper and forwarding only its positional arguments, which silently drops named overrides.
followUps:
  - question: What happens if two keyword unpackings both pass currency?
    answer: Python raises TypeError for the repeated keyword at the call. Merge the dictionaries first if you want an explicit precedence rule.
sources:
  - label: Python argument lists and unpacking
    url: https://docs.python.org/3/tutorial/controlflow.html#arbitrary-argument-lists
  - label: Python call expressions
    url: https://docs.python.org/3/reference/expressions.html#calls
examples:
  - title: Forward order items and shipping options
    variants:
      - lang: python
        label: Python 3
        code: |
          def build_order(customer, *items, currency="USD", **overrides):
              payload = {"customer": customer, "items": list(items), "currency": currency}
              payload.update(overrides)
              return payload


          def build_guest_order(*args, **kwargs):
              return build_order("guest", *args, **kwargs)


          items = ("notebook", "pen")
          options = {"currency": "CAD", "shipping": "pickup"}
          payload = build_guest_order(*items, **options)
          assert payload == {
              "customer": "guest",
              "items": ["notebook", "pen"],
              "currency": "CAD",
              "shipping": "pickup",
          }
---

I'd keep the customer as an explicit argument. `*items` catches any leftover positional arguments
in a tuple, so callers can pass however many products the case needs. `**overrides` collects any
remaining keyword arguments in a dictionary. I'd give common options such as `currency` a named
parameter so people can see them without reading the helper body.

At the call site the stars go the other way. `*items` passes the individual items as positional
arguments and `**options` passes each dictionary entry as a keyword argument. A wrapper can use both
forms to forward a call without dropping any options.

### Example

The guest order helper fixes the customer value while forwarding two products and a pair of named
options. The resulting payload contains both products, uses CAD, and requests pickup.
