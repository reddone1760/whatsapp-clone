import "../styles/globals.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import Login from "./login";
import Loading from "../components/Loading";
import firebase from "firebase";
import store from "../app/store";
import { Provider } from "react-redux";
import { useEffect } from "react";
import App from "../components/App";

function MyApp({ Component, pageProps }) {
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      db.collection("users").doc(user.uid).set(
        {
          email: user.email,
          lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
          photoUrl: user.photoURL,
          displayName: user.displayName,
        },
        { merge: true }
      );
    }
  }, [user]);

  return (
    <Provider store={store}>
      <App>
        {loading ? (
          <Loading />
        ) : !user ? (
          <Login />
        ) : (
          <Component {...pageProps} />
        )}
      </App>
    </Provider>
  );
}

export default MyApp;
