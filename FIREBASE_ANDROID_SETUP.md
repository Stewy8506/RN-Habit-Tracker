# Firebase Android Setup

This Expo app runs on Android, but it uses the Firebase JavaScript SDK for Auth
and Firestore. That means the runtime config in `.env.local` still uses the
Firebase app config fields: `apiKey`, `authDomain`, `projectId`,
`storageBucket`, `messagingSenderId`, and `appId`.

## 1. Create Firebase Project

Open Firebase Console and create a project.

## 2. Register The Android App

In Project settings, add an Android app with this package name:

```text
com.dasan.productivityapp
```

Firebase may offer a `google-services.json` download. You do not need it for
the current Expo managed app because this project is using the Firebase JS SDK,
not the native Android Firebase SDK.

## 3. Add A Web App Config For Expo Runtime

In the same Firebase project, also add a Web app and copy its config values into
a local `.env.local` file:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_web_app_id
```

This does not make the product a web app. It is just how the Firebase JS SDK is
configured inside an Expo Android app.

## 4. Enable Anonymous Auth

Go to Authentication > Sign-in method and enable Anonymous.

## 5. Create Firestore

Go to Firestore Database and create a database.

Use production mode, then publish the rules from `firestore.rules`.

## 6. Run On Android

Restart Expo after creating `.env.local`:

```bash
npx expo start -c --android
```

The app will store data at:

```text
users/{userId}
users/{userId}/tasks/{taskId}
users/{userId}/habits/{habitId}
users/{userId}/sessions/{sessionId}
```
