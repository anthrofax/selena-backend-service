
const firebaseAdmin = require("firebase-admin");
const serviceAccount = require('../selena-project-443105-f3a5465d1af0.json')

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
  });
const firestore = firebaseAdmin.firestore();

module.exports = firestore;