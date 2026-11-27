---
problem: scenario/role-change-permissions
---

## What is going on

Once an admin receives confirmation of the downgrade, the existing editor's next save must fail while reading still works. Permission in one workspace grants no rights in another.

## The answer

1. Confirm the permission matrix for reads and writes and when changed permissions apply to other edit operations in an existing session.

   **Why:** A new viewer session and an open editor session can behave differently. You need an agreed cutoff to tell a stale permission from a write that was still allowed.

2. Spend seven minutes downgrading an active editor, checking denial on the next save, and confirming reading still works. Spend five checking that an editor in one fixture workspace has no rights in the other.

   **Why:** The downgrade catches stale session permissions. The workspace check catches a role evaluated without the workspace it belongs to.

3. Use the API to verify the old session is denied and the document stays unchanged.

   **Why:** A refusal can come after a write, so persisted state is stronger evidence than a message or status alone.

4. Use the API to verify the deployed service denies a fixture editor from another workspace.

   **Why:** The local role helper could be right even if the deployed service supplies the wrong workspace or caches an earlier permission.

5. Stop rollout if the first save after the confirmed downgrade changes the stored document.

   **Why:** An unauthorized change has already persisted. A lingering Save button with a documented refusal is a UI follow-up under this release gate.

6. Establish the baseline with a valid editor save, downgrade the member in the admin session and await confirmation, then try the original member session's next save. Check denial and read the stored document independently through an authorized session.

   **Why:** Keeping the same session exposes stale privileges. The baseline makes a write-before-denial visible.

## Why the tempting answer fails

The selector label cannot establish permission timing. A fresh editor's menu can pass while the old session still writes. The UI alone cannot establish the absence of a stored change, and the unit helper cannot prove workspace isolation in deployment. Blocking on a stale button misses the actual stop condition: a persisted unauthorized change.

## What the interviewer listens for

Bring evidence of the denied request and its lack of side effect.

## Sources

- [OWASP's authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
