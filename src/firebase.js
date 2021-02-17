import firebase from 'firebase';


const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyCcCpfgJ4q1GnYqTWnMO4sef0wUFTldV04",
    authDomain: "instagram-clone62.firebaseapp.com",
    databaseURL: "https://instagram-clone62-default-rtdb.firebaseio.com",
    projectId: "instagram-clone62",
    storageBucket: "instagram-clone62.appspot.com",
    messagingSenderId: "557046559719",
    appId: "1:557046559719:web:b379c7b72a10d97271c342"
});

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage };
