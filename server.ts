import express from "express";
import http from "http";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import bcrypt from "bcryptjs";
import helmet from "helmet";
import cors from "cors";
import Stripe from "stripe";
import admin from "firebase-admin";

import { initializeApp, getApps } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  limit, 
  orderBy, 
  addDoc, 
  writeBatch,
  deleteDoc,
  Timestamp
} from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock");

// Initialize Firebase Client SDK
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });
  const games = new Map<string, { players: WebSocket[], board: (string|null)[], turn: number }>();
  const adminClients = new Set<WebSocket>();

  const notifyAdmins = async (type: string, message: string, details?: any) => {
    const notification = {
      type,
      message,
      created_at: new Date().toISOString(),
      read: 0
    };
    
    try {
      const docRef = doc(collection(firestore, 'notifications'));
      await setDoc(docRef, { id: docRef.id, ...notification });
      
      const wsMessage = JSON.stringify({ type: 'notification', notification: { id: docRef.id, ...notification }, details });
      adminClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(wsMessage);
        }
      });
    } catch (e) {
      console.error("Failed to create notification:", e);
    }
  };

  wss.on('connection', (ws) => {
    let roomId: string | null = null;
    let isAdmin = false;

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth') {
          if (message.role === 'admin') {
            isAdmin = true;
            adminClients.add(ws);
            ws.send(JSON.stringify({ type: 'auth_success', message: 'Connected as admin' }));
          }
        }

        if (message.type === 'join') {
          roomId = message.roomId;
          if (!games.has(roomId!)) {
            games.set(roomId!, { players: [ws], board: Array(9).fill(null), turn: 0 });
            ws.send(JSON.stringify({ type: 'waiting' }));
          } else {
            const game = games.get(roomId!)!;
            if (game.players.length < 2) {
              game.players.push(ws);
              game.players[0].send(JSON.stringify({ type: 'start', symbol: 'X', turn: true }));
              game.players[1].send(JSON.stringify({ type: 'start', symbol: 'O', turn: false }));
            } else {
              ws.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
            }
          }
        }
        if (message.type === 'move') {
          const game = games.get(roomId!)!;
          if (!game) return;
          const playerIndex = game.players.indexOf(ws);
          if (playerIndex === game.turn && game.board[message.index] === null) {
            game.board[message.index] = playerIndex === 0 ? 'X' : 'O';
            game.turn = 1 - game.turn;
            game.players.forEach((p, idx) => {
              p.send(JSON.stringify({ type: 'update', board: game.board, turn: idx === game.turn }));
            });
            const winPatterns = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
            for (const pattern of winPatterns) {
              const [a, b, c] = pattern;
              if (game.board[a] && game.board[a] === game.board[b] && game.board[a] === game.board[c]) {
                game.players.forEach((p, idx) => p.send(JSON.stringify({ type: 'gameOver', winner: idx === playerIndex ? 'you' : 'opponent' })));
                games.delete(roomId!);
                return;
              }
            }
            if (!game.board.includes(null)) {
              game.players.forEach(p => p.send(JSON.stringify({ type: 'gameOver', winner: 'draw' })));
              games.delete(roomId!);
            }
          }
        }
      } catch (e) { console.error(e); }
    });
    ws.on('close', () => {
      if (isAdmin) {
        adminClients.delete(ws);
      }
      if (roomId && games.has(roomId)) {
        const game = games.get(roomId)!;
        game.players.forEach(p => { if (p !== ws) p.send(JSON.stringify({ type: 'opponentLeft' })); });
        games.delete(roomId);
      }
    });
  });

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(express.json());
  
  // Authentication Middleware using Firebase Admin
  const authenticateToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Fetch user data from Firestore to get the role
      const userDoc = await getDoc(doc(firestore, 'users', decodedToken.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      
      req.user = {
        id: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || userData?.name,
        role: (decodedToken.email === 'ekyuregh@gmail.com' && decodedToken.email_verified) ? 'admin' : (userData?.role || 'user')
      };
      next();
    } catch (err: any) {
      console.error(`Auth failed: Invalid token for ${req.path}`, err.message);
      return res.status(403).json({ error: "Invalid token" });
    }
  };

  const isAdminMiddleware = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') {
      console.warn(`Admin access denied for user ${req.user?.id} (${req.user?.role}) at ${req.path}`);
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  };

  // Activity Tracking Middleware
  app.use(async (req: any, res, next) => {
    const user = req.user;
    if (user && req.method !== 'GET' && !req.path.startsWith('/api/admin')) {
      try {
        const logRef = doc(collection(firestore, 'activity_logs'));
        await setDoc(logRef, {
          id: logRef.id,
          user_id: user.id,
          action: req.method,
          page: req.path,
          details: JSON.stringify(req.body),
          ip: req.ip,
          user_agent: req.get('user-agent'),
          created_at: new Date().toISOString()
        });
      } catch (e) {
        console.error("Activity Log Error:", e);
      }
    }
    next();
  });

// seedData removed

// Seed Admin Route - FOR DEVELOPMENT ONLY
  app.post("/api/admin/seed", async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: "Missing fields" });
    
    try {
      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });
      
      // Create user in Firestore
      const userRef = doc(firestore, 'users', userRecord.uid);
      await setDoc(userRef, {
        id: userRecord.uid,
        email,
        name,
        role: 'admin',
        wallet_balance: 1000,
        bonus: 0,
        status: 'Normal',
        created_at: new Date().toISOString()
      });
      
      res.json({ message: "Admin seeded successfully", uid: userRecord.uid });
    } catch (error: any) {
      console.error("Seed Admin Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Authentication Routes - Handled by Firebase Auth on frontend
  // Backend only verifies ID tokens via authenticateToken middleware
  
  app.get("/api/users/me", authenticateToken, async (req: any, res) => {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', req.user.id));
      if (!userDoc.exists()) return res.status(404).json({ error: "User not found" });
      const { password: _, ...user } = userDoc.data() as any;
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/user", authenticateToken, async (req: any, res) => {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', req.user.id));
      if (!userDoc.exists()) return res.status(404).json({ error: "User not found" });
      const { password: _, ...user } = userDoc.data() as any;
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Firestore Listings Fetcher
  const fetchListings = async (collectionName: string, type: string) => {
    try {
      const snapshot = await getDocs(collection(firestore, collectionName));
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Fetch reviews for each item to calculate average rating
      const listingsWithRatings = await Promise.all(items.map(async (item: any) => {
        const q = query(
          collection(firestore, 'reviews'),
          where('listing_id', '==', item.id),
          where('listing_type', '==', type)
        );
        const reviewsSnapshot = await getDocs(q);
        
        const reviews = reviewsSnapshot.docs.map(doc => doc.data());
        const avgRating = reviews.length > 0 
          ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length 
          : (item.rating || 0);
          
        return { 
          ...item, 
          type, 
          name: item.title,
          stars: Math.round(avgRating) || 4,
          rating: avgRating, 
          reviews_count: reviews.length || item.reviews_count || 0
        };
      }));
      
      return listingsWithRatings;
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      return [];
    }
  };

  app.get("/api/tours", async (req, res) => res.json(await fetchListings('tours', 'tour')));
  app.get("/api/restaurants", async (req, res) => res.json(await fetchListings('restaurants', 'restaurant')));
  app.get("/api/hotels", async (req, res) => res.json(await fetchListings('hotels', 'hotel')));
  app.get("/api/taxi", async (req, res) => res.json(await fetchListings('taxi', 'taxi')));
  app.get("/api/experiences", async (req, res) => res.json(await fetchListings('experiences', 'experience')));
  app.get("/api/rentals", async (req, res) => res.json(await fetchListings('rentals', 'rental')));
  app.get("/api/events", async (req, res) => res.json(await fetchListings('events', 'event')));

  app.get("/api/listings/:id", async (req, res) => {
    const { id } = req.params;
    const collections = ['hotels', 'restaurants', 'experiences', 'tours', 'rentals', 'events', 'taxi'];
    
    try {
      for (const col of collections) {
        const docRef = doc(firestore, col, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Fetch reviews
          const q = query(
            collection(firestore, 'reviews'),
            where('listing_id', '==', id)
          );
          const reviewsSnapshot = await getDocs(q);
          const reviews = reviewsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          
          return res.json({ id: docSnap.id, ...data, reviews, category: col });
        }
      }
      res.status(404).json({ error: "Listing not found" });
    } catch (error) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/admin/seed-data", authenticateToken, isAdminMiddleware, async (req, res) => {
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

    try {
      for (const [collectionName, items] of Object.entries(seedData)) {
        const colRef = collection(firestore, collectionName);
        for (const item of items) {
          await addDoc(colRef, item);
        }
      }
      res.json({ message: "Seed completed successfully!" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/listings", async (req, res) => {
    try {
      const [tours, restaurants, hotels, taxi, experiences, rentals, events] = await Promise.all([
        fetchListings('tours', 'tour'),
        fetchListings('restaurants', 'restaurant'),
        fetchListings('hotels', 'hotel'),
        fetchListings('taxi', 'taxi'),
        fetchListings('experiences', 'experience'),
        fetchListings('rentals', 'rental'),
        fetchListings('events', 'event')
      ]);
      res.json([...tours, ...restaurants, ...hotels, ...taxi, ...experiences, ...rentals, ...events]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  app.post("/api/reviews", authenticateToken, async (req: any, res) => {
    const { listing_id, itemId, listing_type, type, rating, comment } = req.body;
    const finalId = listing_id || itemId;
    const finalType = listing_type || type;
    try {
      const reviewRef = doc(collection(firestore, 'reviews'));
      const newReview = {
        id: reviewRef.id,
        user_id: req.user.id,
        listing_id: finalId,
        listing_type: finalType,
        rating,
        comment,
        username: req.user.name || 'Anonymous',
        user_name: req.user.name || 'Anonymous',
        created_at: new Date().toISOString()
      };
      await setDoc(reviewRef, newReview);
      res.json(newReview);
    } catch (e: any) {
      console.error("Review Post Error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/reviews/:itemId", async (req, res) => {
    const { type } = req.query;
    try {
      const q = query(
        collection(firestore, 'reviews'),
        where('listing_id', '==', req.params.itemId),
        where('listing_type', '==', type),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => doc.data());
      res.json(reviews);
    } catch (e: any) {
      console.error("Review Fetch Error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/bookings", authenticateToken, async (req: any, res) => {
    const { listing_id, itemId, listing_type, type, date, guests, amount } = req.body;
    const finalId = listing_id || itemId;
    const finalType = listing_type || type;
    try {
      const bookingRef = doc(collection(firestore, 'bookings'));
      const newBooking = {
        id: bookingRef.id,
        user_id: req.user.id,
        listing_id: finalId,
        listing_type: finalType,
        date: date || new Date().toISOString(),
        guests: guests || 1,
        amount,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      await setDoc(bookingRef, newBooking);
      res.json(newBooking);
    } catch (e: any) {
      console.error("Booking Post Error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Admin Panel
  app.get("/api/admin/stats", authenticateToken, isAdminMiddleware, async (req, res) => {
    try {
      const usersSnapshot = await getDocs(collection(firestore, 'users'));
      const bookingsSnapshot = await getDocs(collection(firestore, 'bookings'));
      const q = query(collection(firestore, 'bookings'), where('status', '==', 'confirmed'));
      const confirmedBookings = await getDocs(q);
      
      const users = usersSnapshot.size;
      const bookings = bookingsSnapshot.size;
      const revenue = confirmedBookings.docs.reduce((acc, doc) => acc + ((doc.data() as any).amount || 0), 0);
      
      res.json({ users, bookings, revenue });
    } catch (error) {
      console.error("Admin Stats Fetch Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/admin/notifications", authenticateToken, isAdminMiddleware, async (req, res) => {
    try {
      const q = query(collection(firestore, 'notifications'), orderBy('created_at', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(notifications);
    } catch (error) {
      console.error("Admin Notifications Fetch Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/admin/notifications/read", authenticateToken, isAdminMiddleware, async (req, res) => {
    try {
      const q = query(collection(firestore, 'notifications'), where('read', '==', 0));
      const snapshot = await getDocs(q);
      const batch = writeBatch(firestore);
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: 1 });
      });
      await batch.commit();
      res.json({ success: true });
    } catch (error) {
      console.error("Admin Notifications Read Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/admin/bookings", authenticateToken, isAdminMiddleware, async (req, res) => {
    try {
      const q = query(collection(firestore, 'bookings'), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      const bookings = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
        const booking = docSnapshot.data() as any;
        const userDoc = await getDoc(doc(firestore, 'users', booking.user_id));
        const userData = (userDoc.exists() ? userDoc.data() : {}) as any;
        return {
          ...booking,
          user_name: userData.name || 'Unknown',
          user_email: userData.email || 'Unknown'
        };
      }));
      res.json(bookings);
    } catch (error) {
      console.error("Admin Bookings Fetch Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/admin/listings", authenticateToken, isAdminMiddleware, async (req, res) => {
    try {
      const collectionsList = ['tours', 'restaurants', 'hotels', 'taxi', 'experiences', 'rentals', 'events'];
      const results = await Promise.all(collectionsList.map(async (col) => {
        const snapshot = await getDocs(collection(firestore, col));
        return snapshot.docs.map(doc => ({ ...doc.data(), type: col.slice(0, -1) }));
      }));
      res.json(results.flat());
    } catch (error) {
      console.error("Admin Listings Fetch Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Learning Platform Routes
  app.get("/api/courses", async (req, res) => {
    try {
      const snapshot = await getDocs(collection(firestore, 'courses'));
      const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const courseDoc = await getDoc(doc(firestore, 'courses', req.params.id));
      if (!courseDoc.exists()) return res.status(404).json({ error: "Course not found" });
      
      const q = query(collection(firestore, 'courses', req.params.id, 'lessons'), orderBy('order_index', 'asc'));
      const lessonsSnapshot = await getDocs(q);
      const lessons = lessonsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      res.json({ id: courseDoc.id, ...courseDoc.data(), lessons });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch course details" });
    }
  });

  app.get("/api/user/progress", authenticateToken, async (req: any, res) => {
    try {
      const q = query(collection(firestore, 'user_progress'), where('user_id', '==', req.user.id));
      const snapshot = await getDocs(q);
      const progress = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(progress);
    } catch (error) {
      console.error("Progress Fetch Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Messages
  app.get("/api/messages", authenticateToken, async (req: any, res) => {
    try {
      const qReceived = query(collection(firestore, 'messages'), where('receiver_id', '==', req.user.id), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(qReceived);
      
      const qSent = query(collection(firestore, 'messages'), where('sender_id', '==', req.user.id), orderBy('created_at', 'desc'));
      const sentSnapshot = await getDocs(qSent);
        
      const messages = [...snapshot.docs, ...sentSnapshot.docs]
        .map(doc => ({ id: doc.id, ...doc.data() as any }))
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", authenticateToken, async (req: any, res) => {
    const { receiverId, content } = req.body;
    try {
      const messageRef = doc(collection(firestore, 'messages'));
      await setDoc(messageRef, {
        id: messageRef.id,
        sender_id: req.user.id,
        receiver_id: receiverId,
        content,
        created_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Admin Panel Extended
  app.get("/api/admin/users", authenticateToken, isAdminMiddleware, async (req, res) => {
    try {
      const snapshot = await getDocs(collection(firestore, 'users'));
      const users = snapshot.docs.map(doc => {
        const data = doc.data();
        const { password: _, ...user } = data as any;
        return user;
      });
      res.json(users);
    } catch (error) {
      console.error("Admin Users Fetch Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/admin/users", authenticateToken, isAdminMiddleware, async (req, res) => {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: "Missing fields" });
    
    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });
      
      const userRef = doc(firestore, 'users', userRecord.uid);
      await setDoc(userRef, {
        id: userRecord.uid,
        email,
        name,
        role: role || 'user',
        wallet_balance: 0,
        bonus: 0,
        status: 'Normal',
        created_at: new Date().toISOString()
      });
      
      await logAdminAction((req as any).user.uid, (req as any).user.name, 'CREATE_USER', userRecord.uid, { email, role });
      
      res.json({ message: "User created successfully", uid: userRecord.uid });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/users/:id/status", authenticateToken, isAdminMiddleware, async (req, res) => {
    const { disabled } = req.body;
    try {
      await updateDoc(doc(firestore, 'users', req.params.id), { disabled: disabled ? 1 : 0 });
      await logAdminAction((req as any).user.uid, (req as any).user.name || 'Admin', 'update_user_status', req.params.id, { disabled });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

  app.post("/api/admin/users/:id/role", authenticateToken, isAdminMiddleware, async (req, res) => {
    const { role } = req.body;
    try {
      await updateDoc(doc(firestore, 'users', req.params.id), { role });
      await logAdminAction((req as any).user.uid, (req as any).user.name || 'Admin', 'update_user_role', req.params.id, { role });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  app.post("/api/admin/listings", authenticateToken, isAdminMiddleware, async (req, res) => {
    const { id, type, name, title, location, price, stars, rating, description, image, category, price_level } = req.body;
    const tableMap: any = { tour: 'tours', restaurant: 'restaurants', hotel: 'hotels', taxi: 'taxi', experience: 'experiences', rental: 'rentals', event: 'events' };
    const collectionName = tableMap[type];
    if (!collectionName) return res.status(400).json({ error: "Invalid type" });

    const finalTitle = title || name;
    const finalRating = rating || stars || 5;
    const data = {
      title: finalTitle,
      location,
      city: location,
      price: Number(price),
      rating: Number(finalRating),
      stars: Math.round(Number(finalRating)),
      description,
      image,
      category,
      price_level,
      updatedAt: new Date().toISOString()
    };

    try {
      if (id) {
        await updateDoc(doc(firestore, collectionName, id), data);
        await logAdminAction((req as any).user.uid, (req as any).user.name || 'Admin', 'update_listing', id, { type });
      } else {
        const docRef = doc(collection(firestore, collectionName));
        await setDoc(docRef, { id: docRef.id, ...data, createdAt: new Date().toISOString() });
        await logAdminAction((req as any).user.uid, (req as any).user.name || 'Admin', 'create_listing', docRef.id, { type });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save listing" });
    }
  });

  app.get("/api/admin/logs", authenticateToken, isAdminMiddleware, async (req, res) => {
    try {
      const q = query(collection(firestore, 'activity_logs'), orderBy('created_at', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      
      const logs = await Promise.all(snapshot.docs.map(async (logDoc) => {
        const log = logDoc.data() as any;
        const userDoc = await getDoc(doc(firestore, 'users', log.user_id));
        const userData = (userDoc.exists() ? userDoc.data() : {}) as any;
        return {
          ...log,
          user_name: userData.name || 'Unknown',
          user_email: userData.email || 'Unknown'
        };
      }));
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  const logAdminAction = async (adminId: string, adminName: string, action: string, target: string, details: any = {}) => {
    try {
      await addDoc(collection(firestore, 'admin_logs'), {
        admin_id: adminId,
        admin_name: adminName,
        action,
        target,
        details,
        created_at: new Date().toISOString()
      });
    } catch (e) { console.error("Failed to log admin action:", e); }
  };

  app.get("/api/admin/logs/admin", authenticateToken, isAdminMiddleware, async (req, res) => {
    try {
      const logsRef = collection(firestore, 'admin_logs');
      const q = query(logsRef, orderBy('created_at', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/logs/activity", authenticateToken, isAdminMiddleware, async (req, res) => {
    try {
      const q = query(collection(firestore, 'activity_logs'), orderBy('created_at', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      
      const logs = await Promise.all(snapshot.docs.map(async (logDoc) => {
        const log = logDoc.data() as any;
        const userDoc = await getDoc(doc(firestore, 'users', log.user_id));
        const userData = userDoc.data() || {};
        return {
          ...log,
          user_name: userData.name || 'Unknown',
          user_email: userData.email || 'Unknown'
        };
      }));
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activity logs" });
    }
  });

  app.get("/api/admin/analytics/activity", authenticateToken, isAdminMiddleware, async (req, res) => {
    try {
      const q = query(collection(firestore, 'activity_logs'), orderBy('created_at', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map(doc => doc.data());
      
      // Group by date for stats
      const statsMap = new Map();
      logs.forEach((log: any) => {
        const date = log.created_at.split('T')[0];
        statsMap.set(date, (statsMap.get(date) || 0) + 1);
      });
      
      const stats = Array.from(statsMap.entries()).map(([date, count]) => ({ date, count }));
      res.json(stats.reverse());
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/admin/messages", authenticateToken, isAdminMiddleware, async (req, res) => {
    try {
      const q = query(collection(firestore, 'admin_messages'), orderBy('created_at', 'asc'), limit(100));
      const snapshot = await getDocs(q);
      const messages = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
        const msg = docSnapshot.data() as any;
        const userDoc = await getDoc(doc(firestore, 'users', msg.sender_id));
        return { ...msg, sender_name: userDoc.data()?.name || 'Unknown', avatar_url: userDoc.data()?.avatar_url };
      }));
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin messages" });
    }
  });

  app.post("/api/admin/messages", authenticateToken, isAdminMiddleware, async (req: any, res) => {
    const { message } = req.body;
    try {
      const msgRef = doc(collection(firestore, 'admin_messages'));
      const newMessage = {
        id: msgRef.id,
        sender_id: req.user.id,
        message,
        created_at: new Date().toISOString()
      };
      await setDoc(msgRef, newMessage);
      
      const userDoc = await getDoc(doc(firestore, 'users', req.user.id));
      const messageWithUser = { ...newMessage, sender_name: userDoc.data()?.name || 'Unknown', avatar_url: userDoc.data()?.avatar_url };
      
      // Broadcast to other admins
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'admin_chat', message: messageWithUser }));
        }
      });
      
      res.json(messageWithUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to send admin message" });
    }
  });

  app.delete("/api/admin/listings/:id", authenticateToken, isAdminMiddleware, async (req, res) => {
    const { id } = req.params;
    const { type } = req.query; // Need type to know which collection
    const tableMap: any = { tour: 'tours', restaurant: 'restaurants', hotel: 'hotels', taxi: 'taxi', experience: 'experiences', rental: 'rentals', event: 'events' };
    const collectionName = tableMap[type as string];
    
    if (!collectionName) return res.status(400).json({ error: "Invalid type" });
    
    try {
      await deleteDoc(doc(firestore, collectionName, id));
      await logAdminAction((req as any).user.uid, (req as any).user.name || 'Admin', 'delete_listing', id, { type });
      notifyAdmins('system', `Listing ID ${id} was deleted by ${(req as any).user.name}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete listing" });
    }
  });

  // Offers & Game
  app.get("/api/offers", authenticateToken, (req, res) => {
    const offers = [
      { id: 'o1', title: '10% Off Next Ride', description: 'Get 10% off your next luxury transport.', cost: 500, code: 'RIDE10' },
      { id: 'o2', title: 'Free Dessert', description: 'Complimentary dessert at any partner restaurant.', cost: 300, code: 'SWEET' },
      { id: 'o3', title: 'VIP Lounge Access', description: 'Access to exclusive airport lounges.', cost: 1000, code: 'VIP' },
    ];
    res.json(offers);
  });

  app.post("/api/redeem", authenticateToken, async (req: any, res) => {
    const { offerId, cost } = req.body;
    try {
      const userRef = doc(firestore, 'users', req.user.id);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() as any;
      
      if (!userData || userData.bonus < cost) return res.status(400).json({ error: "Insufficient points" });
      
      await updateDoc(userRef, { bonus: userData.bonus - cost });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to redeem offer" });
    }
  });

  app.post("/api/game-win", authenticateToken, async (req: any, res) => {
    try {
      const userRef = doc(firestore, 'users', req.user.id);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() as any;
      await updateDoc(userRef, { 
        last_game_win: new Date().toISOString(), 
        bonus: (userData?.bonus || 0) + 50 
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update game win" });
    }
  });

  app.post("/api/log-activity", authenticateToken, async (req: any, res) => {
    const { action, page, details } = req.body;
    try {
      const logRef = doc(collection(firestore, 'activity_logs'));
      await setDoc(logRef, {
        id: logRef.id,
        user_id: req.user.id,
        action: action || 'UI_ACTION',
        page: page || 'unknown',
        details: details ? JSON.stringify(details) : null,
        ip: req.ip,
        user_agent: req.get('user-agent'),
        created_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to log activity" });
    }
  });

  // Social & Learning Extras
  app.get("/api/friends", authenticateToken, (req, res) => res.json([]));
  app.get("/api/mentors", authenticateToken, (req, res) => res.json([]));
  app.post("/api/mentors/follow", authenticateToken, (req, res) => res.json({ success: true }));
  app.get("/api/tasks", authenticateToken, (req, res) => res.json([]));
  app.get("/api/search", async (req, res) => {
    const { q } = req.query;
    try {
      // Simple search across all listings
      const allListings = await Promise.all([
        fetchListings('tours', 'tour'),
        fetchListings('restaurants', 'restaurant'),
        fetchListings('hotels', 'hotel')
      ]);
      const flattened = allListings.flat();
      const filtered = flattened.filter((l: any) => 
        (l.name || '').toLowerCase().includes(String(q).toLowerCase()) ||
        (l.description || '').toLowerCase().includes(String(q).toLowerCase())
      );
      res.json(filtered);
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  // User Profile
  app.post("/api/user/profile", authenticateToken, async (req: any, res) => {
    const { name, avatar_url } = req.body;
    try {
      const userRef = doc(firestore, 'users', req.user.id);
      await updateDoc(userRef, {
        name,
        avatar_url
      });
      const userDoc = await getDoc(userRef);
      res.json(userDoc.data());
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Bookings
  app.get("/api/bookings", authenticateToken, async (req: any, res) => {
    try {
      const q = query(
        collection(firestore, 'bookings'),
        where('user_id', '==', req.user.id),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map(doc => doc.data());
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings/:id/cancel", authenticateToken, async (req: any, res) => {
    try {
      const bookingRef = doc(firestore, 'bookings', req.params.id);
      const bookingDoc = await getDoc(bookingRef);
      
      if (!bookingDoc.exists()) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      const bookingData = bookingDoc.data() as any;
      if (bookingData.user_id !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      await updateDoc(bookingRef, { status: 'cancelled' });
      res.json({ success: true });
    } catch (error) {
      console.error("Booking Cancel Error:", error);
      res.status(500).json({ error: "Failed to cancel booking" });
    }
  });

  // Suggestions
  app.get("/api/suggestions", authenticateToken, async (req, res) => {
    try {
      // Fetch some popular items as suggestions
      const [tours, restaurants, hotels] = await Promise.all([
        fetchListings('tours', 'tour'),
        fetchListings('restaurants', 'restaurant'),
        fetchListings('hotels', 'hotel')
      ]);
      const all = [...tours, ...restaurants, ...hotels];
      // Randomly pick 4
      const shuffled = all.sort(() => 0.5 - Math.random());
      res.json(shuffled.slice(0, 4));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suggestions" });
    }
  });

  app.post("/api/report-error", async (req, res) => {
    const errorData = req.body;
    console.error("Client-side error reported:", JSON.stringify(errorData, null, 2));
    
    try {
      const errorRef = doc(collection(firestore, 'client_errors'));
      await setDoc(errorRef, {
        id: errorRef.id,
        ...errorData,
        created_at: new Date().toISOString(),
        user_agent: req.get('user-agent'),
        ip: req.ip
      });
    } catch (e) {
      console.error("Failed to store client error in Firestore:", e);
    }
    
    res.json({ success: true });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/:type/:id", async (req, res) => {
    const { type, id } = req.params;
    const tableMap: any = { 
      tours: 'tours', 
      restaurants: 'restaurants', 
      hotels: 'hotels', 
      taxi: 'taxi',
      experiences: 'experiences',
      rentals: 'rentals',
      events: 'events'
    };
    const collectionName = tableMap[type];
    if (!collectionName) return res.status(404).json({ error: "Not found" });
    
    try {
      const docSnapshot = await getDoc(doc(firestore, collectionName, id));
      if (!docSnapshot.exists()) return res.status(404).json({ error: "Not found" });
      
      const item = docSnapshot.data() as any;
      const q = query(
        collection(firestore, 'reviews'),
        where('listing_id', '==', id),
        where('listing_type', '==', type.slice(0, -1)),
        orderBy('created_at', 'desc')
      );
      const reviewsSnapshot = await getDocs(q);
      const reviews = reviewsSnapshot.docs.map(d => d.data());
      
      res.json({ ...item, reviews });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch item" });
    }
  });

  // Vite Integration & Static Files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
  }

  // Graceful shutdown
  const shutdown = () => {
    console.log('Closing server...');
    server.close(() => {
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  server.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Test Firestore connection
    try {
      const q = query(collection(firestore, 'hotels'), limit(1));
      const testSnapshot = await getDocs(q);
      console.log(`Firestore connection test successful. Found ${testSnapshot.size} hotels.`);
    } catch (e) {
      console.error("Firestore connection test failed:", e);
    }
  });
}

startServer();
