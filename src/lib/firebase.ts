
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = 
{
"projectId": "inkhub-dpktu",
"appId": "1:1064135809333:web:f37722ce2c8f43172cd47c",
"storageBucket": "inkhub-dpktu.firebasestorage.app",
"apiKey": "AIzaSyBPVbYjz8PBU20UQhgZe_Lu2U28rWS3wWw",
"authDomain": "inkhub-dpktu.firebaseapp.com",
"messagingSenderId": "1064135809333",
"databaseURL": "https://inkhub-dpktu-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
