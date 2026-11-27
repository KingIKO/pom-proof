---
problem: scenario/mobile-offline-sync
---

## What is going on

Field staff need acknowledged offline edits to survive closing and reopening the app. If dispatch changes the same work order first, the app must keep the local edit available for resolution.

## The answer

1. Ask which pending edits must survive app closure or device restart, and what the sync worker and user should see when a conflict occurs.

   **Why:** An app close and a device restart can carry different promises. The conflict policy tells you what evidence distinguishes a retained edit from a discarded one.

2. Spend eight minutes saving offline, reopening offline, then reconnecting and checking the server copy. Spend seven saving an offline edit against a version dispatch changed and checking that the conflict retains the local value.

   **Why:** The first run catches a queue that exists only while the app is open. The second catches a sync policy that overwrites work when versions diverge.

3. Use manual exploratory testing on the real device.

   **Why:** Device automation is unavailable, and an API test cannot exercise closing the app and reopening it with the device still disconnected.

4. Unit-test the pure sync reducer with different base and dispatch versions.

   **Why:** This isolates the rule that retains a conflicting edit. The device check then establishes whether the edit remains available to the user.

5. Stop rollout if an acknowledged edit disappears after closing and reopening.

   **Why:** The user did what the app said was enough to save, so they may have no record to recover from.

6. Go offline and save a fixture edit, recording the pending value. Close and reopen offline, check the value, reconnect, then verify it after sync in an independent online view.

   **Why:** Reconnecting first can let the server copy hide an empty local queue. The independent view proves remote success without relying on the editing screen's local copy.

## Why the tempting answer fails

Badge placement cannot define conflict recovery. Repeating an edit over a stable connection leaves the conflict untested. API checks skip the real device lifecycle and add unrelated service behavior to the pure reducer test. Reconnecting before reopening loses the offline checkpoint.

## What the interviewer listens for

Clearly distinguish evidence of local durability from evidence of a successful sync.

## Sources

- [ISTQB CTFL syllabus v4.0.1, section 4.4.2, exploratory testing](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
