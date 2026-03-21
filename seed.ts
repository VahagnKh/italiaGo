import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const seedData = {
  hotels: [
    {
      title: "Grand Hotel Roma",
      description: "Luxury hotel in the heart of Rome with stunning views of the Colosseum.",
      price: 250,
      location: "Rome",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
      rating: 4.8,
      type: "hotel",
      created_at: new Date().toISOString()
    },
    {
      title: "Venice Canal Suites",
      description: "Elegant suites overlooking the Grand Canal.",
      price: 320,
      location: "Venice",
      image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&q=80&w=800",
      rating: 4.9,
      type: "hotel",
      created_at: new Date().toISOString()
    }
  ],
  restaurants: [
    {
      title: "La Pergola",
      description: "Three-star Michelin restaurant with panoramic views of Rome.",
      price: 150,
      location: "Rome",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
      rating: 4.9,
      type: "restaurant",
      created_at: new Date().toISOString()
    },
    {
      title: "Osteria Francescana",
      description: "World-renowned contemporary Italian cuisine in Modena.",
      price: 200,
      location: "Modena",
      image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800",
      rating: 5.0,
      type: "restaurant",
      created_at: new Date().toISOString()
    }
  ],
  tours: [
    {
      title: "Colosseum & Roman Forum Tour",
      description: "Skip-the-line guided tour of Rome's most iconic ancient sites.",
      price: 55,
      location: "Rome",
      image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800",
      rating: 4.7,
      type: "tour",
      created_at: new Date().toISOString()
    },
    {
      title: "Tuscany Wine Tasting",
      description: "Full-day tour through the rolling hills of Chianti with wine tastings.",
      price: 120,
      location: "Florence",
      image: "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&q=80&w=800",
      rating: 4.9,
      type: "tour",
      created_at: new Date().toISOString()
    }
  ],
  experiences: [
    {
      title: "Pasta Making Class",
      description: "Learn to make authentic Italian pasta from scratch with a local chef.",
      price: 75,
      location: "Florence",
      image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800",
      rating: 4.8,
      type: "experience",
      created_at: new Date().toISOString()
    }
  ],
  rentals: [
    {
      title: "Vespa Primavera Rental",
      description: "Explore the streets of Rome like a local on a classic Vespa.",
      price: 45,
      location: "Rome",
      image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=800",
      rating: 4.6,
      type: "rental",
      created_at: new Date().toISOString()
    }
  ],
  events: [
    {
      title: "Verona Opera Festival",
      description: "Experience world-class opera in the ancient Roman Arena di Verona.",
      price: 85,
      location: "Verona",
      image: "https://images.unsplash.com/photo-1514302240736-b1fee5989461?auto=format&fit=crop&q=80&w=800",
      rating: 4.9,
      type: "event",
      created_at: new Date().toISOString()
    }
  ],
  taxi: [
    {
      title: "Rome Airport Transfer",
      description: "Private luxury transfer from Fiumicino Airport to Rome city center.",
      price: 60,
      location: "Rome",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800",
      rating: 4.7,
      type: "taxi",
      created_at: new Date().toISOString()
    }
  ]
};

async function seed() {
  console.log('Starting seed...');
  for (const [collectionName, items] of Object.entries(seedData)) {
    console.log(`Seeding ${collectionName}...`);
    const colRef = collection(db, collectionName);
    for (const item of items) {
      await addDoc(colRef, item);
    }
  }
  console.log('Seed completed successfully!');
}

seed().catch(console.error);
