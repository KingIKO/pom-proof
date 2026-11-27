# Wording round 2 (all question groups)

A re-check found that some titles, follow-ups and looksFor lines still restate a specific external question or follow-up, and some answers still follow an external outline. Cause: the concept notes and "add" lines in the assignment files paraphrase the external answers and follow-ups, so writing from them carries the source structure through.

How to fix this round:
1. Do not reread your assignment file's concept note or "add" text for these items. Work from the topic and from the specifics already in OUR question (its product, names, numbers, constraints).
2. Follow-ups: write the next question a real interviewer would ask about the details of OUR scenario (for example "The refund job retries three times; what does the third failure leave behind?"), not a generic interview follow-up ("Is X ever acceptable?", "When would you skip Y?", "What if a manager wants 100%?", "How do you stop Z from growing?", "Rule or myth?").
3. Titles: start from a concrete artefact or symptom in our scenario and ask for a specific decision or output. Avoid the generic shapes "How would you design/test/structure X from scratch", "What does X miss", "How do you find Y", "How do you wait for Z".
4. looksFor and oneLine: lead with the idea that matters most for OUR scenario, in our order of reasoning; do not list the textbook points in their usual order. A list that is itself the technical answer (join types, status families, JMeter elements, Grid components, load test types, var/let/const and similar) may stay; say so in your report.
5. Keep facts, sources, examples and checks intact. Keep existing file names; new files may be renamed if the title changes (grep for references; none should exist).
6. Run `npx vitest run tests/content`, then report each item with the old and new text.
