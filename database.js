const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create data directory if it doesn't exist
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Use a file-based database instead of :memory:
const dbPath = path.join(dataDir, 'anime.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to database at:', dbPath);
  }
});

db.serialize(() => {
  // Create tables if they don't exist
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY, 
    username TEXT UNIQUE, 
    password TEXT
  )`);
  
  // Create anime table first
  db.run(`CREATE TABLE IF NOT EXISTS anime (
    id INTEGER PRIMARY KEY, 
    title TEXT, 
    synopsis TEXT, 
    episodes INTEGER, 
    score REAL, 
    status TEXT, 
    current_episode INTEGER,
    total_episodes INTEGER,
    mal_id INTEGER,
    jikan_status TEXT,
    image_url TEXT,
    rating REAL,
    genres TEXT,
    user_id INTEGER, 
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Create anime_history table with explicit creation date
  db.run(`CREATE TABLE IF NOT EXISTS anime_history (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    anime_id INTEGER,
    episode_count INTEGER DEFAULT 1,
    updated_at DATETIME DEFAULT (datetime('now','localtime')),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(anime_id) REFERENCES anime(id)
  )`);

  // Create reviews table
  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mal_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (mal_id) REFERENCES anime (mal_id)
    )
  `);

  // Create favorites table
  db.run(`CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    anime_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(anime_id) REFERENCES anime(id),
    UNIQUE(user_id, anime_id)
  )`);

  // Add migration to ensure all columns exist
  db.all(`PRAGMA table_info(anime)`, (err, rows) => {
    if (err) {
      console.error('Error checking table structure:', err);
      return;
    }

    if (!rows || rows.length === 0) {
      console.error('No columns found in the anime table');
      return;
    }

    const columns = rows.map(row => row.name);
    const requiredColumns = ['current_episode', 'total_episodes', 'mal_id', 'jikan_status', 'image_url', 'rating', 'genres'];

    requiredColumns.forEach(column => {
      if (!columns.includes(column)) {
        const columnType = column === 'image_url' ? 'TEXT' : column === 'rating' ? 'REAL' : 'INTEGER';
        db.run(`ALTER TABLE anime ADD COLUMN ${column} ${columnType}`, (alterErr) => {
          if (alterErr) {
            console.error(`Error adding column ${column}:`, alterErr);
          } else {
            console.log(`Added missing column: ${column}`);
          }
        });
      }
    });
  });

  console.log("Database tables ready.");
});

// Handle cleanup on app termination
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

module.exports = db;