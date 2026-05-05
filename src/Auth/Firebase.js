// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD3tENFdOYs82tmY05lRdZAAbqN8L9D1FY",
  authDomain: "ai-auronic-project.firebaseapp.com",
  projectId: "ai-auronic-project",
  storageBucket: "ai-auronic-project.firebasestorage.app",
  messagingSenderId: "802509839022",
  appId: "1:802509839022:web:60aa2ab5708d79eacc6b3f",
  measurementId: "G-9Z45V04BQ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);