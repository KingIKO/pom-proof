---
title: A browser agent reports that the catalog forgets a filter. What would you ask it to show?
topic: ai-testing
roles: [automation, sdet, senior]
level: mid
type: concept
oneLine: Ask for a replayable observation from seeded data, then have a tester verify it before adding a release check.
looksFor:
  - Asks for the filter and result state on both sides of the page transition.
  - Limits the pilot to read-only staging actions on seeded catalog data.
  - Explains where an MCP browser observation enters the agent's next decision.
  - Makes a tester reproduce the report before it becomes a release check.
trap: Letting an unattended agent approve a release based on a report that the flow looked fine.
followUps:
  - question: The agent reports the filter disappeared but only shows page two. What would you ask for before widening the pilot?
    answer: >-
      I'd ask for the selected language and results before clicking Next, then replay the
      transition. I'd track whether reviewers can confirm reports like this, how long it takes,
      and whether the agent stayed within its permitted actions.
sources:
  - label: OpenAI Agents SDK, the agent loop (accessed 2026-11-27)
    url: https://openai.github.io/openai-agents-python/running_agents/#the-agent-loop
  - label: MCP specification, tool discovery and user control (accessed 2026-11-27)
    url: https://modelcontextprotocol.io/specification/2025-11-25/server/tools
  - label: Playwright MCP, accessibility snapshots and security limits (accessed 2026-11-27)
    url: https://github.com/microsoft/playwright-mcp
  - label: NIST AI RMF Playbook, oversight and performance monitoring (accessed 2026-11-27)
    url: https://airc.nist.gov/airmf-resources/playbook/manage/
---

I'd ask for the chosen language, the page transition, and the selected filter and results after
that transition. A tester can replay those observations and decide whether they justify a test.
I'd start with read-only staging tasks and fictional accounts, and expand only after reviewing
what the pilot found and what it got wrong.

An agent uses a tool result to choose its next action. Through MCP, its client can discover
and call tools, such as one that reads an accessibility snapshot. I'd give it only the actions
needed for the task and let the tester deny tool calls. A confirmed report can become a draft
test, with release decisions left to reviewed checks and their owners.

### Example

A tester reports that a catalog language filter disappears after going to page two. I'd let the
agent explore that read-only path on seeded books and ask for reproducible steps. A tester would
replay the report and turn a confirmed finding into a test that asserts the filter and results
stay on the selected language.
