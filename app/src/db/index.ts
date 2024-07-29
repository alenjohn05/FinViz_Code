import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { createPool, Pool } from "generic-pool";
import { config } from "../config";
const factory = {
  create: async (): Promise<Database> => {
    const db = await open({
      filename: config.database.filename,
      driver: sqlite3.Database,
    });
    await db.exec("PRAGMA journal_mode=WAL;");
    return db;
  },
  destroy: (db: Database) => db.close(),
};

export const dbPool: Pool<Database> = createPool(factory, {
  max: 50,
  min: 10,
  idleTimeoutMillis: 30000,
  evictionRunIntervalMillis: 10000,
});

export async function initializeDatabase(): Promise<void> {
  const db = await dbPool.acquire();
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS ImageNetData (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        size INTEGER
      )
    `);
  } finally {
    dbPool.release(db);
  }
}