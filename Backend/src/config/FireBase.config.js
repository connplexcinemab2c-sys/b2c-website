import firebaseAdmin from "firebase-admin";
import accountCredentials from "../../FireBase.js";

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(accountCredentials),
});

export default firebaseAdmin;
