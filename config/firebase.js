const admin = require("firebase-admin");
const serviceAccount = require("./textme-9f9ef-firebase-adminsdk-fbsvc-4b53e5e720.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Add this if you're using Firebase Auth Emulator
  auth:
    process.env.NODE_ENV === "development"
      ? {
          serviceAccountId: serviceAccount.client_email,
        }
      : undefined,
});

module.exports = admin;
