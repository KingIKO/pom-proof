---
title: How would you pass order items and optional settings through a Python test helper?
topic: python
roles: [automation, sdet]
level: junior
type: concept
oneLine: I'd collect extra values passed by position or by name. I'd use stars to pass the individual values on to the next function.
looksFor:
  - Say what the tuple holds when a parameter begins with one star.
  - Say what the dictionary holds when a parameter begins with two stars.
  - Explain when stars collect values and when they pass those values on separately.
  - List required values and common options by name in the function's definition.
trap: Passing on values by position only and silently dropping options the caller named.
followUps:
  - question: What happens if I unpack two dictionaries that both supply `currency`?
    answer: I'd get a `TypeError` because the call supplies the same name twice. If I want to choose which value wins, I'd combine the dictionaries first.
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

I'd name the customer in the function's parameter list. I'd use `*items` to collect extra positional arguments, values supplied by order, in a tuple. A tuple is an ordered collection. I'd use `**overrides` to collect extra keyword arguments, values supplied by name, in a dictionary that maps names to values. I'd name common options, such as `currency`, up front so readers can find them without reading the function body.

When I call another function, the stars unpack values instead of collecting them. I'd use `*items` to pass the items one by one in order. I'd use `**options` to pass each dictionary entry by name. A wrapper, a function that calls another function, can use both to pass the values on without losing options.

### Example

I'd set a fixed customer value in a guest order helper. I'd pass through two products and two named options. I'd expect the order data to include both products, use CAD, and ask for pickup.
