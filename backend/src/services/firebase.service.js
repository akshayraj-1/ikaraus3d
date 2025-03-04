const admin = require("firebase-admin");
const serviceAccount = require("../configs/firebase-serviceaccount.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "akshay-raj.appspot.com"
});


const firestore = admin.firestore();
const storage = admin.storage();

module.exports = { firestore, storage };