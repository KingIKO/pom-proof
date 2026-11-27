---
title: Two phones show the same chat in a different order. How would you pin down what happened?
topic: test-design
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: Compare where Room 2 and Room 4 land after reconnecting, then check what the recipient actually got.
looksFor:
  - States what should determine the order of Room 2 and Room 4.
  - Uses the recipient's chat to check delivery and duplicate messages.
  - Separates the case of being offline from the case of losing an acknowledgment.
  - Keeps group and media checks separate from the direct chat case.
trap: Watching one green status on the sender's phone without checking what the recipient received.
followUps:
  - question: Room 2 appears in both sender histories but is missing from the recipient's chat. What does that establish?
    answer: The sender's views agree, but I have no proof of delivery. I'd check whether the service accepted the message and what delivery status the sender sees before the recipient opens the chat.
---

I'd use Room 2 and Room 4 as labels so I can tell the messages apart on every screen. For this
direct chat, both sender phones should agree on the order after sync. I'd establish whether
the app promises server acceptance order before calling either display wrong.

I'd check that the sender sees delivery while the recipient's chat is still closed. Then I'd
open the recipient's chat, count the copies of Room 2, and check that the sender now sees it
as read. I'd use the same observations when the service accepts a send but the first phone
loses the acknowledgment. Both phones can agree about the order and still show a duplicate.
I'd check muted group chats and the attachment-size limit separately if those are in scope.

### Example

If the rule sorts by server acceptance, I'd send "Room 2" on the first phone offline, then send
"Room 4" from the connected phone. Both message lists should settle on Room 4 followed by Room 2
when the first phone reconnects.
