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
  
  db.run(`CREATE TABLE IF NOT EXISTS anime (
    id INTEGER PRIMARY KEY, 
    title TEXT, 
    synopsis TEXT, 
    episodes INTEGER, 
    score REAL, 
    status TEXT, 
    user_id INTEGER, 
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

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