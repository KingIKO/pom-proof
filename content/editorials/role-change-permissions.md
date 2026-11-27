---
problem: scenario/role-change-permissions
---

## What is going on

An admin downgrades an editor. Once the admin receives confirmation of the downgrade, the next save from that existing editor must fail, while reading still works. Permission in one workspace grants no rights in another.

## The answer

1. Confirm the permission matrix, the table of which reads and writes each role may do.

   For other edit operations, ask when the changed permissions take effect in an existing session.

   **Why:** A session is one signed-in period of use. A new viewer session and an open editor session can behave differently. A stale permission is an old right that the system has not removed yet. You need an agreed cutoff to tell a stale permission from a write that was still allowed.

2. Spend seven minutes on downgrading an active editor and five minutes on isolation between workspaces.

   After downgrading the editor, check that the next save is denied and reading still works. Confirm that an editor in one fixture workspace, a prepared test workspace, has no rights in the other.

   **Why:** The downgrade catches stale session permissions. The other check catches a role evaluated without the workspace it belongs to.

3. Use the API to verify that the old session is denied and the document stays unchanged.

   **Why:** A refusal can come after a write. So the persisted, or stored, state is stronger evidence than a message or status alone.

4. Use the API to verify that the deployed service denies a fixture editor from another workspace.

   **Why:** The local role helper, the function that checks a role, could be right on its own. The deployed service could still supply the wrong workspace or reuse a cached, saved copy of an earlier permission.

5. If the first save after the confirmed downgrade changes the stored document, stop the rollout.

   **Why:** An unauthorized change has already persisted. A Save button can linger on screen and still get the documented refusal. Under this release gate, that is a UI follow-up.

6. Check the first save from the original editor session after a confirmed downgrade.

   Make a valid editor save to set the baseline, the stored state you compare against. In the admin session, downgrade the member and wait for confirmation. Try the next save from the original member session. Check that it is denied. Read the stored document separately through an authorized session.

   **Why:** Keeping the same session exposes stale privileges. The baseline shows whether a write happened before the denial.

## Why the tempting answer fails

The selector label cannot establish when permissions take effect. A fresh editor's menu can pass while the old session still writes. The UI alone cannot establish the absence of a stored change. The unit helper cannot prove workspace isolation in deployment. Blocking on a stale button misses the actual stop condition, an unauthorized change that persisted.

## What the interviewer listens for

Bring evidence of the denied request and of its lack of side effect.

## Sources

- [OWASP's authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
