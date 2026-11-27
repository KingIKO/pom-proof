---
problem: scenario/mobile-offline-sync
---

## What is going on

Field staff need acknowledged offline edits to survive closing and reopening the app. An edit is acknowledged when the app tells the user it is saved. If dispatch changes the same work order first, the app must keep the local edit available for resolution.

## The answer

1. Ask how the app should handle saved edits and conflicts.

   Ask which pending edits must survive closing the app or restarting the device. Ask what the sync worker and the user should see when a conflict occurs.

   **Why:** A pending edit is saved on the phone but not yet sent to the server. Closing the app and restarting the device can carry different promises. The conflict policy tells you what evidence separates a kept edit from a discarded one.

2. Spend eight minutes on reopening the app offline and seven minutes on a conflict with dispatch.

   Save and reopen the app while offline. Then reconnect and check the server copy. In the conflict case, save an offline edit over a version that dispatch changed. Check that the conflict keeps the local value.

   **Why:** Reopening offline catches a queue of pending edits that exists only while the app is open. The conflict case catches a sync policy that overwrites work when versions differ.

3. Use manual exploratory testing on the real device, where a person explores and adjusts the test as they learn.

   **Why:** Device automation is unavailable. An API test cannot close the app and reopen it while the device is still disconnected.

4. Unit-test the pure sync reducer, which decides which pending edits to keep, with different base and dispatch versions.

   **Why:** The base version is the copy that the offline edit started from. The reducer is pure, so its output depends only on its inputs. That isolates the rule that keeps a conflicting edit. The device check then establishes whether the edit remains available to the user.

5. If an acknowledged edit disappears after closing and reopening the app, stop the rollout.

   **Why:** The user did what the app said was enough to save. They may have no record to recover from.

6. Follow one fixture edit from the offline save through sync.

   While offline, save the edit and record its pending value. Still offline, close and reopen the app and check the value. Reconnect to let the app sync. After sync, verify the value in an independent online view.

   **Why:** If you reconnected first, the server copy could hide an empty local queue. The independent view proves that the sync reached the server. It does not rely on the editing screen's local copy.

## Why the tempting answer fails

Badge placement cannot define conflict recovery. Repeating an edit over a stable connection leaves the conflict untested. API checks skip the real device lifecycle, such as closing and reopening the app. They also add unrelated service behavior to the pure reducer test. Reconnecting before reopening loses the offline checkpoint, the point that shows the edit survived on the device alone.

## What the interviewer listens for

Clearly separate evidence of local durability, meaning the edit lasts on the device, from evidence of a successful sync.

## Sources

- [ISTQB CTFL syllabus v4.0.1, section 4.4.2, exploratory testing](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
