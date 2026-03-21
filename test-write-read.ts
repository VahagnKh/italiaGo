import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'ai-studio-test');

async function testRead() {
  try {
    console.log('Reading from hotels...');
    const querySnapshot = await getDocs(collection(db, 'hotels'));
    console.log('Hotels found:', querySnapshot.size);
  } catch (error) {
    console.error('Error in testRead:', error);
  }
}

testRead();
