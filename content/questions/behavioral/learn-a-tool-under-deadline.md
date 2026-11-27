---
title: "Tell me about a time you had to learn a testing tool quickly."
topic: behavioral
roles: [manual-qa, automation, sdet]
level: junior
type: behavioral
oneLine: "I use the tool on one real test case first. I show that someone else can repeat my work."
looksFor:
  - "State the immediate testing problem you were responsible for."
  - "Explain how you chose what to learn first."
  - "Show that someone else used your work or give another measured result."
  - "Explain what you'd change next time."
trap: "Listing tutorials without showing what the team could do as a result."
followUps:
  - question: "How did you check that your test could fail for the reason you expected?"
    answer: "I sent an input I knew was invalid. I checked that the result showed the specific difference I expected."
---

I had four days to test the order endpoint while the team built the browser screen. The endpoint is the service address that accepts orders. I'd never used the team's API client, a tool for sending requests directly to a service. I got a working request from the person who maintained the service. I repeated it in the test environment and changed one input at a time.

I got the service to accept a valid order and reject another without opening the screen. I saved four checks with made-up inputs and wrote a short setup note. A teammate could run them in under ten minutes without my help. I learned more from trying one real request and one known bad input than from trying every feature in the tool.

### Example

I sent a quantity of zero for the rejected case. I checked that the error named the quantity field. I also checked that the service hadn't created an order.
