import { FirebaseOptions, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAJXBht6uUT0xoNa6xv0wbMWn_-_QgDxlk",
  authDomain: "new-practice-6441a.firebaseapp.com",
  databaseURL: "https://new-practice-6441a.firebaseio.com",
  projectId: "new-practice-6441a",
  storageBucket: "new-practice-6441a.appspot.com",
  messagingSenderId: "545387286490",
  appId: "1:545387286490:web:985b4c2344d3b57df0bae3",
  measurementId: "G-66531Y151N",
};

// Initialize Firebase if an app does not already exist. I have no reason to
// believe that it could get reinitialized, or that this check is actually
// necessary, except for [this example](https://github.com/leerob/nextjs-vercel-firebase/blob/4ae57ab9d3ab31ac6cd1a4252741855a71b7b7ee/lib/firebase.js#L3-L11)
// which demonstrates it.
const app = getApps()[0] ?? initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
