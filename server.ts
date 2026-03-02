import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer, WebSocket } from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("italiago.db");
db.pragma('journal_mode = WAL');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    wallet_balance REAL DEFAULT 0,
    bonus INTEGER DEFAULT 0,
    has_purchased INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Normal',
    total_spent REAL DEFAULT 0,
    last_game_win DATETIME,
    role TEXT DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    type TEXT,
    name TEXT,
    location TEXT,
    price REAL,
    price_level TEXT,
    image TEXT,
    stars INTEGER,
    description TEXT,
    amenities TEXT,
    history TEXT,
    chef TEXT,
    michelin_stars INTEGER,
    specialty TEXT,
    duration TEXT,
    highlights TEXT,
    info TEXT,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT, -- 'hotel', 'restaurant', 'tour', 'taxi'
    item_name TEXT,
    details TEXT,
    amount REAL,
    status TEXT DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER,
    amount REAL,
    method TEXT,
    status TEXT,
    transaction_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(booking_id) REFERENCES bookings(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    item_id TEXT,
    rating INTEGER,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Migration: Add new columns if they don't exist
try {
  const columns = db.prepare("PRAGMA table_info(users)").all();
  const columnNames = columns.map((col: any) => col.name);
  
  if (!columnNames.includes('status')) {
    db.prepare("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'Normal'").run();
  }
  if (!columnNames.includes('total_spent')) {
    db.prepare("ALTER TABLE users ADD COLUMN total_spent REAL DEFAULT 0").run();
  }
  if (!columnNames.includes('last_game_win')) {
    db.prepare("ALTER TABLE users ADD COLUMN last_game_win DATETIME").run();
  }
  if (!columnNames.includes('role')) {
    db.prepare("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'").run();
  }
} catch (error) {
  console.error("Migration Error:", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const wss = new WebSocketServer({ server });
  const games = new Map<string, { players: WebSocket[], board: (string|null)[], turn: number }>();

  wss.on('connection', (ws) => {
    let roomId: string | null = null;
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
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
      if (roomId && games.has(roomId)) {
        const game = games.get(roomId)!;
        game.players.forEach(p => { if (p !== ws) p.send(JSON.stringify({ type: 'opponentLeft' })); });
        games.delete(roomId);
      }
    });
  });

  // Seed user if not exists
  const seedUser = db.prepare("SELECT * FROM users WHERE email = ?").get("demo@italiago.com");
  if (!seedUser) {
    db.prepare("INSERT INTO users (email, password, name, wallet_balance, bonus, has_purchased, role) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      "demo@italiago.com",
      "password123",
      "Marco Rossi",
      0.0, // Default Wallet: €0.00
      0,   // Default Bonus: 0
      0,
      "admin"
    );
  }

  // Seed listings if empty
  const listingCount = db.prepare("SELECT COUNT(*) as count FROM listings").get().count;
  if (listingCount === 0) {
    const initialListings = [
      { id: 'h1', type: 'hotel', name: 'Hotel Danieli', location: 'Venice', price: 850, price_level: 'high', image: 'https://picsum.photos/seed/danieli/800/600', stars: 5, description: 'A legendary hotel in the heart of Venice...', amenities: JSON.stringify(['Spa', 'Fine Dining', 'Private Dock']), history: 'Built in the 14th century...', category: 'Premium' },
      { id: 'h2', type: 'hotel', name: 'Grand Hotel Tremezzo', location: 'Lake Como', price: 1200, price_level: 'high', image: 'https://picsum.photos/seed/tremezzo/800/600', stars: 5, description: 'Art Nouveau palace with floating pool...', category: 'Premium' },
      { id: 'r1', type: 'restaurant', name: 'Osteria Francescana', location: 'Modena', price: 300, price_level: 'high', image: 'https://picsum.photos/seed/osteria/800/600', stars: 5, chef: 'Massimo Bottura', michelin_stars: 3, specialty: 'Oops! I Dropped the Lemon Tart', category: 'Premium' },
      { id: 'r2', type: 'restaurant', name: 'La Pergola', location: 'Rome', price: 250, price_level: 'high', image: 'https://picsum.photos/seed/pergola/800/600', stars: 5, chef: 'Heinz Beck', michelin_stars: 3, specialty: 'Fagottelli La Pergola', category: 'Premium' },
      { id: 't1', type: 'tour', name: 'Vatican Museums Private Tour', location: 'Rome', duration: '4h', price: 250, price_level: 'medium', image: 'https://picsum.photos/seed/vatican/800/600', stars: 5, description: 'Skip the lines...', highlights: JSON.stringify(['Sistine Chapel', 'Raphael Rooms']), category: 'Standard' },
      { id: 'e1', type: 'experience', name: 'Tuscan Culinary Journey', location: 'Florence', price: 180, price_level: 'medium', image: 'https://picsum.photos/seed/culinary/800/600', stars: 5, description: 'Authentic cooking class in a Medici villa.', category: 'Culinary' },
      { id: 'e2', type: 'experience', name: 'Truffle Hunting & Tasting', location: 'Alba', price: 220, price_level: 'high', image: 'https://picsum.photos/seed/truffle/800/600', stars: 5, description: 'Follow the expert dogs and enjoy a truffle feast.', category: 'Culinary' },
    ];
    const insertListing = db.prepare(`
      INSERT INTO listings (id, type, name, location, price, price_level, image, stars, description, amenities, history, chef, michelin_stars, specialty, duration, highlights, info, category)
      VALUES (@id, @type, @name, @location, @price, @price_level, @image, @stars, @description, @amenities, @history, @chef, @michelin_stars, @specialty, @duration, @highlights, @info, @category)
    `);
    initialListings.forEach((l: any) => {
      const data = {
        id: l.id, type: l.type, name: l.name, location: l.location, price: l.price, price_level: l.price_level,
        image: l.image, stars: l.stars, description: l.description || null, amenities: l.amenities || null,
        history: l.history || null, chef: l.chef || null, michelin_stars: l.michelin_stars || null,
        specialty: l.specialty || null, duration: l.duration || null, highlights: l.highlights || null,
        info: l.info || null, category: l.category || 'Standard'
      };
      insertListing.run(data);
    });
    console.log("Seeded initial listings.");
  }

  // API Routes
  app.post("/api/register", (req, res) => {
    const { email, password, name } = req.body;
    try {
      const result = db.prepare("INSERT INTO users (email, password, name, wallet_balance, bonus) VALUES (?, ?, ?, ?, ?)").run(
        email,
        password,
        name,
        0.0, // Initial balance set to 0
        0   // Initial bonus set to 0
      );
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/listings", (req, res) => {
    const listings = db.prepare("SELECT * FROM listings").all();
    res.json(listings.map(l => ({
      ...l,
      amenities: l.amenities ? JSON.parse(l.amenities) : [],
      highlights: l.highlights ? JSON.parse(l.highlights) : []
    })));
  });

  app.post("/api/admin/listings", (req, res) => {
    const user = db.prepare("SELECT role FROM users LIMIT 1").get(); // Simple check for demo
    if (!user || user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });

    const listing = req.body;
    if (!listing.id) listing.id = Math.random().toString(36).substr(2, 9);
    
    const data = {
      id: listing.id,
      type: listing.type || 'hotel',
      name: listing.name || '',
      location: listing.location || '',
      price: listing.price || 0,
      price_level: listing.price_level || 'medium',
      image: listing.image || '',
      stars: listing.stars || 5,
      description: listing.description || null,
      amenities: listing.amenities ? JSON.stringify(listing.amenities) : null,
      history: listing.history || null,
      chef: listing.chef || null,
      michelin_stars: listing.michelin_stars || null,
      specialty: listing.specialty || null,
      duration: listing.duration || null,
      highlights: listing.highlights ? JSON.stringify(listing.highlights) : null,
      info: listing.info || null,
      category: listing.category || 'Standard'
    };

    try {
      db.prepare(`
        INSERT OR REPLACE INTO listings (id, type, name, location, price, price_level, image, stars, description, amenities, history, chef, michelin_stars, specialty, duration, highlights, info, category)
        VALUES (@id, @type, @name, @location, @price, @price_level, @image, @stars, @description, @amenities, @history, @chef, @michelin_stars, @specialty, @duration, @highlights, @info, @category)
      `).run(data);
      res.json({ success: true, id: listing.id });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/admin/listings/:id", (req, res) => {
    const user = db.prepare("SELECT role FROM users LIMIT 1").get();
    if (!user || user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });

    db.prepare("DELETE FROM listings WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/suggestions", (req, res) => {
    // Return a mix of items for suggestions
    const suggestions = [
      { id: 's1', name: 'Belmond Hotel Cipriani', type: 'hotel', price: 1200, rating: 5, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400' },
      { id: 's2', name: 'Osteria Francescana', type: 'restaurant', price: 300, rating: 5, image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400' },
      { id: 's3', name: 'Amalfi Coast Boat Tour', type: 'tour', price: 150, rating: 4.8, image: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&q=80&w=400' },
      { id: 's4', name: 'Uffizi Gallery Fast Track', type: 'tour', price: 45, rating: 4.9, image: 'https://images.unsplash.com/photo-1543487945-139a97f387d5?auto=format&fit=crop&q=80&w=400' },
    ];
    res.json(suggestions);
  });

  app.get("/api/user", (req, res) => {
    // In a real app, we'd use sessions/JWT. For now, just return the first user or null.
    const user = db.prepare("SELECT * FROM users LIMIT 1").get();
    res.json(user || null);
  });

  app.get("/api/bookings", (req, res) => {
    const bookings = db.prepare("SELECT * FROM bookings ORDER BY created_at DESC").all();
    res.json(bookings);
  });

  app.post("/api/bookings", (req, res) => {
    const { type, itemName, details, amount, pointsUsed, minigameDiscount } = req.body;
    const user = db.prepare("SELECT id, bonus, total_spent FROM users LIMIT 1").get();
    
    let baseAmount = amount;
    if (minigameDiscount) {
      baseAmount = amount * 0.9; // 10% discount
    }

    const discount = pointsUsed ? Math.min(pointsUsed / 10, baseAmount) : 0; // 10 points = €1
    const finalAmount = baseAmount - discount;
    
    // Calculate 15% bonus on the final paid amount
    const bonusEarned = Math.floor(finalAmount * 0.15);
    
    db.transaction(() => {
      db.prepare(
        "INSERT INTO bookings (user_id, type, item_name, details, amount) VALUES (?, ?, ?, ?, ?)"
      ).run(user.id, type, itemName, details, finalAmount);

      const bonusUpdate = bonusEarned - (pointsUsed || 0);
      const newTotalSpent = user.total_spent + finalAmount;
      
      let newStatus = 'Normal';
      if (newTotalSpent >= 10000) newStatus = 'Rich';
      else if (newTotalSpent >= 2000) newStatus = 'Pro';
      else if (newTotalSpent >= 500) newStatus = 'Advanced';

      db.prepare(
        "UPDATE users SET bonus = bonus + ?, has_purchased = 1, total_spent = ?, status = ?, last_game_win = NULL WHERE id = ?"
      ).run(bonusUpdate, newTotalSpent, newStatus, user.id);
    })();

    res.json({ id: 0, status: "confirmed", bonusEarned, finalAmount });
  });

  app.post("/api/game-win", (req, res) => {
    const user = db.prepare("SELECT id FROM users LIMIT 1").get();
    db.prepare("UPDATE users SET last_game_win = CURRENT_TIMESTAMP WHERE id = ?").run(user.id);
    res.json({ status: "ok" });
  });

  app.get("/api/offers", (req, res) => {
    const user = db.prepare("SELECT has_purchased FROM users LIMIT 1").get();
    
    if (!user || !user.has_purchased) {
      return res.json([]);
    }

    // Dynamic offers logic
    const offers = [
      { id: 'off1', name: 'Colosseum Private Tour', type: 'tour', originalPrice: 150, discountPoints: 50, discountValue: 30, image: 'https://picsum.photos/seed/colosseum/400/300' },
      { id: 'off2', name: 'Venice Gondola Dinner', type: 'experience', originalPrice: 250, discountPoints: 100, discountValue: 60, image: 'https://picsum.photos/seed/gondola/400/300' },
      { id: 'off3', name: 'Tuscan Wine Tasting', type: 'experience', originalPrice: 80, discountPoints: 20, discountValue: 15, image: 'https://picsum.photos/seed/wine/400/300' },
      { id: 'off4', name: 'Luxury Suite Upgrade - Rome', type: 'hotel', originalPrice: 400, discountPoints: 200, discountValue: 120, image: 'https://picsum.photos/seed/suite/400/300' },
    ];

    // Randomly shuffle or select offers to "vary and update over time"
    const shuffled = offers.sort(() => 0.5 - Math.random()).slice(0, 3);
    res.json(shuffled);
  });

  app.post("/api/redeem", (req, res) => {
    const { offerId, points } = req.body;
    const user = db.prepare("SELECT id, bonus FROM users LIMIT 1").get();

    if (user.bonus < points) {
      return res.status(400).json({ error: "Insufficient bonus points" });
    }

    db.prepare("UPDATE users SET bonus = bonus - ? WHERE id = ?").run(points, user.id);
    
    res.json({ success: true, newBonus: user.bonus - points });
  });

  // Reviews
  app.get("/api/reviews/:itemId", (req, res) => {
    try {
      const reviews = db.prepare(`
        SELECT r.*, u.name as user_name 
        FROM reviews r 
        JOIN users u ON r.user_id = u.id 
        WHERE r.item_id = ? 
        ORDER BY r.created_at DESC
      `).all(req.params.itemId);
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", express.json(), (req, res) => {
    const { userId, itemId, rating, comment } = req.body;
    if (!itemId || !rating || !comment) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Use provided userId or default to first user for demo
    const finalUserId = userId || 1;
    
    try {
      const result = db.prepare("INSERT INTO reviews (user_id, item_id, rating, comment) VALUES (?, ?, ?, ?)").run(finalUserId, itemId, rating, comment);
      const newReview = db.prepare(`
        SELECT r.*, u.name as user_name 
        FROM reviews r 
        JOIN users u ON r.user_id = u.id 
        WHERE r.id = ?
      `).get(result.lastInsertRowid);
      res.json(newReview);
    } catch (err) {
      res.status(500).json({ error: "Failed to post review" });
    }
  });

  // Seed some fake reviews if table is empty
  const reviewCount = db.prepare("SELECT COUNT(*) as count FROM reviews").get().count;
  if (reviewCount === 0) {
    const fakeReviews = [
      { user_id: 1, item_id: 'h1', rating: 5, comment: 'Absolutely stunning! The view of the lagoon is unforgettable.' },
      { user_id: 1, item_id: 'h1', rating: 4, comment: 'Great service, but a bit pricey.' },
      { user_id: 1, item_id: 'r1', rating: 5, comment: 'The best meal of my life. Massimo is a genius.' },
      { user_id: 1, item_id: 'r5', rating: 5, comment: 'Simple, authentic, and delicious. Best pizza in Naples!' },
      { user_id: 1, item_id: 'h2', rating: 5, comment: 'The floating pool is a dream. Highly recommend!' },
      { user_id: 1, item_id: 'r2', rating: 4, comment: 'Exquisite food and amazing views of Rome.' },
      { user_id: 1, item_id: 'h3', rating: 5, comment: 'Portofino is magical, and this hotel is its crown jewel.' },
      { user_id: 1, item_id: 'r3', rating: 5, comment: 'The wine cellar is like a museum. Incredible experience.' },
      { user_id: 1, item_id: 'h4', rating: 4, comment: 'Very central and the rooftop bar is excellent for sunset drinks.' },
      { user_id: 1, item_id: 'r4', rating: 5, comment: 'The Paccheri alla Vittorio is a must-try. Pure Italian joy.' },
      { user_id: 1, item_id: 'h9', rating: 5, comment: 'Ravello is so peaceful, and the infinity pool here is the best in the world.' },
      { user_id: 1, item_id: 'r7', rating: 5, comment: 'Alba truffles and this restaurant are a match made in heaven.' },
      { user_id: 1, item_id: 'h10', rating: 5, comment: 'The Secret Garden is the perfect place to escape the Roman heat.' },
      { user_id: 1, item_id: 'r12', rating: 4, comment: 'Classic Sorbillo. Long wait but totally worth it for the crust.' },
      { user_id: 1, item_id: 'h11', rating: 5, comment: 'Living like a Medici for a few days. The gardens are spectacular.' },
    ];
    const insertReview = db.prepare("INSERT INTO reviews (user_id, item_id, rating, comment) VALUES (?, ?, ?, ?)");
    fakeReviews.forEach(r => insertReview.run(r.user_id, r.item_id, r.rating, r.comment));
    console.log("Seeded fake reviews.");
  }

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('Closing server and database...');
    server.close(() => {
      db.close();
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    console.log('Closing server and database...');
    server.close(() => {
      db.close();
      process.exit(0);
    });
  });
}

startServer();
