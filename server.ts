import express from "express";
import http from "http";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer, WebSocket } from "ws";
import helmet from "helmet";
import cors from "cors";
import Stripe from "stripe";
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore(firebaseConfig.firestoreDatabaseId);
const auth = getAuth();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });
  const games = new Map<string, { players: WebSocket[], board: (string|null)[], turn: number }>();
  const adminClients = new Set<WebSocket>();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(express.json());

  // Authentication Middleware
  const authenticateToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = {
        id: decodedToken.uid,
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'user'
      };
      next();
    } catch (err) {
      console.error(`Auth failed: Invalid token`, err);
      return res.sendStatus(403);
    }
  };

  const isAdminMiddleware = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  };

  // WebSocket Logic
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
      if (isAdmin) adminClients.delete(ws);
      if (roomId && games.has(roomId)) {
        const game = games.get(roomId)!;
        game.players.forEach(p => { if (p !== ws) p.send(JSON.stringify({ type: 'opponentLeft' })); });
        games.delete(roomId);
      }
    });
  });

  // Auto-seeding
  const listingsSnap = await db.collection('listings').limit(1).get();
  if (listingsSnap.empty) {
    console.log("Database empty, seeding demo data...");
    const categories = ['Hotels', 'Restaurants', 'Experiences', 'Tours', 'Rentals', 'Events', 'Taxi'];
    const cities = ['Rome', 'Venice', 'Florence', 'Milan', 'Naples', 'Amalfi'];
    
    for (const cat of categories) {
      for (let i = 1; i <= 12; i++) {
        const city = cities[Math.floor(Math.random() * cities.length)];
        const listing = {
          category: cat,
          title: `${cat} in ${city} #${i}`,
          location: city,
          price: Math.floor(Math.random() * 500) + 50,
          rating: 4 + Math.random(),
          image: `https://picsum.photos/seed/${cat}${city}${i}/800/600`,
          description: `A beautiful ${cat.toLowerCase()} located in the heart of ${city}. Experience the authentic Italian lifestyle with premium amenities and local charm.`,
          created_at: new Date().toISOString()
        };
        const docRef = await db.collection('listings').add(listing);
        
        // Add some demo reviews
        for (let j = 1; j <= 3; j++) {
          await db.collection('reviews').add({
            listing_id: docRef.id,
            user_id: 'demo-user',
            user_name: 'Traveler ' + j,
            rating: 4 + Math.random(),
            comment: `Amazing ${cat.toLowerCase()}! Highly recommended for anyone visiting ${city}.`,
            created_at: new Date().toISOString()
          });
        }
      }
    }
    console.log("Seeding complete.");
  }

  // API Routes
  app.post("/api/register", async (req, res) => {
    const { uid, email, name } = req.body;
    if (!uid || !email || !name) return res.status(400).json({ error: "Missing fields" });
    try {
      const userRef = db.collection('users').doc(uid);
      const user = { 
        name, 
        email, 
        role: 'user', 
        wallet_balance: 0, 
        bonus: 0, 
        status: 'Normal',
        created_at: new Date().toISOString() 
      };
      await userRef.set(user);
      res.json({ user: { id: uid, ...user } });
    } catch (err) {
      console.error("Register Error:", err);
      res.status(500).json({ error: "Failed to save user profile" });
    }
  });

  app.get("/api/users/me", authenticateToken, async (req: any, res) => {
    try {
      const userDoc = await db.collection('users').doc(req.user.id).get();
      if (!userDoc.exists) return res.status(404).json({ error: "User not found" });
      res.json({ id: userDoc.id, ...userDoc.data() });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/listings", async (req, res) => {
    try {
      const snapshot = await db.collection('listings').get();
      res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  app.get("/api/search", async (req, res) => {
    const { q, category, minPrice, maxPrice, minRating } = req.query;
    try {
      let query: any = db.collection('listings');
      if (category && category !== 'All') query = query.where('category', '==', category);
      
      const snapshot = await query.get();
      let results = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      
      if (q) {
        const searchStr = String(q).toLowerCase();
        results = results.filter((l: any) => 
          (l.title && l.title.toLowerCase().includes(searchStr)) || 
          (l.name && l.name.toLowerCase().includes(searchStr)) ||
          (l.description && l.description.toLowerCase().includes(searchStr))
        );
      }
      
      if (minPrice) results = results.filter((l: any) => l.price >= Number(minPrice));
      if (maxPrice) results = results.filter((l: any) => l.price <= Number(maxPrice));
      if (minRating) results = results.filter((l: any) => (l.rating || l.stars || 0) >= Number(minRating));
      
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  app.post("/api/reviews", authenticateToken, async (req: any, res) => {
    const { listing_id, listing_type, rating, comment } = req.body;
    try {
      const review = {
        user_id: req.user.id,
        listing_id,
        listing_type,
        rating: Number(rating),
        comment,
        created_at: new Date().toISOString()
      };
      const docRef = await db.collection('reviews').add(review);
      res.json({ id: docRef.id, ...review });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/reviews/:itemId", async (req, res) => {
    try {
      const snapshot = await db.collection('reviews')
        .where('listing_id', '==', req.params.itemId)
        .orderBy('created_at', 'desc')
        .get();
      const reviews = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data();
        const userDoc = await db.collection('users').doc(data.user_id).get();
        return { id: doc.id, ...data, user_name: userDoc.data()?.name || 'Anonymous' };
      }));
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/bookings", authenticateToken, async (req: any, res) => {
    const { listing_id, listing_type, date, guests, amount, title } = req.body;
    try {
      const booking = {
        user_id: req.user.id,
        listing_id,
        listing_type,
        date,
        guests: Number(guests),
        amount: Number(amount),
        title,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      const docRef = await db.collection('bookings').add(booking);
      res.json({ id: docRef.id, ...booking });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/bookings/user", authenticateToken, async (req: any, res) => {
    try {
      const snapshot = await db.collection('bookings')
        .where('user_id', '==', req.user.id)
        .orderBy('created_at', 'desc')
        .get();
      res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/favorites", authenticateToken, async (req: any, res) => {
    const { listing_id, listing_type } = req.body;
    try {
      const favorite = {
        user_id: req.user.id,
        listing_id,
        listing_type,
        created_at: new Date().toISOString()
      };
      const docRef = await db.collection('favorites').add(favorite);
      res.json({ id: docRef.id, ...favorite });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/favorites", authenticateToken, async (req: any, res) => {
    try {
      const snapshot = await db.collection('favorites').where('user_id', '==', req.user.id).get();
      res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Admin Panel
  app.get("/api/admin/stats", authenticateToken, isAdminMiddleware, async (req, res) => {
    try {
      const usersSnap = await db.collection('users').get();
      const bookingsSnap = await db.collection('bookings').get();
      const revenue = bookingsSnap.docs
        .filter(doc => doc.data().status === 'paid')
        .reduce((acc, doc) => acc + (doc.data().amount || 0), 0);
      res.json({ users: usersSnap.size, bookings: bookingsSnap.size, revenue });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/admin/bookings", authenticateToken, isAdminMiddleware, async (req, res) => {
    try {
      const snapshot = await db.collection('bookings').orderBy('created_at', 'desc').get();
      const bookings = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data();
        const userDoc = await db.collection('users').doc(data.user_id).get();
        return { id: doc.id, ...data, user_name: userDoc.data()?.name || 'Unknown', user_email: userDoc.data()?.email || 'Unknown' };
      }));
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/admin/users", authenticateToken, isAdminMiddleware, async (req, res) => {
    try {
      const snapshot = await db.collection('users').get();
      res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const doc = await db.collection('listings').doc(id).get();
      if (!doc.exists) return res.status(404).json({ error: "Listing not found" });
      
      const reviewsSnap = await db.collection('reviews').where('listing_id', '==', id).get();
      const reviews = await Promise.all(reviewsSnap.docs.map(async d => {
        const data = d.data();
        const userDoc = await db.collection('users').doc(data.user_id).get();
        return { id: d.id, ...data, user_name: userDoc.data()?.name || 'Anonymous' };
      }));
      
      res.json({ id: doc.id, ...doc.data(), reviews });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listing" });
    }
  });

  // Stripe
  app.post("/api/create-checkout-session", authenticateToken, async (req: any, res) => {
    const { bookingId } = req.body;
    try {
      const bookingDoc = await db.collection('bookings').doc(bookingId).get();
      if (!bookingDoc.exists) return res.status(404).json({ error: "Booking not found" });
      const booking = bookingDoc.data()!;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: { name: booking.title },
            unit_amount: Math.round(booking.amount * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}/payment-success?bookingId=${bookingId}`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/payment-cancel`,
        metadata: { bookingId }
      });
      res.json({ url: session.url });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  // Finalize Express Export for Vercel
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.resolve(distPath, "index.html")));
  }

  return app;
}

const appPromise = startServer();
export default appPromise;
