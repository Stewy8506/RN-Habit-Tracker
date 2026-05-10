# FOCUS

A minimalist deep-work productivity app designed to help you enter flow state and stay consistent.

Built with React Native + Expo, FOCUS combines a clean OLED-inspired interface with powerful focus session tracking and habit-building features.

---

## Preview

FOCUS is designed around:
- deep work
- distraction-free productivity
- ambient UI aesthetics
- low visual noise
- intentional interaction

The interface is heavily inspired by:
- Nothing OS
- luxury watch interfaces
- modern minimalist productivity systems

---

## Features

### Focus Timer
- Elegant circular focus timer
- Smooth animated progress ring
- Ambient glow effects
- Pomodoro-inspired workflow

### Session Management
- Start / pause / reset sessions
- Skip between focus and break modes
- Configurable session durations

### Productivity Tracking
- Daily focus statistics
- Focus streaks
- Session duration tracking

### Minimalist UI
- OLED-friendly dark interface
- Subtle gradients and typography
- Low-distraction design system
- Smooth animations

---

## Tech Stack

### Frontend
- React Native
- Expo
- TypeScript

### Animation & Graphics
- React Native Reanimated
- React Native SVG
- Expo Linear Gradient

### State Management
- Zustand

---

## Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/focus-app.git
```

Move into the project:

```bash
cd focus-app
```

Install dependencies:

```bash
npm install
```

Install Expo packages:

```bash
npx expo install react-native-svg
npx expo install react-native-reanimated
npx expo install expo-linear-gradient
```

Start the development server:

```bash
npx expo start
```

---

## Project Structure

```bash
components/
  Timer/
    CircularProgressRing.tsx
    TimerControls.tsx
    TimerDisplay.tsx

hooks/
  useTimer.ts

store/
  useTimerStore.ts
  useSettingsStore.ts

services/
  timerService.ts

screens/
  FocusScreen.tsx
```

---

## Design Philosophy

FOCUS is intentionally designed to feel:
- calm
- premium
- restrained
- immersive

The UI avoids:
- excessive color
- unnecessary effects
- clutter
- visual fatigue

Every spacing, animation, and typography choice is optimized to keep attention on the task itself.

---

## Future Plans

- Ambient soundscapes
- Task integration
- Focus analytics
- Calendar sync
- Cross-device sync
- AI-powered productivity insights
- Widgets and lockscreen controls

---

## License

MIT License

---

## Author

Built with focus and intentionality.