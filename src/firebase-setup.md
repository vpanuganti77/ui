# Firebase Setup Instructions

## 1. Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Create a project"
3. Name: "hostelpro-demo" (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Cloud Messaging
1. In Firebase Console, go to "Project Settings" (gear icon)
2. Click "Cloud Messaging" tab
3. Generate Web Push certificates
4. Copy the "Server key" and "Sender ID"

## 3. Get Firebase Config
1. In Project Settings, click "General" tab
2. Scroll to "Your apps" section
3. Click "Web" icon (</>) to add web app
4. Register app name: "HostelPro"
5. Copy the config object

## 4. Update Configuration Files

### Update .env file:
Replace the demo values in `.env` with your actual Firebase config:

```
REACT_APP_FIREBASE_API_KEY=your_actual_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_actual_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
REACT_APP_FIREBASE_APP_ID=your_actual_app_id
REACT_APP_FIREBASE_VAPID_KEY=your_vapid_key_from_cloud_messaging
```

### Update firebase-messaging-sw.js:
Replace the demo config in `public/firebase-messaging-sw.js` with your actual config.

## 5. Test Notifications
1. Start your app: `npm start`
2. Open browser console
3. Look for "FCM token" in console logs
4. Use Firebase Console to send test notifications

## 6. For Production Android App
1. Add your domain to authorized domains in Firebase Console
2. Generate Android app in Firebase Console
3. Download google-services.json for Capacitor build