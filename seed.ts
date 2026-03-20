import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, limit, query, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const categories = ['hotels', 'restaurants', 'experiences', 'tours', 'rentals', 'events', 'taxi'];
const cities = ['Rome', 'Milan', 'Venice', 'Florence', 'Naples', 'Tuscany', 'Amalfi', 'Siena'];

async function seed() {
  console.log('Starting seed...');
  
  for (const category of categories) {
    const colRef = collection(db, category);
    
    // Delete existing items
    const snapshot = await getDocs(colRef);
    console.log(`Deleting ${snapshot.size} items from ${category}...`);
    for (const document of snapshot.docs) {
      await deleteDoc(doc(db, category, document.id));
    }
    
    console.log(`Seeding ${category}...`);
    for (let i = 0; i < 12; i++) {
      const city = cities[Math.floor(Math.random() * cities.length)];
      const rating = (3.5 + Math.random() * 1.5).toFixed(1);
      const stars = Math.floor(Number(rating));
      
      const price = Math.floor(Math.random() * 500) + 50;
      const price_level = price < 150 ? 'low' : price < 350 ? 'medium' : 'high';
      
      const listing = {
        name: `${category.charAt(0).toUpperCase() + category.slice(1, -1)} in ${city} ${i + 1}`,
        description: `Experience the best of Italy with our ${category.slice(0, -1)} service in the heart of ${city}. High quality and authentic experience guaranteed.`,
        location: city,
        city: city,
        price: price,
        price_level: price_level,
        rating: Number(rating),
        stars: stars,
        category: category,
        image: `https://picsum.photos/seed/${category}${i}/800/600`,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(colRef, listing);
      // Update with ID
      await updateDoc(doc(db, category, docRef.id), { id: docRef.id });
      console.log(`Added ${category}: ${listing.name} (${docRef.id})`);
    }
  }

  console.log('Seed completed successfully!');
}

seed().catch(console.error);
