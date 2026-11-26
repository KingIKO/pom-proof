---
title: Tell me about a time you had more bugs to investigate than time available.
topic: behavioral
roles: [manual-qa, automation, sdet]
level: junior
type: behavioral
oneLine: Sort by customer impact and release urgency, then make the uninvestigated work visible.
looksFor:
  - Your prioritization criteria and specific action
  - A clear handoff for lower-priority issues
  - An outcome with counts and time
  - What you learned from the result
trap: Working through the queue in arrival order and treating every unresolved issue as equally risky.
followUps:
  - question: How did you challenge your first priorities?
    answer: I checked them with the support and release owners, since they knew which customers and deployments were affected.
---

During a two-hour release check I received 11 reports about the settings area. My job was to tell the release owner which ones needed attention that day. I grouped reports by symptoms and checked whether they blocked an account action. That showed four reports came from the same failure to save notification choices.

I reproduced that issue first, attached exact steps, and got a candidate fix while there was still time to retest. I reviewed enough of the remaining reports to give them an owner and a next step. The release owner had one clear issue to resolve instead of 11 unranked messages. I learned to group reports before choosing what to investigate.

### Example

Cosmetic spacing and a failed save both looked recent, but only the failed save left customers with notifications they had tried to turn off.
