// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA9XASCiCI1pXBvBvF4E7LaU-9Gkb_gSRw",
  authDomain: "movie-night-matcher-myniani.firebaseapp.com",
  projectId: "movie-night-matcher-myniani",
  storageBucket: "movie-night-matcher-myniani.firebasestorage.app",
  messagingSenderId: "1427034492",
  appId: "1:1427034492:web:72e99e411fb657086b54f9",
  measurementId: "G-2M1TDKSKW9"
};


export const db = getFirestore(app);