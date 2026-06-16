const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const dbFile = process.env.DB_FILE || "./data/secure_notes.sqlite";
const resolvedDbFile = path.resolve(dbFile);
const dbDir = path.dirname(resolvedDbFile);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(resolvedDbFile);

function initializeDatabase() {
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

module.exports = {
  db,
  initializeDatabase
};
