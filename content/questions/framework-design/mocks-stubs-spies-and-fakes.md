---
title: How would you replace the email sender in a password reset test?
topic: framework-design
roles: [automation, sdet]
level: mid
type: concept
oneLine: Pick the smallest test double that gives you the observation or control the case needs.
looksFor:
  - Uses a stub for a fixed answer.
  - Uses a mock to verify an expected interaction.
  - Differentiates a recording spy from a working fake.
  - Preserves a separate check for the real integration.
trap: Mocking every dependency and taking the result as proof that a real reset email can be delivered.
followUps:
  - question: What would you verify against the real service?
    answer: I'd keep a separate provider integration check for accepted requests and the shape of failures the application relies on.
sources:
  - label: Python mock return values, wraps, and call checks
    url: https://docs.python.org/3/library/unittest.mock.html
  - label: Mockito verification, stubbing, and spies
    url: https://javadoc.io/static/org.mockito/mockito-core/5.21.0/org.mockito/org/mockito/Mockito.html
  - label: JUnit 5 assertions
    url: https://docs.junit.org/5.14.5/writing-tests/assertions.html
examples:
  - title: Verify the reset handler sends only for an eligible account
    variants:
      - lang: python
        label: pytest and unittest.mock (Python)
        code: |
          from unittest.mock import Mock

          def request_reset(directory, mail, address):
              if directory.active(address):
                  mail.send(address, "Reset instructions")

          def test_reset_sends_to_eligible_account_only():
              directory = Mock()
              directory.active.side_effect = [True, False]
              mail = Mock()
              request_reset(directory, mail, "alex@example.test")
              request_reset(directory, mail, "sue@example.test")
              mail.send.assert_called_once_with("alex@example.test", "Reset instructions")
      - lang: java
        label: Mockito and JUnit 5 (Java)
        code: |
          import static org.mockito.Mockito.*;
          import org.junit.jupiter.api.Test;

          class ResetTest {
            interface Directory { boolean active(String address); }
            interface Mail { void send(String address, String subject); }

            void requestReset(Directory directory, Mail mail, String address) {
              if (directory.active(address)) mail.send(address, "Reset instructions");
            }

            @Test
            void sendsOnlyToAnActiveAccount() {
              var directory = mock(Directory.class);
              var mail = mock(Mail.class);
              when(directory.active("alex@example.test")).thenReturn(true);
              requestReset(directory, mail, "alex@example.test");
              requestReset(directory, mail, "sue@example.test");
              verify(mail).send("alex@example.test", "Reset instructions");
              verifyNoMoreInteractions(mail);
            }
          }
---

I'd stub the account lookup when I need a predictable eligible or ineligible answer. If sending the email is the behavior under test, I'd use a mock and verify who was notified. I'd choose a spy when I want to record calls while the original implementation still runs, and a fake when a lightweight working version helps, such as an in-memory mailbox I can query.

The names describe roles. A mock library can also create a stub. Replacing more dependencies makes a failure easier to control, but those substitutes can drift from the real services. I'd keep a separate integration check where the delivery contract matters.

### Example

The lookup returns an active address and an inactive one. The check requires exactly one send to the active address, without an actual mail provider.
