import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQV7FqEeCD_OusbBWfe9QAFw4PS1bMw-M",
  authDomain: "react-advanced-todo-list.firebaseapp.com",
  projectId: "react-advanced-todo-list",
  storageBucket: "react-advanced-todo-list.firebasestorage.app",
  messagingSenderId: "834711080552",
  appId: "1:834711080552:web:d824e53b6e6cc7586975dd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);