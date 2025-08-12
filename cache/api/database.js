const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, 'btc_deposits.db');
    this.db = new sqlite3.Database(this.dbPath);
    this.init();
  }

  init() {
    this.db.serialize(() => {
      // Create users table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          eth_address TEXT UNIQUE NOT NULL,
          btc_address TEXT UNIQUE NOT NULL,
          btc_balance REAL DEFAULT 0,
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create transactions table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          eth_address TEXT NOT NULL,
          btc_address TEXT NOT NULL,
          tx_hash TEXT UNIQUE NOT NULL,
          amount REAL NOT NULL,
          confirmations INTEGER DEFAULT 0,
          block_height INTEGER,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (eth_address) REFERENCES users (eth_address)
        )
      `);

      // Create indexes for better performance
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_eth_address ON users (eth_address)`);
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_btc_address ON users (btc_address)`);
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_tx_hash ON transactions (tx_hash)`);
    });
  }

  // Add new user with ETH to BTC address mapping
  addUser(ethAddress, btcAddress) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT OR IGNORE INTO users (eth_address, btc_address) 
        VALUES (?, ?)
      `);
      
      stmt.run([ethAddress.toLowerCase(), btcAddress], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ethAddress, btcAddress });
        }
      });
      
      stmt.finalize();
    });
  }

  // Get user by ETH address
  getUserByEthAddress(ethAddress) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE eth_address = ?',
        [ethAddress.toLowerCase()],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  // Get user by BTC address
  getUserByBtcAddress(btcAddress) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE btc_address = ?',
        [btcAddress],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  // Update BTC balance for a user
  updateBtcBalance(ethAddress, balance) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET btc_balance = ?, last_updated = CURRENT_TIMESTAMP WHERE eth_address = ?',
        [balance, ethAddress.toLowerCase()],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  // Add transaction record
  addTransaction(ethAddress, btcAddress, txHash, amount, confirmations = 0, blockHeight = null) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT OR IGNORE INTO transactions 
        (eth_address, btc_address, tx_hash, amount, confirmations, block_height) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([ethAddress.toLowerCase(), btcAddress, txHash, amount, confirmations, blockHeight], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
      
      stmt.finalize();
    });
  }

  // Get transaction by hash
  getTransactionByHash(txHash) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM transactions WHERE tx_hash = ?',
        [txHash],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  // Get all transactions for a user
  getUserTransactions(ethAddress) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM transactions WHERE eth_address = ? ORDER BY created_at DESC',
        [ethAddress.toLowerCase()],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  // Update transaction status
  updateTransactionStatus(txHash, status, confirmations = null, blockHeight = null) {
    return new Promise((resolve, reject) => {
      let query = 'UPDATE transactions SET status = ?';
      let params = [status];
      
      if (confirmations !== null) {
        query += ', confirmations = ?';
        params.push(confirmations);
      }
      
      if (blockHeight !== null) {
        query += ', block_height = ?';
        params.push(blockHeight);
      }
      
      query += ' WHERE tx_hash = ?';
      params.push(txHash);
      
      this.db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  // Get all users (for admin purposes)
  getAllUsers() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM users ORDER BY created_at DESC', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Close database connection
  close() {
    return new Promise((resolve) => {
      this.db.close(resolve);
    });
  }
}

module.exports = Database;
