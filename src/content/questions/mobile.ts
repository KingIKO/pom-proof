import type { Question, Source } from '../types';

const src = (label: string, url: string): Source => ({ label, url });
const AND = 'https://developer.android.com/';

const questions: Question[] = [
  {
    id: 'q-mobile-001',
    topic: 'Mobile',
    roles: ['manual', 'automation', 'sdet'],
    level: 'Junior',
    type: 'Concept',
    question: 'When would you test on emulators and simulators, and when do you need real devices?',
    answer:
      'Emulators and simulators are fast to start, free, and easy to reset, so they suit most functional checks and automated runs on every build. They let me try many OS versions and screen sizes cheaply.\n\nThey do not behave exactly like hardware. Real devices are needed for performance, battery and heat, camera and sensors, push notifications, real network conditions, and manufacturer changes to Android. I would run most automation on emulators and keep a small real-device matrix, based on what our users actually own, for release testing, either in-house or through a device cloud.',
    lookFor: [
      'Explains the speed and cost benefit of emulators',
      'Lists concrete things that need real hardware',
      'Bases the device matrix on user data',
      'Mentions device clouds as an option',
    ],
    mistakes: ['Choosing devices by what the team happens to own'],
    followUps: ['How would you decide which ten devices go in the release matrix?'],
    sources: [
      src('Android Developers: Run apps on the Android Emulator', AND + 'studio/run/emulator'),
      src('Firebase Test Lab documentation', 'https://firebase.google.com/docs/test-lab'),
    ],
  },
  {
    id: 'q-mobile-002',
    topic: 'Mobile',
    roles: ['manual', 'automation', 'sdet'],
    level: 'Mid',
    type: 'Scenario',
    question: 'A user fills in a long form, takes a phone call, and returns to find it empty. How would you test for this class of bug?',
    answer:
      'This is about lifecycle and saved state. I test interruptions such as calls, notifications and switching apps, rotating the device and changing system settings like font size or dark mode, since on Android those configuration changes recreate the activity by default.\n\nThe harder case is process death: the OS can kill a backgrounded app to free memory, and the user expects to return where they left off. On Android I simulate it by backgrounding the app and killing the process with adb, or by using the "Don\'t keep activities" developer option. On iOS I check state restoration after the app is terminated in the background.',
    lookFor: [
      'Names lifecycle and saved state as the area',
      'Covers configuration changes like rotation',
      'Knows the OS can kill backgrounded apps',
      'Knows practical ways to simulate process death',
    ],
    mistakes: ['Testing only by pressing home and immediately reopening the app'],
    followUps: ['What is the difference between what a ViewModel keeps and what saved instance state keeps?'],
    sources: [
      src('Android Developers: Save UI states', AND + 'topic/libraries/architecture/saving-states'),
      src('Android Developers: Handle configuration changes', AND + 'guide/topics/resources/runtime-changes'),
      src('Android Developers: The activity lifecycle', AND + 'guide/components/activities/activity-lifecycle'),
    ],
  },
  {
    id: 'q-mobile-003',
    topic: 'Mobile',
    roles: ['manual', 'automation', 'sdet'],
    level: 'Mid',
    type: 'Scenario',
    question: 'The app asks for camera and location permissions. What would you test?',
    answer:
      'I test each answer the user can give: allow, deny, and the one-time or approximate options newer OS versions offer. The app should ask in context, when the feature is used, and explain why. If the user denies, the feature should degrade gracefully with a way forward, not crash or loop.\n\nI also revoke a permission in system settings while the app is running or backgrounded, and check it recovers. On iOS the system prompt is shown only once, so a denied user must be sent to Settings. I test on several OS versions because permission rules change, such as Android 13 adding a notification permission.',
    lookFor: [
      'Covers allow, deny and partial options',
      'Expects contextual requests and graceful denial handling',
      'Tests revoking permission from settings',
      'Accounts for OS version differences',
    ],
    mistakes: ['Granting all permissions automatically in every test run'],
    followUps: ['How would you reset permission state between automated tests?'],
    sources: [
      src('Android Developers: Permissions on Android', AND + 'guide/topics/permissions/overview'),
      src('Android Developers: Notification runtime permission', AND + 'develop/ui/compose/notifications/notification-permission'),
      src('Apple Developer: Requesting access to protected resources', 'https://developer.apple.com/documentation/uikit/requesting-access-to-protected-resources'),
    ],
  },
  {
    id: 'q-mobile-004',
    topic: 'Mobile',
    roles: ['automation', 'sdet', 'lead'],
    level: 'Senior',
    type: 'Concept',
    question: 'How would you choose between Espresso or XCUITest and a cross-platform tool like Appium for mobile UI automation?',
    answer:
      'Espresso and XCUITest are the platform tools. They run close to the app, sync with the UI thread so tests need fewer waits, and are usually faster and less flaky. The cost is two codebases in Kotlin or Java and Swift, often owned by the app developers.\n\nAppium drives both platforms through a WebDriver-style API in many languages, so one QA team can share helpers and some test logic. It adds a server layer, which tends to be slower. I decide by team skills, how similar the two apps are, and speed needs, and often keep fast native tests near the code with a smaller cross-platform journey suite.',
    lookFor: [
      'Explains native tools\' speed and synchronization advantages',
      'Explains Appium\'s cross-platform and language flexibility',
      'Names trade-offs like speed and maintenance',
      'Bases the choice on team and app context',
    ],
    mistakes: ['Assuming one shared Appium script works unchanged when the two apps have different UIs'],
    followUps: ['Where do these UI tests sit relative to unit and API tests in your mobile strategy?'],
    sources: [
      src('Android Developers: Espresso', AND + 'training/testing/espresso'),
      src('Apple Developer: XCUIAutomation (UI tests)', 'https://developer.apple.com/documentation/xcuiautomation'),
      src('Appium documentation', 'https://appium.io/docs/en/latest/'),
    ],
  },
];

export default questions;
