---
title: "How would you replace the real email sender in a password reset test?"
topic: framework-design
roles: [automation, sdet]
level: mid
type: concept
oneLine: "I pick the simplest test double, a substitute for something the code normally uses. I choose one that lets me see or control what the test needs."
looksFor:
  - "Use a stub when the test needs a fixed reply."
  - "Use a mock when the test needs to check who calls what."
  - "Tell a spy that records calls apart from a fake that does the job simply."
  - "Keep a separate test that talks to the real service."
trap: "Replacing every service and assuming the test proves that someone can receive a real reset email."
followUps:
  - question: "What would you still check with the real email service?"
    answer: "I'd run a separate test to check which requests the provider accepts. I'd check that it returns errors in the form the app expects."
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

I'd use a stub, a test double with a planned reply, to make the account lookup return an eligible or ineligible account. If my test is about who gets the email, I'd use a mock to check who the code tried to notify. I'd use a spy to record calls while the original code still runs. I'd use a fake for a simpler working version, such as a mailbox I can read from memory.

The names describe what the substitute does. A library for making mocks can make a stub too. If I replace more services, I can make failures easier to control. Those substitutes can stop matching how the real services work. I'd keep a separate integration test, a test that talks to the real provider, when those delivery rules matter.

### Example

I'd have the lookup return an active address and an inactive one. I'd require exactly one send to the active address without calling the real mail provider.
