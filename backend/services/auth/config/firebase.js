import { initializeApp, cert } from "firebase-admin/app";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

let serviceAccountObj;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccountObj = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT env variable:", error);
  }
}

if (!serviceAccountObj) {
  try {
    serviceAccountObj = require("../serviceAccount.json");
  } catch (error) {
    console.error("Firebase serviceAccount.json is missing and no FIREBASE_SERVICE_ACCOUNT env variable was provided.");
  }
}

if (!serviceAccountObj) {
  throw new Error("Firebase Admin SDK failed to initialize: service account credentials missing.");
}

if (serviceAccountObj.private_key) {
  serviceAccountObj.private_key = serviceAccountObj.private_key.replace(/\\n/g, "\n");
}

export const app = initializeApp({
  credential: cert(serviceAccountObj),
});