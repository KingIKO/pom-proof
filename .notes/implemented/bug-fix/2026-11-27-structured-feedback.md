# Decision note: Feedback on structured answers

Status: implemented. Graded workspaces label answers in place.

## Problem

Generic pick notes describe even a wrong radio choice as an extra answer. A separate key makes learners match answer text back to the options they picked.

## Decision

The result panel uses the item type to describe what to correct. Answer rows use the reference to show which options are correct, which the learner picked, and where each ordering step belongs. Feedback appears only after grading and clears on retry. The scoring rules stay the same.

## Alternatives considered

Keeping a separate key alongside the row labels repeats the same answers and makes the workspace longer. An empty answer key still needs an explicit “no selections” message.

## Consequences

Marked lines use the normal text color on result tints so syntax colors do not have to meet contrast targets on both feedback backgrounds. Unmarked lines keep their syntax colors.
