# 🔥 Firebase FCM Setup - Complete Guide

## Quick Setup (Automated)

Run this command and follow the prompts:
```bash
npm run setup-firebase
```

## Manual Setup

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Create a project" 
3. Name: "hostelpro-notifications"
4. Click "Create project"

### 2. Enable Cloud Messaging
1. In Firebase Console → Project Settings (gear icon)
2. Click "Cloud Messaging" tab
3. Click "Generate key pair" under Web Push certificates
4. Copy the VAPID key

### 3. Add Web App
1. Project Settings → General tab
2. Click Web icon (</>) 
3. App name: "HostelPro"
4. Copy the config object

### 4. Get Your Config Values
From the Firebase config object, you need:
- `apiKey`
- `authDomain` 
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`
- VAPID key from Cloud Messaging

## Test Your Setup

1. Start the app: `npm start`
2. Open browser console
3. Look for "FCM token" logs
4. Go to Firebase Console → Cloud Messaging
5. Send a test notification

## Android Production Setup

1. Add your domain to Firebase Console → Authentication → Settings → Authorized domains
2. For Capacitor: Add Android app in Firebase Console
3. Download `google-services.json`

## Troubleshooting

- **No token generated**: Check browser permissions for notifications
- **Service worker errors**: Verify firebase-messaging-sw.js config
- **Android not working**: Ensure proper Capacitor setup with google-services.json

Your notification system supports:
✅ Complaint updates
✅ Payment reminders  
✅ Maintenance alerts
✅ Visitor notifications
✅ Emergency alerts
✅ Booking confirmations
✅ General announcements