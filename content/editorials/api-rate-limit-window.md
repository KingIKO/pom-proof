---
problem: scenario/api-rate-limit-window
---

Ask which operations share a counter, what identifies a tenant, and what reset and retry times mean. Those answers decide exactly when to send each fixture request. Keep the clock fixed while filling the quota; otherwise a reset during setup can make the test miss the boundary.

Spend six minutes on denial and recovery and five on the second tenant while the first is still at quota. A normal request from each tenant before either reaches its limit cannot distinguish a shared counter from independent counters. That is what the decoy overlooks.

Use a fresh fixture tenant, make exactly the allowed writes, and send the next before reset. Check both 429 and unchanged stored records. Only then advance to reset and check a successful write. Use the API for both checks: a unit test can verify the counter key construction but cannot show which key the deployed service uses. A rejected response that still writes data stops rollout.

[MDN's 429 reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429) explains that the header is optional in HTTP generally. This product contract requires it. An interviewer listens for the negative side-effect check as well as the response.
