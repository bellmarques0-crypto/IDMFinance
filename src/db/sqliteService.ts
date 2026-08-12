import { createClient, Client } from '@libsql/client';
import fs from 'fs';
import path from 'path';

let dbInstance: Client | null = null;
const DB_FILE_PATH = path.resolve(process.cwd(), 'app_database.db');

export function getSqliteDb(): Client {
  if (!dbInstance) {
    dbInstance = createClient({
      url: 'file:app_database.db',
    });
  }
  return dbInstance;
}

export function resetSqliteDb(): void {
  dbInstance = null;
  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      fs.unlinkSync(DB_FILE_PATH);
      console.log('Corrupted SQLite database file removed successfully.');
    } catch (e) {
      console.error('Failed to remove corrupted SQLite file:', e);
    }
  }
}

export async function initSqliteTables(isRetry = false): Promise<boolean> {
  const db = getSqliteDb();
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        group_name TEXT,
        is_default INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS credit_cards (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        closing_day INTEGER NOT NULL,
        due_day INTEGER NOT NULL,
        limit_amount REAL NOT NULL DEFAULT 0
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS installment_plans (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        credit_card_id TEXT,
        category_id TEXT,
        purchase_date TEXT NOT NULL,
        total_amount REAL NOT NULL,
        installments INTEGER NOT NULL,
        installment_amount REAL NOT NULL,
        expense_type TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        category_id TEXT NOT NULL,
        amount REAL NOT NULL,
        expense_type TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        credit_card_id TEXT,
        notes TEXT,
        recurrence TEXT DEFAULT 'none',
        installment_plan_id TEXT,
        current_installment INTEGER,
        total_installments INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS recurring_expenses (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        category_id TEXT NOT NULL,
        amount REAL NOT NULL,
        due_day INTEGER NOT NULL,
        frequency TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        expense_type TEXT NOT NULL,
        active INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS monthly_budgets (
        id TEXT PRIMARY KEY,
        month_year TEXT NOT NULL UNIQUE,
        overall_amount REAL NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS category_budgets (
        id TEXT PRIMARY KEY,
        month_year TEXT NOT NULL,
        category_id TEXT NOT NULL,
        amount REAL NOT NULL
      );
    `);

    return true;
  } catch (err: any) {
    console.error('Error initializing SQLite tables:', err);
    const errMsg = String(err?.message || err);
    if (!isRetry && (errMsg.includes('SQLITE_CORRUPT') || errMsg.includes('malformed'))) {
      console.warn('SQLite file corrupted. Resetting and re-creating database...');
      resetSqliteDb();
      return initSqliteTables(true);
    }
    return false;
  }
}

export async function checkSqliteConnection(): Promise<{
  connected: boolean;
  message: string;
  version?: string;
}> {
  try {
    await initSqliteTables();
    const db = getSqliteDb();
    const res = await db.execute('SELECT sqlite_version() as version;');
    const ver = res.rows[0]?.version ? String(res.rows[0].version) : 'SQLite 3';
    return {
      connected: true,
      message: 'Conectado ao banco de dados SQLite com sucesso!',
      version: `SQLite ${ver}`,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err?.message || 'Erro ao conectar ao banco de dados SQLite.',
    };
  }
}
