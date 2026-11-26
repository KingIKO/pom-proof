---
problem: code/sliding-window-request-decisions
---

Maintain one queue per client. The entries are accepted timestamps in order, and the head points to the oldest timestamp still under consideration. Advance the head while an entry is at or before the expiry boundary. The unexpired queue length determines whether the next request is accepted. Append its time only when it is accepted.

The shortcut records every arrival. It agrees with the rules up to the first rejection, but that rejected arrival can then make another request wait longer. For a limit of one and a ten-millisecond window, accept at time zero, reject at nine, and accept again at ten. That trace distinguishes the two interpretations.

In an interview, explain why moving the head never loses a timestamp you will need later. The input times never move backward, so expiration is permanent. Each accepted entry is passed at most once, which keeps the total work linear. This array-and-head implementation retains older entries in memory. A production version that needs bounded live history could use a queue that discards them.

[Related reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
