---
problem: scenario/role-change-permissions
---

Start with the permission matrix and the timing of role changes. A newly signed-in viewer and an existing editor session are different test states. The exercise gives an exact point for the changed permissions to take effect: the admin receives confirmation.

Spend seven minutes on the active-session downgrade and five on the workspace split. On a fixture document, use the editor's successful save to record a baseline. Confirm the downgrade in the admin session, then attempt the next save in the same member session. Check denial and read the persisted document from an authorized test session. A denied response without a state check would miss a service that wrote the value before answering.

Use the API for both enforcement checks. A local role helper can pass even if the deployed service uses the wrong workspace or caches the old permission. A lingering Save button with a useful refusal is a UI follow-up under this exercise's gate. A stored change after the downgrade blocks rollout. The decoy's fresh-session check can pass while stale authorization keeps the existing session able to write.

An interviewer wants evidence of both the denied operation and the lack of a side effect. See [OWASP's authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).
