import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

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
    bonus INTEGER DEFAULT 0
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
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Seed user if not exists
  const seedUser = db.prepare("SELECT * FROM users WHERE email = ?").get("demo@italiago.com");
  if (!seedUser) {
    db.prepare("INSERT INTO users (email, password, name, wallet_balance, bonus) VALUES (?, ?, ?, ?, ?)").run(
      "demo@italiago.com",
      "password123",
      "Marco Rossi",
      120.0,
      500
    );
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

  app.get("/api/user", (req, res) => {
    // In a real app, we'd use sessions/JWT. For now, just return the first user or null.
    const user = db.prepare("SELECT * FROM users LIMIT 1").get();
    res.json(user);
  });

  app.get("/api/bookings", (req, res) => {
    const bookings = db.prepare("SELECT * FROM bookings ORDER BY created_at DESC").all();
    res.json(bookings);
  });

  app.post("/api/bookings", (req, res) => {
    const { type, itemName, details, amount } = req.body;
    const user = db.prepare("SELECT id FROM users LIMIT 1").get();
    
    const result = db.prepare(
      "INSERT INTO bookings (user_id, type, item_name, details, amount) VALUES (?, ?, ?, ?, ?)"
    ).run(user.id, type, itemName, details, amount);

    res.json({ id: result.lastInsertRowid, status: "confirmed" });
  });

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

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

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
