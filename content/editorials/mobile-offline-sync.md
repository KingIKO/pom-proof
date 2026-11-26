---
problem: scenario/mobile-offline-sync
---

Ask which lifecycle interruptions the product supports and what evidence the user should see when another edit conflicts. An ordinary app close and a device restart may have different requirements. In this exercise, an acknowledged edit surviving close and reopen is a firm requirement.

Use eight minutes to save offline, close, and reopen while still disconnected. Observe the pending edit before reconnecting. This checkpoint separates local persistence from a successful sync; reconnecting before opening the app could let an online copy hide an empty local queue. After reconnecting, read the result from an independent online view rather than trusting the editing screen. Use the remaining seven minutes to check that the conflict preserves the local change.

Manual exploratory testing on the real device fits this session because device automation is unavailable. A unit check can cover the version conflict in the pure reducer before the device check proves the edit remains available to the user. The decoy exercises a stable connection a second time and leaves the conflict path uncovered. Lost acknowledged work stops rollout.

See [ISTQB CTFL, exploratory testing](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf). An interviewer wants to know how you tell local durability from remote success.
