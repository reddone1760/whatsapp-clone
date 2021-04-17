import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyCunuTkqAHjcD9fMHdHWbYISu0fHWtxWAk",
  authDomain: "whatsapp-clone-d8776.firebaseapp.com",
  projectId: "whatsapp-clone-d8776",
  storageBucket: "whatsapp-clone-d8776.appspot.com",
  messagingSenderId: "1069937106115",
  appId: "1:1069937106115:web:d085e520b82635e8f31676",
};

const app = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

const db = app.firestore();
const auth = app.auth();
const provider = new firebase.auth.GoogleAuthProvider();

export { db, auth, provider };
