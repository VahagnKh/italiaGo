import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function seedAdmin() {
  const email = 'admin@italiago.com';
  const password = 'password123'; // Default password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const userRef = doc(collection(db, 'users'));
  const user = {
    id: userRef.id,
    email,
    password: hashedPassword,
    name: 'Admin User',
    role: 'admin',
    wallet_balance: 1000,
    bonus: 0,
    status: 'Normal',
    created_at: new Date().toISOString()
  };
  
  await setDoc(userRef, user);
  console.log('Admin user seeded successfully!');
}

seedAdmin().catch(console.error);
