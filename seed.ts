import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore(firebaseConfig.firestoreDatabaseId);

const listings = [
  // Hotels
  ...Array.from({ length: 12 }).map((_, i) => ({
    title: `Luxury Hotel ${i + 1}`,
    description: `Experience the finest stay in Italy at our Luxury Hotel ${i + 1}.`,
    price: 150 + i * 50,
    location: ['Rome', 'Venice', 'Florence', 'Milan'][i % 4],
    image: `https://picsum.photos/seed/hotel${i}/800/600`,
    rating: 4 + Math.random(),
    type: 'hotel',
    created_at: new Date().toISOString()
  })),
  // Restaurants
  ...Array.from({ length: 12 }).map((_, i) => ({
    title: `Gourmet Restaurant ${i + 1}`,
    description: `Authentic Italian cuisine at Gourmet Restaurant ${i + 1}.`,
    price: 40 + i * 10,
    location: ['Rome', 'Naples', 'Bologna', 'Florence'][i % 4],
    image: `https://picsum.photos/seed/rest${i}/800/600`,
    rating: 4 + Math.random(),
    type: 'restaurant',
    created_at: new Date().toISOString()
  })),
  // Tours
  ...Array.from({ length: 12 }).map((_, i) => ({
    title: `City Tour ${i + 1}`,
    description: `Discover the secrets of the city with our expert guides on City Tour ${i + 1}.`,
    price: 30 + i * 5,
    location: ['Rome', 'Venice', 'Florence', 'Pisa'][i % 4],
    image: `https://picsum.photos/seed/tour${i}/800/600`,
    rating: 4 + Math.random(),
    type: 'tour',
    created_at: new Date().toISOString()
  })),
  // Experiences
  ...Array.from({ length: 12 }).map((_, i) => ({
    title: `Unique Experience ${i + 1}`,
    description: `A one-of-a-kind adventure: Unique Experience ${i + 1}.`,
    price: 60 + i * 15,
    location: ['Sardinia', 'Sicily', 'Amalfi', 'Como'][i % 4],
    image: `https://picsum.photos/seed/exp${i}/800/600`,
    rating: 4 + Math.random(),
    type: 'experience',
    created_at: new Date().toISOString()
  })),
  // Rentals
  ...Array.from({ length: 12 }).map((_, i) => ({
    title: `Premium Rental ${i + 1}`,
    description: `High-quality equipment for your trip: Premium Rental ${i + 1}.`,
    price: 20 + i * 5,
    location: ['Rome', 'Milan', 'Turin', 'Genoa'][i % 4],
    image: `https://picsum.photos/seed/rent${i}/800/600`,
    rating: 4 + Math.random(),
    type: 'rental',
    created_at: new Date().toISOString()
  })),
  // Events
  ...Array.from({ length: 12 }).map((_, i) => ({
    title: `Grand Event ${i + 1}`,
    description: `Join the celebration at Grand Event ${i + 1}.`,
    price: 50 + i * 20,
    location: ['Verona', 'Venice', 'Rome', 'Siena'][i % 4],
    image: `https://picsum.photos/seed/event${i}/800/600`,
    rating: 4 + Math.random(),
    type: 'event',
    created_at: new Date().toISOString()
  })),
  // Taxi
  ...Array.from({ length: 12 }).map((_, i) => ({
    title: `Elite Taxi Service ${i + 1}`,
    description: `Reliable and comfortable transport: Elite Taxi Service ${i + 1}.`,
    price: 25 + i * 5,
    location: ['Rome', 'Milan', 'Naples', 'Florence'][i % 4],
    image: `https://picsum.photos/seed/taxi${i}/800/600`,
    rating: 4 + Math.random(),
    type: 'taxi',
    created_at: new Date().toISOString()
  }))
];

async function seed() {
  console.log('Starting seed...');
  
  const listingsCol = db.collection('listings');
  const reviewsCol = db.collection('reviews');

  for (const listing of listings) {
    const docRef = await listingsCol.add(listing);
    console.log(`Added listing: ${listing.title} (${docRef.id})`);

    // Add 3-6 random reviews per item
    const numReviews = Math.floor(Math.random() * 4) + 3;
    for (let j = 0; j < numReviews; j++) {
      await reviewsCol.add({
        user_id: 'demo_user',
        listing_id: docRef.id,
        listing_type: listing.type,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        comment: `This ${listing.type} was amazing! Highly recommended.`,
        created_at: new Date().toISOString()
      });
    }
  }

  console.log('Seed completed successfully!');
}

seed().catch(console.error);
