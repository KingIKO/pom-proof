---
title: "A request that writes data starts returning HTTP 500. How would you find out why?"
topic: api
roles: [sdet, senior]
level: senior
type: scenario
oneLine: "I'd use the failed request to find the error in the server. Before trying again, I'd check whether it already saved anything."
looksFor:
  - "Record the time, build, and request or trace ID."
  - "Use logs or traces to find which component failed."
  - "Remove sensitive data from test inputs and change only one thing at a time."
  - "Check what the request already did before choosing whether or how to retry."
trap: "Assuming a 500 means nothing was saved and sending the same request again and again."
followUps:
  - question: "What if you only have the reply the client received?"
    answer: "I'd include the request structure with sensitive values removed, the time, the environment, and the ID that links the request to logs. I'd ask the service owner to trace it."
sources:
  - label: "MDN, 500 Internal Server Error"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/500
---

I'd record the time, build, request ID, and what the caller tried to do. I'd follow the ID from where the request entered the system through the service and anything it called. I'd look for the failing operation in the logs or trace, a record of the request's path. I'd check whether the write was committed, meaning the change was saved. Once I have a likely cause, I'd reproduce it with the smallest relevant test case.

I'd turn that case into a regression test, a check that fails if the problem comes back. I'd check the specific result that was wrong or missing.

### Example

If the trace shows the service saved an export job before it failed to format the reply, I'd look up the job by operation ID. I'd check the reply and the job count after the fix. If the reply fails again or a supported retry leaves two jobs, the test should fail.
