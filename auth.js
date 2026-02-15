/**
 * @file auth.js
 * @description Handles user authentication logic including login, signup, and logout using Firebase Auth.
 * @author Liu GuangXuan from G²KM
 * @copyright Copyright (c) 2026 G²KM
 * @license All Rights Reserved
 * @version 1.0.0
 */

import { auth, db } from "./firebase-config.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutBtn = document.getElementById('logout-btn');

// --- Authentication Flow ---

/**
 * Monitors the authentication state of the user.
 * Redirects to the appropriate page based on login status.
 * @param {object} auth - Firebase Auth instance.
 * @param {function} callback - Callback function triggered on state change.
 */
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log("User is signed in:", user.uid);
        // If we are on the login page, redirect to dashboard
        if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
            window.location.href = 'dashboard.html';
        }
    } else {
        // User is signed out
        console.log("User is signed out");
        // If we are on the dashboard page, redirect to login
        if (window.location.pathname.endsWith('dashboard.html')) {
            window.location.href = 'index.html';
        }
    }
});

// Login
if (loginForm) {
    /**
     * Handles the login form submission.
     * Signs in the user with email and password.
     * @param {Event} e - The submit event.
     */
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm['login-email'].value;
        const password = loginForm['login-password'].value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                console.log("Logged in:", user);
                // Redirect handled by onAuthStateChanged
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert("Login Error: " + errorMessage);
                console.error("Login Error:", errorCode, errorMessage);
            });
    });
}

// Signup
if (signupForm) {
    /**
     * Handles the signup form submission.
     * Creates a new user with email and password and creates a user profile in the database.
     * @param {Event} e - The submit event.
     */
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = signupForm['signup-email'].value;
        const password = signupForm['signup-password'].value;
        const confirmPassword = signupForm['signup-confirm-password'] ? signupForm['signup-confirm-password'].value : null;

        if (confirmPassword && password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                console.log("Signed up:", user);

                // Create user node in Database
                set(ref(db, 'Users/' + user.uid + '/Profile'), {
                    Email: email
                })
                    .then(() => {
                        console.log("User profile created in DB");
                    })
                    .catch((error) => {
                        console.error("Database Error:", error);
                    });

            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert("Signup Error: " + errorMessage);
                console.error("Signup Error:", errorCode, errorMessage);
            });
    });
}

// Logout
if (logoutBtn) {
    /**
     * Handles the logout button click.
     * Signs out the current user and redirects to the login page.
     */
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            console.log("Sign-out successful.");
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error("Sign-out error", error);
        });
    });
}
