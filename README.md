# Productivity App

A minimalist productivity app designed to help users focus better, manage tasks efficiently, build habits consistently, and eliminate distractions during deep work sessions.

Built using React Native, Expo, TypeScript, Zustand, and Firebase.

---

# Features

## Pomodoro Focus Timer

- 25-minute focus sessions
- 5-minute break sessions
- Start / Pause / Reset controls
- Auto-switch between focus and break modes
- Attach tasks to focus sessions
- Session history tracking
- Automatic Firestore sync

---

## Task Manager

- Create tasks
- Delete tasks
- Mark tasks complete
- Attach Pomodoro sessions to tasks
- Real-time Firestore synchronization
- Track Pomodoro count per task

---

## Habit Tracker

- Daily habit check-ins
- Streak tracking
- Automatic streak reset logic
- Real-time syncing with Firestore

---

## DND (Do Not Disturb)

- Automatically enables during focus sessions
- Automatically disables after sessions
- Simulated DND behavior for cross-platform support

---

# Tech Stack

## Frontend

- React Native
- Expo
- TypeScript

## State Management

- Zustand

## Backend

- Firebase Authentication
- Cloud Firestore

## Realtime Sync

- Firestore `onSnapshot` listeners

---

# Folder Structure

```bash
productivity-app/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx
│   │   ├── tasks.tsx
│   │   ├── habits.tsx
│   │   └── settings.tsx
│   ├── focus.tsx
│   └── _layout.tsx
│
├── components/
│   ├── Timer/
│   │   ├── TimerDisplay.tsx
│   │   ├── TimerControls.tsx
│   │   └── ProgressRing.tsx
│   ├── Task/
│   │   ├── TaskItem.tsx
│   │   ├── TaskInput.tsx
│   │   └── TaskList.tsx
│   ├── Habit/
│   │   ├── HabitItem.tsx
│   │   └── HabitList.tsx
│   └── common/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Modal.tsx
│
├── store/
│   ├── useTimerStore.ts
│   ├── useTaskStore.ts
│   ├── useHabitStore.ts
│   └── useSettingsStore.ts
│
├── services/
│   ├── timerService.ts
│   ├── dndService.ts
│   ├── firestoreService.ts
│   └── authService.ts
│
├── hooks/
│   ├── useTimer.ts
│   ├── useTasks.ts
│   └── useHabits.ts
│
├── utils/
│   ├── constants.ts
│   ├── time.ts
│   └── helpers.ts
│
├── types/
│   ├── task.ts
│   ├── habit.ts
│   └── session.ts
│
├── config/
│   └── firebase.ts
│
├── assets/
├── app.json
├── package.json
└── tsconfig.json
```

---

# Firebase Setup

## 1. Create Firebase Project

Go to:

```bash
https://console.firebase.google.com
```

Create a new Firebase project.

---

## 2. Enable Authentication

Enable:

- Anonymous Authentication

Authentication → Sign-in Method → Anonymous → Enable

---

## 3. Enable Firestore

Create Firestore Database in production or test mode.

---

## 4. Add Firebase Config

Create:

```bash
config/firebase.ts
```

Example:

```ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);
```

---

# Firestore Data Model

## Users

```bash
users/{userId}
```

---

## Tasks

```bash
users/{userId}/tasks/{taskId}
```

```ts
{
  title: string;
  completed: boolean;
  createdAt: timestamp;
  pomodoroCount: number;
  deadline: timestamp | null;
}
```

---

## Habits

```bash
users/{userId}/habits/{habitId}
```

```ts
{
  name: string;
  streak: number;
  lastCompleted: timestamp;
}
```

---

## Sessions

```bash
users/{userId}/sessions/{sessionId}
```

```ts
{
  taskId: string | null;
  duration: number;
  completed: boolean;
  createdAt: timestamp;
}
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/productivity-app.git
```

---

## Install Dependencies

```bash
npm install
```

---

## Install Expo Dependencies

```bash
npx expo install react-native-reanimated
npx expo install react-native-svg
npx expo install expo-linear-gradient
```

---

## Install Firebase

```bash
npm install firebase
```

---

## Run Project

```bash
npx expo start
```

---

# Core App Behavior

## Focus Sessions

When a focus session starts:

- Timer begins
- DND mode activates
- Session tracking starts

When the session completes:

- Session saved to Firestore
- Task Pomodoro count increments
- DND mode disables
- Break timer starts automatically

---

# Realtime Sync

The app uses Firestore realtime listeners:

```ts
onSnapshot()
```

This ensures:
- instant task updates
- live habit syncing
- automatic UI refreshes
- persistent cloud state

---

# UI Design

The UI is designed around:
- minimalism
- low visual noise
- OLED-friendly dark themes
- clean typography
- distraction-free interaction

---

# Future Improvements

- Push notifications
- Calendar integration
- Focus analytics dashboard
- Cloud sync across devices
- AI productivity assistant
- Widgets and lockscreen support
- Team productivity rooms

---

# License

MIT License