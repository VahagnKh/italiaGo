import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";

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
    last_login DATETIME
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

  CREATE TABLE IF NOT EXISTS admin_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER,
    action TEXT,
    target_id TEXT,
    old_value TEXT,
    new_value TEXT,
    ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT, -- 'security', 'registration', 'system', 'role_change'
    message TEXT,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS failed_logins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    instructor TEXT,
    image TEXT,
    category TEXT,
    total_lessons INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER,
    title TEXT,
    video_url TEXT,
    duration TEXT,
    order_index INTEGER,
    FOREIGN KEY(course_id) REFERENCES courses(id)
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    course_id INTEGER,
    lesson_id INTEGER,
    status TEXT DEFAULT 'started', -- 'started', 'completed'
    last_watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(course_id) REFERENCES courses(id),
    FOREIGN KEY(lesson_id) REFERENCES lessons(id)
  );

  CREATE TABLE IF NOT EXISTS mentors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    role TEXT,
    avatar TEXT,
    bio TEXT
  );

  CREATE TABLE IF NOT EXISTS user_mentors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    mentor_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(mentor_id) REFERENCES mentors(id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER,
    title TEXT,
    description TEXT,
    due_date DATETIME,
    FOREIGN KEY(course_id) REFERENCES courses(id)
  );

  CREATE TABLE IF NOT EXISTS user_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    task_id INTEGER,
    status TEXT DEFAULT 'pending', -- 'pending', 'submitted', 'graded'
    submission_url TEXT,
    grade TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(task_id) REFERENCES tasks(id)
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

  CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    friend_id INTEGER,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted'
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(friend_id) REFERENCES users(id)
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
  if (!columnNames.includes('avatar_url')) {
    db.prepare("ALTER TABLE users ADD COLUMN avatar_url TEXT").run();
  }
  if (!columnNames.includes('disabled')) {
    db.prepare("ALTER TABLE users ADD COLUMN disabled INTEGER DEFAULT 0").run();
  }
  if (!columnNames.includes('last_login')) {
    db.prepare("ALTER TABLE users ADD COLUMN last_login DATETIME").run();
  }
} catch (error) {
  console.error("Migration Error:", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(session({
    secret: "italiago-secret-key-2026",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Helper to get current user
  const getCurrentUser = (req: express.Request) => {
    if (!req.session.userId) return null;
    return db.prepare("SELECT * FROM users WHERE id = ?").get(req.session.userId);
  };

  // Middleware to attach user to request
  app.use((req, res, next) => {
    (req as any).user = getCurrentUser(req);
    next();
  });

  // Activity Tracking Middleware
  app.use((req, res, next) => {
    const user = (req as any).user;
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

  // Seed user if not exists
  const seedUser = db.prepare("SELECT * FROM users WHERE email = ?").get("demo@italiago.com");
  if (!seedUser) {
    db.prepare("INSERT INTO users (email, password, name, wallet_balance, bonus, has_purchased, role) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      "demo@italiago.com",
      "password123",
      "Marco Rossi",
      0.0,
      0,
      0,
      "admin"
    );
  } else {
    // Ensure demo user is admin if they already exist
    db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run("demo@italiago.com");
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

  // Seed Learning Platform Data
  const courseCount = db.prepare("SELECT COUNT(*) as count FROM courses").get().count;
  if (courseCount === 0) {
    const insertCourse = db.prepare(`
      INSERT INTO courses (title, description, instructor, image, category, total_lessons)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const insertLesson = db.prepare(`
      INSERT INTO lessons (course_id, title, video_url, duration, order_index)
      VALUES (?, ?, ?, ?, ?)
    `);
    const insertMentor = db.prepare(`
      INSERT INTO mentors (name, role, avatar, bio)
      VALUES (?, ?, ?, ?)
    `);

    const courses = [
      { title: "Beginner's Guide To Becoming A Professional Frontend Developer", description: "Learn React, Tailwind, and more.", instructor: "Prashant Kumar Singh", image: "https://picsum.photos/seed/frontend/800/600", category: "FRONTEND", total_lessons: 8 },
      { title: "Understanding Concept Of React", description: "Deep dive into hooks and state.", instructor: "Ravi Kumar", image: "https://picsum.photos/seed/react/800/600", category: "FRONTEND", total_lessons: 5 },
      { title: "Product Design Masterclass", description: "UI/UX principles for modern apps.", instructor: "Sarah Jenkins", image: "https://picsum.photos/seed/design/800/600", category: "DESIGN", total_lessons: 10 }
    ];

    courses.forEach(c => {
      const result = insertCourse.run(c.title, c.description, c.instructor, c.image, c.category, c.total_lessons);
      const courseId = result.lastInsertRowid;
      for (let i = 1; i <= c.total_lessons; i++) {
        insertLesson.run(courseId, `Lesson ${i}: Introduction to ${c.category}`, "https://www.youtube.com/embed/dQw4w9WgXcQ", "10:00", i);
      }
    });

    const mentors = [
      { name: "Prashant Kumar Singh", role: "Software Developer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Prashant", bio: "Expert in React and Node.js" },
      { name: "Sarah Jenkins", role: "Product Designer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", bio: "Lead Designer at TechCorp" },
      { name: "Ravi Kumar", role: "Fullstack Engineer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi", bio: "Open source contributor" }
    ];

    mentors.forEach(m => insertMentor.run(m.name, m.role, m.avatar, m.bio));

    console.log("Seeded learning platform data.");
  }

  // API Routes
  app.post("/api/register", (req, res) => {
    const { email, password, name } = req.body;
    try {
      // Check if this is the first user (excluding demo user)
      const userCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE email != 'demo@italiago.com'").get().count;
      const role = userCount === 0 ? 'admin' : 'user';

      const result = db.prepare("INSERT INTO users (email, password, name, wallet_balance, bonus, role) VALUES (?, ?, ?, ?, ?, ?)").run(
        email,
        password,
        name,
        0.0,
        0,
        role
      );
      req.session.userId = result.lastInsertRowid as number;
      
      // Notify admins
      db.prepare("INSERT INTO notifications (type, message) VALUES ('registration', ?)").run(`New user registered: ${email} as ${role}`);
      
      res.json(db.prepare("SELECT * FROM users WHERE id = ?").get(req.session.userId));
    } catch (error) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    
    if (user && user.disabled) {
      return res.status(403).json({ error: "Account is disabled. Please contact support." });
    }

    // Check for rate limiting / failed attempts
    const recentFailures = db.prepare("SELECT COUNT(*) as count FROM failed_logins WHERE email = ? AND created_at > datetime('now', '-15 minutes')").get(email);
    if (recentFailures.count >= 5) {
      return res.status(429).json({ error: "Too many failed attempts. Account locked for 15 minutes." });
    }

    if (user && user.password === password) {
      req.session.userId = user.id;
      db.prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?").run(user.id);
      db.prepare("INSERT INTO activity_logs (user_id, action, page, ip) VALUES (?, 'LOGIN', '/', ?)").run(user.id, req.ip);
      res.json(user);
    } else {
      db.prepare("INSERT INTO failed_logins (email, ip) VALUES (?, ?)").run(email, req.ip);
      
      // If 5th failure, notify admins
      if (recentFailures.count === 4) {
        db.prepare("INSERT INTO notifications (type, message) VALUES ('security', ?)").run(`Multiple failed login attempts for ${email}`);
      }
      
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

  app.get("/api/user/progress", (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const progress = db.prepare(`
      SELECT p.*, c.title as course_title, l.title as lesson_title 
      FROM user_progress p
      JOIN courses c ON p.course_id = c.id
      JOIN lessons l ON p.lesson_id = l.id
      WHERE p.user_id = ?
    `).all(user.id);
    res.json(progress);
  });

  app.post("/api/user/progress", (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const { courseId, lessonId, status } = req.body;
    
    const existing = db.prepare("SELECT id FROM user_progress WHERE user_id = ? AND course_id = ? AND lesson_id = ?").get(user.id, courseId, lessonId);
    
    if (existing) {
      db.prepare("UPDATE user_progress SET status = ?, last_watched_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, existing.id);
    } else {
      db.prepare("INSERT INTO user_progress (user_id, course_id, lesson_id, status) VALUES (?, ?, ?, ?)").run(user.id, courseId, lessonId, status);
    }
    res.json({ success: true });
  });

  app.get("/api/mentors", (req, res) => {
    const mentors = db.prepare("SELECT * FROM mentors").all();
    const user = (req as any).user;
    if (user) {
      const followed = db.prepare("SELECT mentor_id FROM user_mentors WHERE user_id = ?").all(user.id).map((m: any) => m.mentor_id);
      res.json(mentors.map((m: any) => ({ ...m, isFollowed: followed.includes(m.id) })));
    } else {
      res.json(mentors);
    }
  });

  app.post("/api/mentors/follow", (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const { mentorId } = req.body;
    
    const existing = db.prepare("SELECT id FROM user_mentors WHERE user_id = ? AND mentor_id = ?").get(user.id, mentorId);
    if (existing) {
      db.prepare("DELETE FROM user_mentors WHERE id = ?").run(existing.id);
      res.json({ followed: false });
    } else {
      db.prepare("INSERT INTO user_mentors (user_id, mentor_id) VALUES (?, ?)").run(user.id, mentorId);
      res.json({ followed: true });
    }
  });

  app.get("/api/tasks", (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const tasks = db.prepare(`
      SELECT t.*, ut.status, ut.grade, c.title as course_title
      FROM tasks t
      JOIN courses c ON t.course_id = c.id
      LEFT JOIN user_tasks ut ON t.id = ut.task_id AND ut.user_id = ?
    `).all(user.id);
    res.json(tasks);
  });

  app.get("/api/messages", (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const messages = db.prepare(`
      SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.receiver_id = ? OR m.sender_id = ?
      ORDER BY m.created_at DESC
    `).all(user.id, user.id);
    res.json(messages);
  });

  app.post("/api/messages", (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const { receiverId, content } = req.body;
    db.prepare("INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)").run(user.id, receiverId, content);
    res.json({ success: true });
  });

  app.get("/api/friends", (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const friends = db.prepare(`
      SELECT u.id, u.name, u.avatar_url, u.role, f.status
      FROM friends f
      JOIN users u ON (f.user_id = u.id OR f.friend_id = u.id)
      WHERE (f.user_id = ? OR f.friend_id = ?) AND u.id != ?
    `).all(user.id, user.id, user.id);
    res.json(friends);
  });

  app.get("/api/search", (req, res) => {
    const query = req.query.q as string;
    if (!query) return res.json({ courses: [], mentors: [] });
    
    const courses = db.prepare("SELECT * FROM courses WHERE title LIKE ? OR description LIKE ?").all(`%${query}%`, `%${query}%`);
    const mentors = db.prepare("SELECT * FROM mentors WHERE name LIKE ? OR role LIKE ?").all(`%${query}%`, `%${query}%`);
    
    res.json({ courses, mentors });
  });

  app.post("/api/admin/listings", (req, res) => {
    const currentUser: any = (req as any).user;
    if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });

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

  app.get("/api/admin/users", (req, res) => {
    const currentUser: any = (req as any).user;
    if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
    
    const users = db.prepare("SELECT * FROM users").all();
    res.json(users);
  });

  app.post("/api/admin/users/:id/role", (req, res) => {
    const currentUser: any = (req as any).user;
    if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
    
    const { role } = req.body;
    const targetUser: any = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
    
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, req.params.id);
    
    db.prepare(`
      INSERT INTO admin_logs (admin_id, action, target_id, old_value, new_value, ip)
      VALUES (?, 'ROLE_CHANGE', ?, ?, ?, ?)
    `).run(currentUser.id, req.params.id, targetUser.role, role, req.ip);

    db.prepare("INSERT INTO notifications (type, message) VALUES ('role_change', ?)").run(`User ${targetUser.email} role changed from ${targetUser.role} to ${role}`);

    res.json({ success: true });
  });

  app.post("/api/admin/users/:id/status", (req, res) => {
    const currentUser: any = (req as any).user;
    if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
    
    const { disabled } = req.body;
    db.prepare("UPDATE users SET disabled = ? WHERE id = ?").run(disabled ? 1 : 0, req.params.id);
    
    db.prepare(`
      INSERT INTO admin_logs (admin_id, action, target_id, new_value, ip)
      VALUES (?, 'STATUS_CHANGE', ?, ?, ?)
    `).run(currentUser.id, req.params.id, disabled ? 'DISABLED' : 'ENABLED', req.ip);

    res.json({ success: true });
  });

  app.get("/api/admin/logs/activity", (req, res) => {
    const currentUser: any = (req as any).user;
    if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
    
    const logs = db.prepare(`
      SELECT l.*, u.name as user_name, u.email as user_email 
      FROM activity_logs l 
      JOIN users u ON l.user_id = u.id 
      ORDER BY l.created_at DESC LIMIT 100
    `).all();
    res.json(logs);
  });

  app.get("/api/admin/logs/admin", (req, res) => {
    const currentUser: any = (req as any).user;
    if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
    
    const logs = db.prepare(`
      SELECT l.*, u.name as admin_name 
      FROM admin_logs l 
      JOIN users u ON l.admin_id = u.id 
      ORDER BY l.created_at DESC LIMIT 100
    `).all();
    res.json(logs);
  });

  app.get("/api/admin/notifications", (req, res) => {
    const currentUser: any = (req as any).user;
    if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
    
    const notifications = db.prepare("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50").all();
    res.json(notifications);
  });

  app.post("/api/admin/notifications/read", (req, res) => {
    const currentUser: any = (req as any).user;
    if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
    
    db.prepare("UPDATE notifications SET read = 1").run();
    res.json({ success: true });
  });

  app.get("/api/admin/analytics/activity", (req, res) => {
    const currentUser: any = (req as any).user;
    if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
    
    const dailyActivity = db.prepare(`
      SELECT date(created_at) as date, count(*) as count 
      FROM activity_logs 
      WHERE created_at > date('now', '-30 days')
      GROUP BY date(created_at)
    `).all();
    
    res.json(dailyActivity);
  });

  app.get("/api/admin/messages", (req, res) => {
    const currentUser: any = (req as any).user;
    if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
    
    const messages = db.prepare(`
      SELECT m.*, u.name as sender_name, u.avatar_url 
      FROM admin_messages m 
      JOIN users u ON m.sender_id = u.id 
      ORDER BY m.created_at ASC LIMIT 50
    `).all();
    res.json(messages);
  });

  app.post("/api/admin/messages", (req, res) => {
    const currentUser: any = (req as any).user;
    if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
    
    const { message } = req.body;
    db.prepare("INSERT INTO admin_messages (sender_id, message) VALUES (?, ?)").run(currentUser.id, message);
    res.json({ success: true });
  });

  app.get("/api/admin/bookings", (req, res) => {
    const currentUser: any = (req as any).user;
    if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
    
    const bookings = db.prepare(`
      SELECT b.*, u.name as user_name 
      FROM bookings b 
      JOIN users u ON b.user_id = u.id 
      ORDER BY b.created_at DESC
    `).all();
    res.json(bookings);
  });

  app.delete("/api/admin/listings/:id", (req, res) => {
    const currentUser: any = (req as any).user;
    if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });

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
    res.json((req as any).user);
  });

  app.post("/api/log-activity", (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    
    const { action, page, details } = req.body;
    try {
      db.prepare(`
        INSERT INTO activity_logs (user_id, action, page, details, ip, user_agent)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        user.id,
        action,
        page,
        details ? JSON.stringify(details) : null,
        req.ip,
        req.get('user-agent')
      );
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/logout", (req, res) => {
    const user = (req as any).user;
    if (user) {
      db.prepare("INSERT INTO activity_logs (user_id, action, page, ip) VALUES (?, 'LOGOUT', '/', ?)").run(user.id, req.ip);
    }
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: "Could not log out" });
      res.json({ success: true });
    });
  });

  app.post("/api/user/profile", (req, res) => {
    const currentUser: any = (req as any).user;
    if (!currentUser) return res.status(401).json({ error: "Unauthorized" });
    const { name, avatar_url } = req.body;
    
    try {
      db.prepare("UPDATE users SET name = ?, avatar_url = ? WHERE id = ?").run(
        name || currentUser.name,
        avatar_url || currentUser.avatar_url,
        currentUser.id
      );
      res.json(db.prepare("SELECT * FROM users WHERE id = ?").get(currentUser.id));
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/bookings", (req, res) => {
    const currentUser: any = (req as any).user;
    if (!currentUser) return res.status(401).json({ error: "Unauthorized" });
    const bookings = db.prepare("SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC").all(currentUser.id);
    res.json(bookings);
  });

  app.post("/api/bookings", (req, res) => {
    const { type, itemName, details, amount, pointsUsed, minigameDiscount } = req.body;
    const currentUser: any = (req as any).user;
    if (!currentUser) return res.status(401).json({ error: "Unauthorized" });
    
    const user = db.prepare("SELECT id, bonus, total_spent FROM users WHERE id = ?").get(currentUser.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    let baseAmount = amount;
    if (minigameDiscount) {
      baseAmount = amount * 0.9; // 10% discount
    }

    const discount = pointsUsed ? Math.min(pointsUsed / 10, baseAmount) : 0; // 10 points = €1
    const finalAmount = baseAmount - discount;
    
    // Calculate 15% bonus on the final paid amount
    const bonusEarned = Math.floor(finalAmount * 0.15);
    
    let bookingId: number | bigint = 0;
    db.transaction(() => {
      const result = db.prepare(
        "INSERT INTO bookings (user_id, type, item_name, details, amount) VALUES (?, ?, ?, ?, ?)"
      ).run(user.id, type, itemName, details, finalAmount);
      bookingId = result.lastInsertRowid;

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

    res.json({ id: bookingId, status: "confirmed", bonusEarned, finalAmount });
  });

  app.post("/api/game-win", (req, res) => {
    const currentUser: any = (req as any).user;
    if (!currentUser) return res.status(401).json({ error: "Unauthorized" });
    db.prepare("UPDATE users SET last_game_win = CURRENT_TIMESTAMP WHERE id = ?").run(currentUser.id);
    res.json({ status: "ok" });
  });

  app.get("/api/offers", (req, res) => {
    const currentUser: any = (req as any).user;
    if (!currentUser) return res.json([]);

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
    const currentUser: any = (req as any).user;
    if (!currentUser) return res.status(401).json({ error: "Unauthorized" });
    
    const pointsToDeduct = Number(points);
    if (isNaN(pointsToDeduct) || pointsToDeduct <= 0) {
      return res.status(400).json({ error: "Invalid points amount" });
    }

    const user = db.prepare("SELECT id, bonus FROM users WHERE id = ?").get(currentUser.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.bonus < pointsToDeduct) {
      return res.status(400).json({ error: "Insufficient bonus points" });
    }

    try {
      db.prepare("UPDATE users SET bonus = bonus - ? WHERE id = ?").run(pointsToDeduct, user.id);
      res.json({ success: true, newBonus: user.bonus - pointsToDeduct });
    } catch (err) {
      res.status(500).json({ error: "Failed to update bonus points" });
    }
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
    const { itemId, rating, comment } = req.body;
    const currentUser: any = (req as any).user;
    if (!currentUser) return res.status(401).json({ error: "Unauthorized" });
    
    if (!itemId || !rating || !comment) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    try {
      const result = db.prepare("INSERT INTO reviews (user_id, item_id, rating, comment) VALUES (?, ?, ?, ?)").run(currentUser.id, itemId, rating, comment);
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
      if (roomId && games.has(roomId)) {
        const game = games.get(roomId)!;
        game.players.forEach(p => { if (p !== ws) p.send(JSON.stringify({ type: 'opponentLeft' })); });
        games.delete(roomId);
      }
    });
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
