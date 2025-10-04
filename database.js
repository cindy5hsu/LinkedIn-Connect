const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './database.sqlite';

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
        this.initializeTables();
      }
    });
  }

  initializeTables() {
    // Create users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create linked_accounts table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS linked_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        provider TEXT NOT NULL,
        account_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(user_id, provider, account_id)
      )
    `);

    console.log('Database tables initialized');
  }

  // Get or create user
  async getOrCreateUser(email) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (row) {
          resolve(row);
        } else {
          // Create new user
          this.db.run('INSERT INTO users (email) VALUES (?)', [email], function(err) {
            if (err) {
              reject(err);
              return;
            }
            resolve({ id: this.lastID, email });
          });
        }
      });
    });
  }

  // Save linked account
  async saveLinkedAccount(userId, provider, accountId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT OR REPLACE INTO linked_accounts (user_id, provider, account_id) VALUES (?, ?, ?)',
        [userId, provider, accountId],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ id: this.lastID, user_id: userId, provider, account_id: accountId });
        }
      );
    });
  }

  // Get user's linked accounts
  async getUserAccounts(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM linked_accounts WHERE user_id = ?',
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows);
        }
      );
    });
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

module.exports = Database;