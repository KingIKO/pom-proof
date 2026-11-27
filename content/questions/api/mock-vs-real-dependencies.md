---
title: "When would you replace an API dependency with a mock, and when would you call the real service?"
topic: api
roles: [automation, sdet, senior]
level: senior
type: scenario
oneLine: "I'd use a test stand-in to repeat failures on demand. I'd keep focused checks for things only the real service can show."
looksFor:
  - "Choose a stand-in or the real service based on what the test needs to prove."
  - "Use a stand-in for failures that are hard to trigger."
  - "Test the real setup and connection in an approved test environment."
  - "Say how you'd catch an outdated test reply."
trap: "Guessing what the provider returns and treating a passing mock test as proof that the real connection works."
followUps:
  - question: "What if the provider's sandbox fails unpredictably?"
    answer: "I'd run fast tests with predictable results separately. I'd collect evidence when the sandbox fails and tell the release owner if we couldn't check the real connection."
---

I'd mock a dependency by replacing it with a stand-in when I need to choose exactly when it fails or what it returns. I can check how the app reacts the same way each run. I'd keep one focused test of the real service in an approved environment. The mock can't tell me whether the credentials, request routing, and data format work with the provider. If the provider changes what it promises, I'd review our saved test replies.

### Example

I'd use a stub, a stand-in with a fixed reply, to return multiple possible matches for an address. I'd check that the customer can pick the address they meant. Before release, I'd send a known test address to the provider's sandbox. I'd check that our app can read and show the provider's reply.
