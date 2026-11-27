---
title: "Hide card digits in a test log"
kind: code
topic: privacy
difficulty: easy
minutes: 10
roles: [automation, sdet]
exportName: redactLogCardField
starters:
  js: |
    export function redactLogCardField(line) {
    }
  ts: |
    export function redactLogCardField(line: string) {
    }
  python: |
    def redact_log_card_field(line):
        pass
vectors:
  - name: single-field
    args: ["case=checkout card=4111111111111111 status=simulated"]
    expected: "case=checkout card=************1111 status=simulated"
  - name: same-field-twice
    args: ["card=4111111111111111 card=5555555555554444"]
    expected: "card=************1111 card=************4444"
  - name: other-label
    args: ["case=4111111111111111 giftcard=4111111111111111"]
    expected: "case=4111111111111111 giftcard=4111111111111111"
  - name: spacing-preserved
    args: ["  card=4111111111111111  ok  "]
    expected: "  card=************1111  ok  "
  - name: length-endpoints
    args: ["card=1234567890123 card=1234567890123456789"]
    expected: "card=*********0123 card=***************6789"
  - name: outside-range
    args: ["card=123456789012 card=12345678901234567890"]
    expected: "card=123456789012 card=12345678901234567890"
  - name: punctuation-and-case
    args: ["card=4111111111111111, CARD=4111111111111111 card=１２３４５６７８９０１２３ notes\tcard=4111111111111111"]
    expected: "card=4111111111111111, CARD=4111111111111111 card=１２３４５６７８９０１２３ notes\tcard=4111111111111111"
  - name: empty-line
    args: [""]
    expected: ""
solutions:
  js: |
    export function redactLogCardField(line) {
      return line.split(' ').map((token) => {
        if (/^card=[0-9]{13,19}$/.test(token) === false) return token;
        return 'card=' + '*'.repeat(token.length - 9) + token.slice(-4);
      }).join(' ');
    }
  ts: |
    export function redactLogCardField(line: string) {
      return line.split(' ').map((token) => {
        if (/^card=[0-9]{13,19}$/.test(token) === false) return token;
        return 'card=' + '*'.repeat(token.length - 9) + token.slice(-4);
      }).join(' ');
    }
  python: |
    def redact_log_card_field(line):
        fields = []
        for token in line.split(" "):
            digits = token[5:]
            if token.startswith("card=") and 13 <= len(digits) <= 19 and all("0" <= char <= "9" for char in digits):
                token = "card=" + "*" * (len(digits) - 4) + digits[-4:]
            fields.append(token)
        return " ".join(fields)
reference:
  language: js
  source: |
    export function redactLogCardField(line) {
      return line.split(' ').map((token) => {
        if (/^card=[0-9]{13,19}$/.test(token) === false) return token;
        return 'card=' + '*'.repeat(token.length - 9) + token.slice(-4);
      }).join(' ');
    }
decoy:
  language: js
  source: |
    export function redactLogCardField(line) {
      return line.split(' ').map((token) => /^card=[0-9]{16}$/.test(token)
        ? 'card=' + '*'.repeat(12) + token.slice(-4)
        : token).join(' ');
    }
---

A payment processor's test log can contain made-up card numbers. A token, or field, is a piece of the line separated by ordinary ASCII spaces. Tabs and punctuation stay inside a token. The input contains no line breaks.

Match every token made up of exactly `card=` followed by 13 to 19 ASCII digits. Match letter case exactly. For each match, leave its last four digits visible. Replace each earlier digit with one asterisk. Leave all other characters, fields, and spacing unchanged.

These rules apply only to this log format. They do not detect payment data in general.

For example, `redactLogCardField("case=checkout card=4111111111111111 status=simulated")` returns `"case=checkout card=************1111 status=simulated"`. Leave the inputs unchanged.
