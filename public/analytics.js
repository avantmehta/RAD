// Firebase Analytics — shared by index.html (landing) and app.html (finder).
// Config values below are the Firebase web app's public identifiers, not
// secrets (protected by Firebase's own request validation, same as any
// Firebase web app). Exposes window.logHeartfoodEvent(name, params) so the
// classic (non-module) scripts on both pages can log custom events without
// needing to become ES modules themselves.

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";

const firebaseConfig = {
  projectId: "frndz28",
  appId: "1:763905963119:web:0efbc2cb1def213c42899a",
  storageBucket: "frndz28.firebasestorage.app",
  apiKey: "AIzaSyC20yAAHrABwikxbG2D-h2eaIxRb2IiHV4",
  authDomain: "frndz28.firebaseapp.com",
  messagingSenderId: "763905963119",
  measurementId: "G-XRSLY4ZNWQ",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // auto-logs page_view / session_start / first_visit

window.logHeartfoodEvent = function (name, params) {
  try {
    logEvent(analytics, name, params);
  } catch (err) {
    // Blocked by an ad/tracker blocker, or offline — never let analytics
    // break the actual app.
    console.debug("analytics event skipped:", name, err);
  }
};
