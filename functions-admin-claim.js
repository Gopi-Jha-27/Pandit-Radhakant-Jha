/*
  Run this trusted Node.js Admin SDK script ONCE from a secure local machine
  after creating the admin user in Firebase Authentication.

  1) npm install firebase-admin
  2) Download a service-account JSON from Firebase Console > Project settings
     > Service accounts. Keep it private; never put it in the app or upload it.
  3) Set GOOGLE_APPLICATION_CREDENTIALS to that JSON file path.
  4) Replace ADMIN_UID with the admin user's Firebase Authentication UID.
  5) Run: node functions-admin-claim.js

  Custom claims are security-sensitive. Only give admin=true to Pandit Ji's account.
*/
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.applicationDefault() });

const ADMIN_UID = "REPLACE_WITH_FIREBASE_AUTH_UID";

async function main() {
  if (ADMIN_UID.startsWith("REPLACE_")) {
    throw new Error("Set ADMIN_UID to the real Firebase Auth UID first.");
  }
  await admin.auth().setCustomUserClaims(ADMIN_UID, { admin: true });
  console.log("Admin claim set. Sign out and sign in again in the app.");
}
main().catch(error => {
  console.error(error);
  process.exit(1);
});
