import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'ai-studio-new');

async function listUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    console.log('Users:');
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
    });
  } catch (error) {
    console.error('Error listing users:', error);
  }
}

listUsers();
