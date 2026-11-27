---
title: "A browser agent says the catalog lost a filter. What evidence would you ask for?"
topic: ai-testing
roles: [automation, sdet, senior]
level: mid
type: concept
oneLine: "I'd ask for steps a tester can repeat with known data. I'd have a tester confirm the report before adding a release check."
looksFor:
  - "Ask which filter and results the agent saw before and after moving to the next page."
  - "Keep the trial to actions that read prepared catalog data in a test environment."
  - "Explain how the agent uses an MCP browser tool's result to choose what to do next."
  - "Ask a tester to reproduce the problem before turning it into a release check."
trap: "Letting an agent approve a release on its own because it said the flow looked fine."
followUps:
  - question: "The agent says the filter disappeared, but its report shows only page two. What would you ask for before expanding the trial?"
    answer: "I'd ask which language and results it saw before clicking Next. I'd repeat that step. I'd track whether reviewers can confirm these reports and how long it takes. I'd also check whether the agent stayed within its allowed actions."
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

I'd ask the agent, a program that chooses its next action, which language it selected. I'd ask how it changed pages and what filter and results it saw afterward. A tester can repeat those steps and decide whether a test is worth adding.

I'd start with actions that only read data in staging, our test environment. I'd use fictional accounts. I'd give the agent more work only after I check what it found and what it got wrong.

The Model Context Protocol (MCP) gives the agent's client a standard way to find and call tools. One browser tool reads an accessibility snapshot, a description of page controls that tools such as screen readers can use. The agent uses that result to decide what to do next. I'd give it only the actions it needs and let the tester deny tool calls.

### Example

A tester reports that the language filter disappears on page two. I'd have the agent try that read-only path on a catalog of prepared book records. I'd ask for steps a tester could repeat. A tester would replay the report. If the tester confirms it, they'd write a test to check that the filter and results stay on the selected language.

The people responsible for the release still decide based on checks they've reviewed.
