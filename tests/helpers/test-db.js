const { db, initializeDatabase } = require("../../src/db/database");

function resetDatabase() {
  initializeDatabase();

  db.prepare("DELETE FROM notes").run();
  db.prepare("DELETE FROM users").run();

  db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('users', 'notes')").run();
}

module.exports = {
  resetDatabase
};