import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../scout.db');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
});

export const connectToDatabase = () => {
  db.serialize(() => {
    // Create tables if they don't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT,
        lastName TEXT,
        school TEXT,
        gradYear TEXT,
        state TEXT,
        height TEXT,
        weight TEXT,
        commitment TEXT,
        batHand TEXT,
        throwHand TEXT,
        position TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        playerName TEXT NOT NULL,
        playerSchool TEXT,
        eventDate TEXT,
        eventName TEXT,
        scoutName TEXT,
        overallGrade INTEGER,
        stance TEXT,
        load TEXT,
        swingPath TEXT,
        barrelFeel TEXT,
        batSpeed TEXT,
        avgEV TEXT,
        maxEV TEXT,
        maxDist TEXT,
        scoutNotes TEXT,
        reportType TEXT,
        gameNotes TEXT,
        formattedAtBats TEXT,
        atBatsJson TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure new columns exist for dual-mode support (SQLite migrations-lite)
    const ensureColumn = (table: string, column: string, type: string) => {
      db.all(`PRAGMA table_info(${table})`, (err, rows: any[]) => {
        if (err) return;
        const exists = rows && rows.some((r) => r.name === column);
        if (!exists) {
          db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
        }
      });
    };

    ensureColumn('reports', 'reportType', 'TEXT');
    ensureColumn('reports', 'gameNotes', 'TEXT');
    ensureColumn('reports', 'formattedAtBats', 'TEXT');
    ensureColumn('reports', 'atBatsJson', 'TEXT');

    db.run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        eventName TEXT,
        eventDate TEXT,
        googleDocId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✓ Database connected and tables initialized');
  });
};