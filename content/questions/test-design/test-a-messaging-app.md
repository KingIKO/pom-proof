---
title: Two phones show the same messages in different orders. How would you find what happened?
topic: test-design
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: After reconnecting, I'd compare the order of Room 2 and Room 4. I'd check what the recipient actually got.
looksFor:
  - Say what decides the order of Room 2 and Room 4.
  - Check the recipient's chat to see what arrived and whether anything arrived twice.
  - Test being offline separately from losing the server's reply to a send.
  - Keep group chat and attachment checks separate from the direct chat test.
trap: Trusting the green status on one sender phone without checking what arrived.
followUps:
  - question: Both sender phones show Room 2, but the recipient doesn't see it. What can you conclude?
    answer: I know the sender's phones agree. I can't tell whether the recipient got the message. I'd check whether the service accepted it and what status the sender sees before the recipient opens the chat.
---

I'd label the messages Room 2 and Room 4 so I can tell them apart on each screen. In a direct chat, both sender phones should show the same order after updating from the service. Before deciding either display is wrong, I'd confirm whether the app sorts messages by when the server accepts them.

I'd check that the sender sees the delivered status while the recipient's chat is closed. I'd open the recipient's chat and count copies of Room 2. I'd check that the sender then sees it marked as read. I'd repeat those checks if the service accepts the send but the first phone misses the acknowledgment, the reply that confirms acceptance. Both phones can agree on order and still show a duplicate.

If muted group chats and the attachment size limit are in scope, I'd test them separately.

### Example

If the app sorts by server acceptance, I'd send "Room 2" on the first phone while it's offline. I'd then send "Room 4" from the connected phone. Once the first phone reconnects, I'd expect both chats to show Room 4 before Room 2.
