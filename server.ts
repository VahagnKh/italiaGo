import express from "express";
import http from "http";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import cors from "cors";
import Stripe from "stripe";

const JWT_SECRET = process.env.JWT_SECRET || "italiago-jwt-secret-2026";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock");

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

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
    role TEXT DEFAULT 'user',
    avatar_url TEXT,
    disabled INTEGER DEFAULT 0,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    price REAL,
    location TEXT,
    image TEXT,
    rating REAL DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    category TEXT,
    price_level TEXT,
    details TEXT,
    address TEXT,
    map_url TEXT,
    promotions TEXT,
    availability TEXT,
    duration TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    price REAL,
    location TEXT,
    image TEXT,
    rating REAL DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    category TEXT,
    price_level TEXT,
    details TEXT,
    address TEXT,
    map_url TEXT,
    promotions TEXT,
    availability TEXT,
    cuisine_type TEXT,
    hours TEXT,
    capacity INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS hotels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    price REAL,
    location TEXT,
    image TEXT,
    rating REAL DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    category TEXT,
    price_level TEXT,
    details TEXT,
    address TEXT,
    map_url TEXT,
    promotions TEXT,
    availability TEXT,
    amenities TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS experiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    price REAL,
    location TEXT,
    image TEXT,
    rating REAL DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    category TEXT,
    price_level TEXT,
    details TEXT,
    address TEXT,
    map_url TEXT,
    promotions TEXT,
    availability TEXT,
    duration TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rentals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    price REAL,
    location TEXT,
    image TEXT,
    rating REAL DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    category TEXT,
    price_level TEXT,
    details TEXT,
    address TEXT,
    map_url TEXT,
    promotions TEXT,
    availability TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    price REAL,
    location TEXT,
    image TEXT,
    rating REAL DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    category TEXT,
    price_level TEXT,
    details TEXT,
    address TEXT,
    map_url TEXT,
    promotions TEXT,
    availability TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS taxi_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    price REAL,
    location TEXT,
    image TEXT,
    rating REAL DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    category TEXT,
    price_level TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    listing_id INTEGER,
    listing_type TEXT, -- 'tour', 'restaurant', 'hotel', 'taxi'
    rating INTEGER,
    comment TEXT,
    username TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    listing_id INTEGER,
    listing_type TEXT,
    date DATETIME,
    guests INTEGER,
    amount REAL,
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    page TEXT,
    details TEXT,
    ip TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    message TEXT,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER,
    title TEXT,
    content TEXT,
    order_index INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(course_id) REFERENCES courses(id)
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    course_id INTEGER,
    lesson_id INTEGER,
    completed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(course_id) REFERENCES courses(id),
    FOREIGN KEY(lesson_id) REFERENCES lessons(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id)
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
  if (!columnNames.includes('avatar_url')) {
    db.prepare("ALTER TABLE users ADD COLUMN avatar_url TEXT").run();
  }
  if (!columnNames.includes('disabled')) {
    db.prepare("ALTER TABLE users ADD COLUMN disabled INTEGER DEFAULT 0").run();
  }
  if (!columnNames.includes('last_login')) {
    db.prepare("ALTER TABLE users ADD COLUMN last_login DATETIME").run();
  }

  // Reviews migration
  const reviewColumns = db.prepare("PRAGMA table_info(reviews)").all();
  const reviewColumnNames = reviewColumns.map((col: any) => col.name);
  if (!reviewColumnNames.includes('listing_id')) {
    db.prepare("ALTER TABLE reviews ADD COLUMN listing_id INTEGER").run();
  }
  if (!reviewColumnNames.includes('listing_type')) {
    db.prepare("ALTER TABLE reviews ADD COLUMN listing_type TEXT").run();
  }

  // Bookings migration
  const bookingColumns = db.prepare("PRAGMA table_info(bookings)").all();
  const bookingColumnNames = bookingColumns.map((col: any) => col.name);
  if (!bookingColumnNames.includes('listing_id')) {
    db.prepare("ALTER TABLE bookings ADD COLUMN listing_id INTEGER").run();
  }
  if (!bookingColumnNames.includes('listing_type')) {
    db.prepare("ALTER TABLE bookings ADD COLUMN listing_type TEXT").run();
  }

  // Category and Price Level migration
  const tables = ['tours', 'restaurants', 'hotels', 'experiences', 'rentals', 'events', 'taxi_services'];
  tables.forEach(table => {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all();
    const colNames = cols.map((c: any) => c.name);
    if (!colNames.includes('category')) {
      db.prepare(`ALTER TABLE ${table} ADD COLUMN category TEXT`).run();
    }
    if (!colNames.includes('price_level')) {
      db.prepare(`ALTER TABLE ${table} ADD COLUMN price_level TEXT`).run();
    }
    // Set default values for existing rows
    db.prepare(`UPDATE ${table} SET category = 'General' WHERE category IS NULL`).run();
    db.prepare(`UPDATE ${table} SET price_level = '€€' WHERE price_level IS NULL`).run();
  });
} catch (error) {
  console.error("Migration Error:", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });
  const games = new Map<string, { players: WebSocket[], board: (string|null)[], turn: number }>();
  const adminClients = new Set<WebSocket>();

  const notifyAdmins = (type: string, message: string, details?: any) => {
    const notification = {
      type,
      message,
      created_at: new Date().toISOString(),
      read: 0
    };
    
    try {
      const result = db.prepare("INSERT INTO notifications (type, message) VALUES (?, ?)").run(type, message);
      (notification as any).id = result.lastInsertRowid;
      
      const wsMessage = JSON.stringify({ type: 'notification', notification, details });
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
  
  // Authentication Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      console.warn(`Auth failed: No token for ${req.path}`);
      return res.sendStatus(401);
    }
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        console.error(`Auth failed: Invalid token for ${req.path}`, err);
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  };

  const isAdminMiddleware = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') {
      console.warn(`Admin access denied for user ${req.user?.id} (${req.user?.role}) at ${req.path}`);
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  };

  // Activity Tracking Middleware
  app.use((req: any, res, next) => {
    const user = req.user;
    if (user && req.method !== 'GET' && !req.path.startsWith('/api/admin')) {
      try {
        db.prepare(`
          INSERT INTO activity_logs (user_id, action, page, details, ip, user_agent)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          user.id,
          req.method,
          req.path,
          JSON.stringify(req.body),
          req.ip,
          req.get('user-agent')
        );
      } catch (e) {
        console.error("Activity Log Error:", e);
      }
    }
    next();
  });

  // Seed Data
  const seedData = async () => {
    // Admin
    const admin = db.prepare("SELECT * FROM users WHERE email = ?").get("admin@italiago.com");
    if (!admin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)").run("admin@italiago.com", hashedPassword, "Super Admin", "admin");
    }

    // Tours
    const tourCount = db.prepare("SELECT COUNT(*) as count FROM tours").get().count;
    if (tourCount === 0) {
      const tours = [
        { title: 'Colosseum Private Tour', description: 'Skip-the-line access to the heart of Rome.', price: 150, location: 'Rome', image: 'https://picsum.photos/seed/rome/800/600', details: 'Includes access to the arena floor and underground chambers.', category: 'History', price_level: 'high', rating: 5, reviews_count: 120, address: 'Piazza del Colosseo, 1, 00184 Roma RM', map_url: 'https://goo.gl/maps/colosseum', promotions: '10% off for groups of 4+', availability: 'Daily 9:00 - 17:00', duration: '3 hours' },
        { title: 'Venice Gondola Ride', description: 'Romantic sunset ride through the canals.', price: 120, location: 'Venice', image: 'https://picsum.photos/seed/venice/800/600', details: 'Private gondola for up to 4 people.', category: 'Romantic', price_level: 'medium', rating: 4.5, reviews_count: 85, address: 'Sestiere di S. Marco, 30124 Venezia VE', map_url: 'https://goo.gl/maps/venice-gondola', promotions: 'Free prosecco included', availability: 'Daily 10:00 - 20:00', duration: '45 minutes' },
        { title: 'Tuscan Wine Tasting', description: 'Explore the vineyards of Chianti.', price: 200, location: 'Florence', image: 'https://picsum.photos/seed/tuscany/800/600', details: 'Visit 3 historic wineries with lunch included.', category: 'Food & Wine', price_level: 'high', rating: 4.8, reviews_count: 64, address: 'Strada in Chianti, 50022 Greve in Chianti FI', map_url: 'https://goo.gl/maps/chianti', promotions: 'Bottle of wine included', availability: 'Tue-Sun 10:00 - 18:00', duration: '6 hours' }
      ];
      const insert = db.prepare("INSERT INTO tours (title, description, price, location, image, details, category, price_level, rating, reviews_count, address, map_url, promotions, availability, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      tours.forEach(t => insert.run(t.title, t.description, t.price, t.location, t.image, t.details, t.category, t.price_level, t.rating, t.reviews_count, t.address, t.map_url, t.promotions, t.availability, t.duration));
    }

    // Restaurants
    const restCount = db.prepare("SELECT COUNT(*) as count FROM restaurants").get().count;
    if (restCount === 0) {
      const rests = [
        { title: 'Osteria Francescana', description: 'World-renowned fine dining.', price: 350, location: 'Modena', image: 'https://picsum.photos/seed/osteria/800/600', details: '3 Michelin stars. Booking required 6 months in advance.', category: 'Fine Dining', price_level: 'high', rating: 5, reviews_count: 450, address: 'Via Stella, 22, 41121 Modena MO', map_url: 'https://goo.gl/maps/osteria', promotions: 'Chef special tasting menu', availability: 'Tue-Sat 12:30-14:00, 20:00-21:30', cuisine_type: 'Modern Italian', hours: '12:30 - 21:30', capacity: 30 },
        { title: 'La Pergola', description: 'Panoramic views of Rome.', price: 250, location: 'Rome', image: 'https://picsum.photos/seed/pergola/800/600', details: 'The only 3-star Michelin restaurant in Rome.', category: 'Fine Dining', price_level: 'high', rating: 4.9, reviews_count: 320, address: 'Via Alberto Cadlolo, 101, 00136 Roma RM', map_url: 'https://goo.gl/maps/lapergola', promotions: 'Wine pairing included', availability: 'Tue-Sat 19:30-23:30', cuisine_type: 'Gourmet Italian', hours: '19:30 - 23:30', capacity: 50 }
      ];
      const insert = db.prepare("INSERT INTO restaurants (title, description, price, location, image, details, category, price_level, rating, reviews_count, address, map_url, promotions, availability, cuisine_type, hours, capacity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      rests.forEach(r => insert.run(r.title, r.description, r.price, r.location, r.image, r.details, r.category, r.price_level, r.rating, r.reviews_count, r.address, r.map_url, r.promotions, r.availability, r.cuisine_type, r.hours, r.capacity));
    }

    // Hotels
    const hotelCount = db.prepare("SELECT COUNT(*) as count FROM hotels").get().count;
    if (hotelCount === 0) {
      const hotels = [
        { title: 'Hotel Danieli', description: 'Historic luxury on the Grand Canal.', price: 800, location: 'Venice', image: 'https://picsum.photos/seed/danieli/800/600', details: 'A legendary hotel housed in a 14th-century palace.', category: 'Luxury', price_level: 'high', rating: 5, reviews_count: 850, address: 'Riva degli Schiavoni, 4196, 30122 Venezia VE', map_url: 'https://goo.gl/maps/danieli', promotions: 'Breakfast included', availability: 'Year-round', amenities: 'Spa, Rooftop Terrace, Private Dock' },
        { title: 'Hotel Hassler', description: 'Top of the Spanish Steps.', price: 900, location: 'Rome', image: 'https://picsum.photos/seed/hassler/800/600', details: 'Iconic luxury with the best views of the Eternal City.', category: 'Luxury', price_level: 'high', rating: 4.9, reviews_count: 540, address: 'Piazza della Trinità dei Monti, 6, 00187 Roma RM', map_url: 'https://goo.gl/maps/hassler', promotions: 'Complimentary boat tour', availability: 'Year-round', amenities: 'Michelin Restaurant, Spa, Terrace' }
      ];
      const insert = db.prepare("INSERT INTO hotels (title, description, price, location, image, details, category, price_level, rating, reviews_count, address, map_url, promotions, availability, amenities) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      hotels.forEach(h => insert.run(h.title, h.description, h.price, h.location, h.image, h.details, h.category, h.price_level, h.rating, h.reviews_count, h.address, h.map_url, h.promotions, h.availability, h.amenities));
    }

    // Taxi
    const taxiCount = db.prepare("SELECT COUNT(*) as count FROM taxi_services").get().count;
    if (taxiCount === 0) {
      const taxis = [
        { title: 'Rome Elite Transfers', description: 'Luxury Mercedes S-Class.', price: 80, location: 'Rome', image: 'https://picsum.photos/seed/taxi1/800/600', details: 'Professional chauffeurs for airport transfers.', category: 'Transfer', price_level: 'medium', rating: 4.8, reviews_count: 150, address: 'Via di Priscilla, 101, 00199 Roma RM', map_url: 'https://goo.gl/maps/rome-taxi', promotions: 'Free water and Wi-Fi', availability: '24/7' },
        { title: 'Milan Fashion Limo', description: 'Sleek black limousine.', price: 150, location: 'Milan', image: 'https://picsum.photos/seed/taxi2/800/600', details: 'The most stylish way to arrive at Milan Fashion Week.', category: 'Luxury', price_level: 'high', rating: 4.9, reviews_count: 85, address: 'Via Montenapoleone, 1, 20121 Milano MI', map_url: 'https://goo.gl/maps/milan-taxi', promotions: 'Champagne on board', availability: 'By appointment' }
      ];
      const insert = db.prepare("INSERT INTO taxi_services (title, description, price, location, image, details, category, price_level, rating, reviews_count, address, map_url, promotions, availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      taxis.forEach(t => insert.run(t.title, t.description, t.price, t.location, t.image, t.details, t.category, t.price_level, t.rating, t.reviews_count, t.address, t.map_url, t.promotions, t.availability));
    }

    // Experiences
    const expCount = db.prepare("SELECT COUNT(*) as count FROM experiences").get().count;
    if (expCount === 0) {
      const exps = [
        { title: 'Cooking Class in Trastevere', description: 'Learn to make pasta from scratch.', price: 85, location: 'Rome', image: 'https://picsum.photos/seed/cooking/800/600', details: '3-hour workshop with a local chef.', category: 'Workshop', price_level: 'medium', rating: 4.7, reviews_count: 210, address: 'Via della Lungaretta, 121, 00153 Roma RM', map_url: 'https://goo.gl/maps/cooking-class', promotions: 'Recipe book included', availability: 'Mon-Sat 10:00, 17:00', duration: '3 hours' },
        { title: 'Hot Air Balloon over Tuscany', description: 'Breathtaking views of the rolling hills.', price: 250, location: 'Siena', image: 'https://picsum.photos/seed/balloon/800/600', details: 'Includes champagne breakfast upon landing.', category: 'Adventure', price_level: 'high', rating: 4.9, reviews_count: 120, address: 'Strada di Montalbuccio, 53100 Siena SI', map_url: 'https://goo.gl/maps/balloon', promotions: 'GoPro footage included', availability: 'Daily at Sunrise', duration: '4 hours' }
      ];
      const insert = db.prepare("INSERT INTO experiences (title, description, price, location, image, details, category, price_level, rating, reviews_count, address, map_url, promotions, availability, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      exps.forEach(e => insert.run(e.title, e.description, e.price, e.location, e.image, e.details, e.category, e.price_level, e.rating, e.reviews_count, e.address, e.map_url, e.promotions, e.availability, e.duration));
    }

    // Rentals
    const rentCount = db.prepare("SELECT COUNT(*) as count FROM rentals").get().count;
    if (rentCount === 0) {
      const rents = [
        { title: 'Vintage Vespa Rental', description: 'Explore Rome like a local.', price: 60, location: 'Rome', image: 'https://picsum.photos/seed/vespa/800/600', details: 'Includes helmets and insurance.', category: 'Scooter', price_level: 'low', rating: 4.6, reviews_count: 340, address: 'Via dei Cimatori, 15, 00186 Roma RM', map_url: 'https://goo.gl/maps/vespa-rental', promotions: 'Free city map', availability: 'Daily 9:00 - 19:00' },
        { title: 'Luxury Yacht Charter', description: 'Sail the Amalfi Coast.', price: 1200, location: 'Positano', image: 'https://picsum.photos/seed/yacht/800/600', details: 'Full day charter with crew and snacks.', category: 'Yacht', price_level: 'high', rating: 5, reviews_count: 45, address: 'Via Pasitea, 1, 84017 Positano SA', map_url: 'https://goo.gl/maps/yacht-charter', promotions: 'Snorkeling gear included', availability: 'May - Sept' }
      ];
      const insert = db.prepare("INSERT INTO rentals (title, description, price, location, image, details, category, price_level, rating, reviews_count, address, map_url, promotions, availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      rents.forEach(r => insert.run(r.title, r.description, r.price, r.location, r.image, r.details, r.category, r.price_level, r.rating, r.reviews_count, r.address, r.map_url, r.promotions, r.availability));
    }

    // Events
    const eventCount = db.prepare("SELECT COUNT(*) as count FROM events").get().count;
    if (eventCount === 0) {
      const evs = [
        { title: 'Opera at Verona Arena', description: 'A magical night under the stars.', price: 180, location: 'Verona', image: 'https://picsum.photos/seed/opera/800/600', details: 'Premium seats for Aida.', category: 'Music', price_level: 'high', rating: 4.9, reviews_count: 1200, address: 'Piazza Bra, 1, 37121 Verona VR', map_url: 'https://goo.gl/maps/verona-opera', promotions: 'Backstage tour for VIPs', availability: 'June - Sept' },
        { title: 'Milan Fashion Week Pass', description: 'Exclusive access to top shows.', price: 500, location: 'Milan', image: 'https://picsum.photos/seed/fashion/800/600', details: 'VIP entry to 3 major shows.', category: 'Fashion', price_level: 'high', rating: 4.8, reviews_count: 320, address: 'Via della Spiga, 20121 Milano MI', map_url: 'https://goo.gl/maps/milan-fashion', promotions: 'Gift bag included', availability: 'Feb & Sept' }
      ];
      const insert = db.prepare("INSERT INTO events (title, description, price, location, image, details, category, price_level, rating, reviews_count, address, map_url, promotions, availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      evs.forEach(e => insert.run(e.title, e.description, e.price, e.location, e.image, e.details, e.category, e.price_level, e.rating, e.reviews_count, e.address, e.map_url, e.promotions, e.availability));
    }

    // Demo Reviews
    const reviewCount = db.prepare("SELECT COUNT(*) as count FROM reviews").get().count;
    if (reviewCount === 0) {
      const demoReviews = [
        { user_id: 1, listing_id: 1, listing_type: 'tour', rating: 5, comment: 'Absolutely breathtaking! A must-see in Rome.', username: 'John Doe' },
        { user_id: 1, listing_id: 1, listing_type: 'tour', rating: 4, comment: 'Great experience, but a bit crowded.', username: 'Jane Smith' }
      ];
      const insert = db.prepare("INSERT INTO reviews (user_id, listing_id, listing_type, rating, comment, username) VALUES (?, ?, ?, ?, ?, ?)");
      demoReviews.forEach(r => insert.run(r.user_id, r.listing_id, r.listing_type, r.rating, r.comment, r.username));
    }

    // Courses
    const courseCount = db.prepare("SELECT COUNT(*) as count FROM courses").get().count;
    if (courseCount === 0) {
      const courses = [
        { title: 'Italian for Beginners', description: 'Learn the basics of Italian language.', image: 'https://picsum.photos/seed/italian/800/600' },
        { title: 'History of Rome', description: 'Discover the secrets of the Eternal City.', image: 'https://picsum.photos/seed/history/800/600' }
      ];
      const insert = db.prepare("INSERT INTO courses (title, description, image) VALUES (?, ?, ?)");
      courses.forEach(c => {
        const result = insert.run(c.title, c.description, c.image);
        const courseId = result.lastInsertRowid;
        db.prepare("INSERT INTO lessons (course_id, title, content, order_index) VALUES (?, ?, ?, ?)").run(courseId, 'Lesson 1', 'Welcome to the course!', 1);
      });
    }
  };
  seedData();

  // API Routes
  app.post("/api/register", async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: "Missing fields" });
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(email, hashedPassword, name);
      const user = { id: result.lastInsertRowid, email, name, role: 'user' };
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
      res.json({ user, token });
    } catch (err) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        const userToReturn = { id: user.id, email: user.email, name: user.name, role: user.role, avatar_url: user.avatar_url, wallet_balance: user.wallet_balance, bonus: user.bonus, status: user.status };
        console.log(`User logged in: ${user.email} (ID: ${user.id}, Role: ${user.role})`);
        res.json({ user: userToReturn, token });
      } else {
        console.warn(`Login failed for email: ${email}`);
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/users/me", authenticateToken, (req: any, res) => {
    const user = db.prepare("SELECT id, email, name, role, avatar_url, wallet_balance, bonus, status FROM users WHERE id = ?").get(req.user.id);
    res.json(user);
  });

  app.get("/api/user", authenticateToken, (req: any, res) => {
    const user = db.prepare("SELECT id, email, name, role, avatar_url, wallet_balance, bonus, status FROM users WHERE id = ?").get(req.user.id);
    res.json(user);
  });

  // Generic Listings Fetcher
  const fetchListings = (table: string, type: string) => {
    const items = db.prepare(`SELECT * FROM ${table}`).all();
    return items.map((item: any) => {
      const reviews: any = db.prepare("SELECT rating FROM reviews WHERE listing_id = ? AND listing_type = ?").all(item.id, type);
      const avgRating = reviews.length > 0 ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length : (item.rating || 0);
      return { 
        ...item, 
        type, 
        name: item.title,
        stars: Math.round(avgRating) || 4,
        rating: avgRating, 
        reviews_count: reviews.length || item.reviews_count || 0
      };
    });
  };

  app.get("/api/tours", (req, res) => res.json(fetchListings('tours', 'tour')));
  app.get("/api/restaurants", (req, res) => res.json(fetchListings('restaurants', 'restaurant')));
  app.get("/api/hotels", (req, res) => res.json(fetchListings('hotels', 'hotel')));
  app.get("/api/taxi", (req, res) => res.json(fetchListings('taxi_services', 'taxi')));
  app.get("/api/experiences", (req, res) => res.json(fetchListings('experiences', 'experience')));
  app.get("/api/rentals", (req, res) => res.json(fetchListings('rentals', 'rental')));
  app.get("/api/events", (req, res) => res.json(fetchListings('events', 'event')));

  app.get("/api/listings", (req, res) => {
    const tours = fetchListings('tours', 'tour');
    const restaurants = fetchListings('restaurants', 'restaurant');
    const hotels = fetchListings('hotels', 'hotel');
    const taxi = fetchListings('taxi_services', 'taxi');
    const experiences = fetchListings('experiences', 'experience');
    const rentals = fetchListings('rentals', 'rental');
    const events = fetchListings('events', 'event');
    res.json([...tours, ...restaurants, ...hotels, ...taxi, ...experiences, ...rentals, ...events]);
  });

  app.post("/api/reviews", authenticateToken, (req: any, res) => {
    const { listing_id, itemId, listing_type, type, rating, comment } = req.body;
    const finalId = listing_id || itemId;
    const finalType = listing_type || type;
    try {
      const result = db.prepare("INSERT INTO reviews (user_id, listing_id, listing_type, rating, comment, username) VALUES (?, ?, ?, ?, ?, ?)").run(
        req.user.id, finalId, finalType, rating, comment, req.user.name || 'Anonymous'
      );
      const newReview = db.prepare("SELECT *, username as user_name FROM reviews WHERE id = ?").get(result.lastInsertRowid);
      res.json(newReview);
    } catch (e: any) {
      console.error("Review Post Error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/reviews/:itemId", (req, res) => {
    const { type } = req.query;
    try {
      const reviews = db.prepare("SELECT *, username as user_name FROM reviews WHERE listing_id = ? AND listing_type = ? ORDER BY created_at DESC").all(req.params.itemId, type);
      res.json(reviews);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/bookings", authenticateToken, (req: any, res) => {
    const { listing_id, itemId, listing_type, type, date, guests, amount } = req.body;
    const finalId = listing_id || itemId;
    const finalType = listing_type || type;
    try {
      const result = db.prepare("INSERT INTO bookings (user_id, listing_id, listing_type, date, guests, amount) VALUES (?, ?, ?, ?, ?, ?)").run(
        req.user.id, finalId, finalType, date || new Date().toISOString(), guests || 1, amount
      );
      res.json({ id: result.lastInsertRowid, status: 'pending' });
    } catch (e: any) {
      console.error("Booking Post Error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Admin Panel
  app.get("/api/admin/stats", authenticateToken, isAdminMiddleware, (req, res) => {
    try {
      const users = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
      const bookings = db.prepare("SELECT COUNT(*) as count FROM bookings").get().count;
      const revenue = db.prepare("SELECT SUM(amount) as total FROM bookings WHERE status = 'confirmed'").get().total || 0;
      res.json({ users, bookings, revenue });
    } catch (error) {
      console.error("Admin Stats Fetch Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/admin/notifications", authenticateToken, isAdminMiddleware, (req, res) => {
    try {
      const notifications = db.prepare("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50").all();
      res.json(notifications);
    } catch (error) {
      console.error("Admin Notifications Fetch Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/admin/notifications/read", authenticateToken, isAdminMiddleware, (req, res) => {
    try {
      db.prepare("UPDATE notifications SET read = 1").run();
      res.json({ success: true });
    } catch (error) {
      console.error("Admin Notifications Read Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/admin/bookings", authenticateToken, isAdminMiddleware, (req, res) => {
    try {
      const bookings = db.prepare(`
        SELECT b.*, u.name as user_name, u.email as user_email 
        FROM bookings b 
        JOIN users u ON b.user_id = u.id 
        ORDER BY b.created_at DESC
      `).all();
      res.json(bookings);
    } catch (error) {
      console.error("Admin Bookings Fetch Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/admin/listings", authenticateToken, isAdminMiddleware, (req, res) => {
    try {
      const tours = db.prepare("SELECT *, 'tour' as type FROM tours").all();
      const restaurants = db.prepare("SELECT *, 'restaurant' as type FROM restaurants").all();
      const hotels = db.prepare("SELECT *, 'hotel' as type FROM hotels").all();
      const taxi = db.prepare("SELECT *, 'taxi' as type FROM taxi_services").all();
      res.json([...tours, ...restaurants, ...hotels, ...taxi]);
    } catch (error) {
      console.error("Admin Listings Fetch Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Learning Platform Routes
  app.get("/api/courses", (req, res) => {
    const courses = db.prepare("SELECT * FROM courses").all();
    res.json(courses);
  });

  app.get("/api/courses/:id", (req, res) => {
    const course = db.prepare("SELECT * FROM courses WHERE id = ?").get(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    const lessons = db.prepare("SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC").all(req.params.id);
    res.json({ ...course, lessons });
  });

  app.get("/api/user/progress", authenticateToken, (req: any, res) => {
    try {
      const user = req.user;
      if (!user || !user.id) {
        console.warn("Progress fetch failed: No user ID in token");
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const progress = db.prepare(`
        SELECT p.*, c.title as course_title, l.title as lesson_title 
        FROM user_progress p
        JOIN courses c ON p.course_id = c.id
        JOIN lessons l ON p.lesson_id = l.id
        WHERE p.user_id = ?
      `).all(user.id);
      res.json(progress);
    } catch (error) {
      console.error("Progress Fetch Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Messages
  app.get("/api/messages", authenticateToken, (req: any, res) => {
    const messages = db.prepare(`
      SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.receiver_id = ? OR m.sender_id = ?
      ORDER BY m.created_at DESC
    `).all(req.user.id, req.user.id);
    res.json(messages);
  });

  app.post("/api/messages", authenticateToken, (req: any, res) => {
    const { receiverId, content } = req.body;
    db.prepare("INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)").run(req.user.id, receiverId, content);
    res.json({ success: true });
  });

  // Admin Panel Extended
  app.get("/api/admin/users", authenticateToken, isAdminMiddleware, (req, res) => {
    try {
      res.json(db.prepare("SELECT id, email, name, role, disabled, last_login, created_at FROM users").all());
    } catch (error) {
      console.error("Admin Users Fetch Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/admin/users/:id/status", authenticateToken, isAdminMiddleware, (req, res) => {
    const { disabled } = req.body;
    db.prepare("UPDATE users SET disabled = ? WHERE id = ?").run(disabled ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/users/:id/role", authenticateToken, isAdminMiddleware, (req, res) => {
    const { role } = req.body;
    db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/listings", authenticateToken, isAdminMiddleware, (req, res) => {
    const { id, type, name, title, location, price, stars, rating, description, image, category, price_level } = req.body;
    const tableMap: any = { tour: 'tours', restaurant: 'restaurants', hotel: 'hotels', taxi: 'taxi_services', experience: 'experiences', rental: 'rentals', event: 'events' };
    const table = tableMap[type];
    if (!table) return res.status(400).json({ error: "Invalid type" });

    const finalTitle = title || name;
    const finalRating = rating || stars || 5;

    if (id) {
      db.prepare(`UPDATE ${table} SET title = ?, location = ?, price = ?, rating = ?, description = ?, image = ?, category = ?, price_level = ? WHERE id = ?`).run(
        finalTitle, location, price, finalRating, description, image, category, price_level, id
      );
    } else {
      db.prepare(`INSERT INTO ${table} (title, location, price, rating, description, image, category, price_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
        finalTitle, location, price, finalRating, description, image, category, price_level
      );
    }
    res.json({ success: true });
  });

  app.get("/api/admin/logs", authenticateToken, isAdminMiddleware, (req, res) => {
    const logs = db.prepare(`
      SELECT l.*, u.name as user_name, u.email as user_email
      FROM activity_logs l 
      JOIN users u ON l.user_id = u.id 
      ORDER BY l.created_at DESC LIMIT 100
    `).all();
    res.json(logs);
  });

  app.get("/api/admin/logs/activity", authenticateToken, isAdminMiddleware, (req, res) => {
    const logs = db.prepare(`
      SELECT l.*, u.name as user_name, u.email as user_email
      FROM activity_logs l 
      JOIN users u ON l.user_id = u.id 
      ORDER BY l.created_at DESC LIMIT 100
    `).all();
    res.json(logs);
  });

  app.get("/api/admin/logs/admin", authenticateToken, isAdminMiddleware, (req, res) => {
    // For now return empty as we don't have a separate admin_logs table yet
    res.json([]);
  });

  app.get("/api/admin/analytics/activity", authenticateToken, isAdminMiddleware, (req, res) => {
    const stats = db.prepare(`
      SELECT date(created_at) as date, COUNT(*) as count 
      FROM activity_logs 
      GROUP BY date(created_at) 
      ORDER BY date DESC LIMIT 30
    `).all();
    res.json(stats.reverse());
  });

  app.get("/api/admin/messages", authenticateToken, isAdminMiddleware, (req, res) => {
    const messages = db.prepare(`
      SELECT m.*, u.name as sender_name, u.avatar_url 
      FROM admin_messages m 
      JOIN users u ON m.sender_id = u.id 
      ORDER BY m.created_at ASC LIMIT 100
    `).all();
    res.json(messages);
  });

  app.post("/api/admin/messages", authenticateToken, isAdminMiddleware, (req: any, res) => {
    const { message } = req.body;
    const result = db.prepare("INSERT INTO admin_messages (sender_id, message) VALUES (?, ?)").run(req.user.id, message);
    const newMessage = db.prepare(`
      SELECT m.*, u.name as sender_name, u.avatar_url 
      FROM admin_messages m 
      JOIN users u ON m.sender_id = u.id 
      WHERE m.id = ?
    `).get(result.lastInsertRowid);
    
    // Broadcast to other admins
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'admin_chat', message: newMessage }));
      }
    });
    
    res.json(newMessage);
  });

  app.delete("/api/admin/listings/:id", authenticateToken, isAdminMiddleware, (req, res) => {
    const { id } = req.params;
    const tables = ['tours', 'restaurants', 'hotels', 'taxi_services'];
    let deleted = false;
    
    for (const table of tables) {
      const result = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
      if (result.changes > 0) {
        deleted = true;
        break;
      }
    }
    
    if (deleted) {
      notifyAdmins('system', `Listing ID ${id} was deleted by ${(req as any).user.name}`);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Listing not found" });
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

  app.post("/api/redeem", authenticateToken, (req: any, res) => {
    const { offerId, cost } = req.body;
    const user = db.prepare("SELECT bonus FROM users WHERE id = ?").get(req.user.id);
    if (user.bonus < cost) return res.status(400).json({ error: "Insufficient points" });
    
    db.prepare("UPDATE users SET bonus = bonus - ? WHERE id = ?").run(cost, req.user.id);
    res.json({ success: true });
  });

  app.post("/api/game-win", authenticateToken, (req: any, res) => {
    db.prepare("UPDATE users SET last_game_win = CURRENT_TIMESTAMP, bonus = bonus + 50 WHERE id = ?").run(req.user.id);
    res.json({ success: true });
  });

  app.post("/api/log-activity", authenticateToken, (req: any, res) => {
    const { action, page } = req.body;
    db.prepare("INSERT INTO activity_logs (user_id, action, page, ip, user_agent) VALUES (?, ?, ?, ?, ?)").run(
      req.user.id, action, page, req.ip, req.get('user-agent')
    );
    res.json({ success: true });
  });

  // Social & Learning Extras
  app.get("/api/friends", authenticateToken, (req, res) => res.json([]));
  app.get("/api/mentors", authenticateToken, (req, res) => res.json([]));
  app.post("/api/mentors/follow", authenticateToken, (req, res) => res.json({ success: true }));
  app.get("/api/tasks", authenticateToken, (req, res) => res.json([]));
  app.get("/api/search", (req, res) => {
    const { q } = req.query;
    // Simple search across all listings
    const tours = fetchListings('tours', 'tour').filter((l: any) => l.name.toLowerCase().includes(String(q).toLowerCase()));
    const restaurants = fetchListings('restaurants', 'restaurant').filter((l: any) => l.name.toLowerCase().includes(String(q).toLowerCase()));
    const hotels = fetchListings('hotels', 'hotel').filter((l: any) => l.name.toLowerCase().includes(String(q).toLowerCase()));
    res.json([...tours, ...restaurants, ...hotels]);
  });

  // User Profile
  app.post("/api/user/profile", authenticateToken, (req: any, res) => {
    const { name, avatar_url } = req.body;
    try {
      db.prepare("UPDATE users SET name = ?, avatar_url = ? WHERE id = ?").run(
        name, avatar_url, req.user.id
      );
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
      res.json(user);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Bookings
  app.get("/api/bookings", authenticateToken, (req: any, res) => {
    const bookings = db.prepare("SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
    res.json(bookings);
  });

  // Reviews
  app.get("/api/reviews/:itemId", (req, res) => {
    const { type } = req.query;
    let query = `
      SELECT r.*, u.name as user_name 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.listing_id = ? 
    `;
    const params: any[] = [req.params.itemId];
    
    if (type) {
      query += " AND r.listing_type = ?";
      params.push(type);
    }
    
    query += " ORDER BY r.created_at DESC";
    
    const reviews = db.prepare(query).all(...params);
    res.json(reviews);
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/:type/:id", (req, res) => {
    const { type, id } = req.params;
    const tableMap: any = { 
      tours: 'tours', 
      restaurants: 'restaurants', 
      hotels: 'hotels', 
      taxi: 'taxi_services',
      experiences: 'experiences',
      rentals: 'rentals',
      events: 'events'
    };
    const table = tableMap[type];
    if (!table) return res.status(404).json({ error: "Not found" });
    const item: any = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
    if (!item) return res.status(404).json({ error: "Not found" });
    const reviews = db.prepare("SELECT * FROM reviews WHERE listing_id = ? AND listing_type = ? ORDER BY created_at DESC").all(id, type.slice(0, -1));
    res.json({ ...item, reviews });
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
    console.log('Closing server and database...');
    server.close(() => {
      db.close();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
