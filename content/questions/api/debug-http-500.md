---
title: "How would you investigate a new HTTP 500 on a write endpoint?"
topic: api
roles: [sdet, senior]
level: senior
type: scenario
oneLine: "Correlate the failed request with server evidence, find the failing operation, and check whether anything committed before retrying."
looksFor:
  - "Captures timestamp, build, and request or trace ID."
  - "Uses logs or traces to find the failing component."
  - "Uses sanitized fixtures and narrows one variable at a time."
  - "Checks side effects before deciding how to retry."
trap: "Assuming a 500 means the write rolled back and resubmitting repeatedly."
followUps:
  - question: "What if you can see only the client response?"
    answer: "I'd attach the sanitized request shape, timestamp, environment, and correlation ID, then ask the service owner to trace it."
sources:
  - label: "MDN, 500 Internal Server Error"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/500
---

I'd capture the time, build, request ID, and what the caller was trying to do. I'd trace that request from the edge into the service and its dependencies to see where it failed. I'd check whether the write had already committed. Once I have a likely cause, I'd recreate the smallest relevant case using test data and turn it into a regression check with an assertion on the missing or improper outcome.

### Example

If request tracing showed an export job was saved before the acknowledgement failed to serialize, I'd verify the existing job using the operation ID. For the fix I'd check the acknowledgement and the job count. The case should fail if the response errors again or if repeating a supported request leaves two jobs.
