import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

let databasePromise: Promise<SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLiteDatabase> {
  if (databasePromise === null) {
    databasePromise = openDatabaseAsync('minhas-series.db');
  }

  return databasePromise;
}

export async function runMigrations(): Promise<void> {
  const database = await getDatabase();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS series (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      plataforma TEXT NOT NULL,
      temporadas INTEGER NOT NULL CHECK (temporadas >= 0),
      nota INTEGER CHECK (nota IS NULL OR nota BETWEEN 1 AND 5),
      concluida INTEGER NOT NULL DEFAULT 0 CHECK (concluida IN (0, 1)),
      createdAt TEXT NOT NULL
    );
  `);
}
