import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';
import fs from 'fs';

const DB_DIR = path.join(os.homedir(), '.speed-type');
const DB_PATH = path.join(DB_DIR, 'speed-type.db');

// Ensure directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

class DatabaseManager {
  private db: Database.Database;
  private static instance: DatabaseManager;

  private constructor() {
    this.db = new Database(DB_PATH);
    this.initializeTables();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private initializeTables(): void {
    // Profiles table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        best_wpm REAL DEFAULT 0,
        best_accuracy REAL DEFAULT 0,
        tests_completed INTEGER DEFAULT 0,
        total_time_typed REAL DEFAULT 0
      )
    `);

    // Test results table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS test_results (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        mode TEXT NOT NULL,
        wpm REAL NOT NULL,
        cpm REAL NOT NULL,
        accuracy REAL NOT NULL,
        consistency REAL NOT NULL,
        time_elapsed REAL NOT NULL,
        errors_count INTEGER NOT NULL,
        longest_streak INTEGER NOT NULL,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        text TEXT NOT NULL,
        replay_data TEXT,
        FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE
      )
    `);

    // Configuration table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Current profile tracking
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS current_session (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Replay shares table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS replay_shares (
        share_code TEXT PRIMARY KEY,
        test_result_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (test_result_id) REFERENCES test_results (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_test_results_profile_id ON test_results (profile_id);
      CREATE INDEX IF NOT EXISTS idx_test_results_completed_at ON test_results (completed_at);
      CREATE INDEX IF NOT EXISTS idx_test_results_wpm ON test_results (wpm);
    `);
  }

  public getDatabase(): Database.Database {
    return this.db;
  }

  public close(): void {
    this.db.close();
  }

  // Transaction helper
  public transaction<T>(fn: (db: Database.Database) => T): T {
    const transaction = this.db.transaction(fn);
    return transaction(this.db);
  }
}

export { DatabaseManager };
export default DatabaseManager.getInstance().getDatabase();