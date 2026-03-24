import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function makeAdmin() {
  const email = 'ekyuregh@gmail.com';
  // We don't know the UID yet if they haven't logged in, 
  // but we can set it by email if we use a query, 
  // or just wait for them to log in and then set it.
  // Actually, I'll just create a document with a known ID or something?
  // No, Firestore users usually use the Auth UID as the document ID.
  
  console.log('Please log in with Google first, then I can set your role to admin.');
  console.log('Alternatively, if you know your UID, I can set it now.');
}

// Since I can't know the UID, I'll modify the server to automatically make this email an admin on first login.
makeAdmin();
