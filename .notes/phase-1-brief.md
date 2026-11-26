# Phase 1 shared brief (engines and shell)

Repo: C:\Users\Owner\Desktop\_Projects\pom-proof, branch `phase-1`. Phase 0 is merged and live at https://kingiko.github.io/pom-proof/.

## Rules for every Phase 1 agent

- Five agents work in this checkout at the same time. Edit ONLY the files your part owns. If you need a change in a file you do not own, do not make it: put the exact proposed diff in your report.
- Do not commit, push, or change `package.json` / the lockfile. Every dependency is already installed (`npm ls --depth=0`).
- Read before building: `src/lib/contracts.ts`, `src/lib/problem-schema.ts`, `src/content.config.ts`, `src/lib/run-worker.ts`, `src/lib/url.ts`, `src/layouts/Base.astro`, `src/styles/tokens.css`, the seven samples under `content/problems/**`, `src/pages/practice/[kind]/[id].astro`, `tests/**`.
- UI rules (the owner rejects "AI slop" looks): paper background, ink text, one accent for links and the primary button; pass/fail/warn colours only in results; system UI font, `ui-monospace` for code; two font weights; prose max 72ch; 1px borders, radius at most 4px; no shadows except the focus ring; no gradients, blur, emoji, illustrations or icons (status is a text mark); tables and lists, never feature-card grids; motion only a 120 ms fade on results, off under prefers-reduced-motion; sentence case; buttons are verbs ("Run", "Submit", "Show editorial"); no em dashes or exclamation marks in UI copy. Every control keyboard reachable with a visible focus ring. Read C:/Users/Owner/.claude/skills/apple-design/SKILL.md, C:/Users/Owner/.claude/skills/sensible-app-blueprint/SKILL.md and C:/Users/Owner/.claude/skills/app-copy-discipline/SKILL.md (or the same names under C:/Users/Owner/.agents/skills/) before UI work.
- Results must name what was missed: the surviving mutant's `teaches` line, the locator variant that broke, the dataset (visible or hidden) that failed, the vector name that failed, the structured item that was wrong.
- Scores in `GradeResult.score` are 0 to 1 (1 = full marks). The reference answer of every sample must grade to 1 and the decoy below 1.
- Dev server ports: 1A 4401, 1B 4402, 1C 4403, 1D 4404, 1E 4405 (use `npx astro dev --port <n>`). Stop yours when done and confirm the port is free.

## Cross-part contracts (exact signatures; owners build these first)

Owned by 1A, written FIRST so the engines can import them:

- `src/lib/workspace.ts`
  - `useGradeHook<K extends Kind>(problem: Problem<K>, grade: Grader<K>): void` registers `window.__pomproof.grade` for the page (replace the logic in `src/engines/StubWorkspace.tsx`).
  - `recordResult(problemId: string, result: GradeResult): void` writes graded results to the progress store (`src/lib/progress.ts`, implementing `CreateProgressStore` from contracts with `localStorage`).
- `src/components/shell/ResultPanel.tsx`: `export default function ResultPanel(props: { result: GradeResult | null; busy?: boolean; misses?: string[] })`. Shows score as text (for example "3 of 4 checks passed"), a pass or fail mark, the list of misses, and nothing when `result` is null. It owns the 120 ms fade.
- Each engine island keeps the existing prop shape `({ problem })`, calls `useGradeHook`, and calls `recordResult` after a user-initiated submit.

Owned by 1C, written FIRST so 1D can import it:

- `src/components/editor/CodeEditor.tsx`: `export default function CodeEditor(props: { value: string; onChange(value: string): void; language: 'js' | 'ts' | 'python' | 'sql'; label: string; onRun?(): void; minLines?: number })`. CodeMirror 6, Ctrl/Cmd+Enter calls onRun (use `Prec.highest` so basicSetup's binding never wins), theme from CSS tokens, light and dark.

Owned by 1D: `src/lib/problem-schema.ts` and `src/lib/contracts.ts` for this phase. Any other part that needs a schema or contract change proposes it in its report.

## Landing

When all five report, the chief of staff runs `npm run verify`, commits each part, pushes `phase-1`, and opens a PR that the automatic Codex (Astra) review reads. Findings come back to the owning part.
