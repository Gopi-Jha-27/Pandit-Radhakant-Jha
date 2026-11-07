# Pandit Ji – RadhaKant Jha v2 (Android + Website)

Expo / React Native single codebase. Includes Hindi-English switch, puja services,
WhatsApp enquiries, Firestore booking storage, and a Firebase Authentication
admin dashboard for viewing and updating booking status.

## Requirements
- Node.js LTS
- VS Code
- Expo Go on Android, or Android Studio emulator

## Run
```bash
npm install
npx expo start
```
Website:
```bash
npx expo start --web
```
Android: scan Expo QR using Expo Go, or start an Android emulator and run:
```bash
npx expo start --android
```

## Firebase setup (required for database + admin)
1. Create a Firebase project: https://console.firebase.google.com/
2. Add a Web App in Project Settings and copy its config.
3. Copy `.env.example` to `.env` and fill in the Firebase values.
4. Enable Cloud Firestore.
5. Enable Authentication > Sign-in method > Email/Password.
6. Create Pandit Ji's admin user in Authentication > Users > Add user.
7. Copy the admin user's UID.
8. Publish the rules in `firestore.rules` in Firebase Console > Firestore Database > Rules.
9. Install Firebase Admin SDK in a trusted local folder: `npm install firebase-admin`.
10. Download a service account JSON. Keep it private and never bundle it in the app.
11. Set `GOOGLE_APPLICATION_CREDENTIALS` to that JSON path, put the admin UID into
    `functions-admin-claim.js`, and run `node functions-admin-claim.js`.
12. Sign out and sign back in to the app so Firebase refreshes the admin token.

### Why custom claims?
The Firestore rules require `request.auth.token.admin == true`. Merely knowing an
email address or logging in does not grant admin access. The claim must be set by
the trusted Admin SDK script. Never place service-account credentials in Expo code.

## Booking flow
- Customer submits form.
- Firestore saves the enquiry with status `new`.
- WhatsApp opens with a pre-filled message to +91 7209151803.
- Customer must press Send in WhatsApp; the app cannot send silently.
- Admin signs in from the Admin tab and can view enquiries and update status.

## Build Android app
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
```
Choose APK for direct testing or AAB for Google Play. You will need an Expo account.

## Publish website
```bash
npx expo export --platform web
```
Deploy the generated `dist` folder using Firebase Hosting, Netlify or another static host.

## Before launch
- Verify the public display name and contact number.
- Add verified service areas and real ceremony photos with permission.
- Add a privacy policy and terms before collecting customer information.
- Review Firestore rules and test using a non-admin and admin account.
- Consider App Check, rate limiting / abuse protection, backups, and a data retention policy.
- Do not publish service-account JSON or admin credentials.
- This starter has an admin booking dashboard but does not include payment processing,
  push notifications, or a public customer account system.
