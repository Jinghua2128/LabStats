/**
 * @file firebase-config.js
 * @description Configuration file for Firebase initialization. 
 *              Exports the initialized Firebase app, authentication, and database instances.
 * @author Liu GuangXuan from G²KM
 * @copyright Copyright (c) 2026 G²KM
 * @license All Rights Reserved
 * @version 1.0.0
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA2ySShSFOcXsdZiMN8MoB2Cq5OKxB59xU",
  authDomain: "labrats-ee791.firebaseapp.com",
  databaseURL: "https://labrats-ee791-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "labrats-ee791",
  storageBucket: "labrats-ee791.firebasestorage.app",
  messagingSenderId: "296967416158",
  appId: "1:296967416158:web:e15bc6dc27f287321d07cf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db };
