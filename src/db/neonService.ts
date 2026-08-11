import dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';

export function getNeonSql(connectionString?: string) {
  let dbUrl = connectionString || process.env.DATABASE_URL;
  if (!dbUrl || typeof dbUrl !== 'string' || dbUrl.trim() === '') {
    return null;
  }
  dbUrl = dbUrl.trim().replace(/^["']|["']$/g, '');

  // Auto-fix truncated or missing sslmode parameter for Neon connections
  if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    if (!dbUrl.includes('sslmode=')) {
      if (dbUrl.includes('?')) {
        dbUrl = dbUrl.replace(/\?.*$/, '?sslmode=require');
      } else {
        dbUrl += '?sslmode=require';
      }
    }
  }

  try {
    return neon(dbUrl);
  } catch (error) {
    console.error('Failed to initialize Neon SQL client:', error);
    return null;
  }
}

export async function checkNeonConnection(connectionString?: string): Promise<{
  connected: boolean;
  message: string;
  version?: string;
}> {
  if (connectionString) {
    connectionString = connectionString.trim().replace(/^["']|["']$/g, '');
  }

  if (connectionString && (!connectionString.startsWith('postgres://') && !connectionString.startsWith('postgresql://'))) {
    return {
      connected: false,
      message: 'URL de conexão inválida. A URL do Neon deve começar com "postgresql://" ou "postgres://".',
    };
  }

  const sql = getNeonSql(connectionString);
  if (!sql) {
    return {
      connected: false,
      message: 'DATABASE_URL não informada. Cole sua URL de conexão do Neon no campo abaixo.',
    };
  }

  try {
    const result = await sql`SELECT version();`;
    const versionStr = Array.isArray(result) && result[0] ? String(result[0].version) : 'PostgreSQL';
    return {
      connected: true,
      message: 'Conectado ao Neon PostgreSQL com sucesso!',
      version: versionStr,
    };
  } catch (err: any) {
    console.error('Error connecting to Neon DB:', err);
    let msg = err.message || 'Erro ao conectar ao Neon PostgreSQL.';
    if (msg.includes('is not a valid URL')) {
      msg = 'String de conexão inválida. Copie a URL completa do painel do Neon (ex: postgresql://usuario:senha@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require).';
    } else if (msg.includes('FetchError') || msg.includes('Failed to fetch') || msg.includes('ENOTFOUND')) {
      msg = 'Não foi possível alcançar o servidor do Neon. Verifique se o host está correto e se o projeto Neon está ativo.';
    } else if (msg.includes('password authentication failed') || msg.includes('Auth') || msg.includes('FATAL')) {
      msg = 'Falha de autenticação no Neon. Verifique o usuário e a senha na URL.';
    }
    return {
      connected: false,
      message: msg,
    };
  }
}

export async function initNeonTables(connectionString?: string) {
  const sql = getNeonSql(connectionString);
  if (!sql) return false;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(32) NOT NULL,
        group_name VARCHAR(255),
        is_default BOOLEAN DEFAULT false,
        active BOOLEAN DEFAULT true
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS credit_cards (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        closing_day INTEGER NOT NULL,
        due_day INTEGER NOT NULL,
        limit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS installment_plans (
        id VARCHAR(64) PRIMARY KEY,
        description VARCHAR(255) NOT NULL,
        credit_card_id VARCHAR(64),
        category_id VARCHAR(64),
        purchase_date VARCHAR(32) NOT NULL,
        total_amount NUMERIC(12, 2) NOT NULL,
        installments INTEGER NOT NULL,
        installment_amount NUMERIC(12, 2) NOT NULL,
        expense_type VARCHAR(32) NOT NULL,
        created_at VARCHAR(64) NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(64) PRIMARY KEY,
        type VARCHAR(32) NOT NULL,
        date VARCHAR(32) NOT NULL,
        description VARCHAR(255) NOT NULL,
        category_id VARCHAR(64) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        expense_type VARCHAR(32) NOT NULL,
        payment_method VARCHAR(64) NOT NULL,
        credit_card_id VARCHAR(64),
        notes TEXT,
        recurrence VARCHAR(32) DEFAULT 'none',
        installment_plan_id VARCHAR(64),
        current_installment INTEGER,
        total_installments INTEGER,
        created_at VARCHAR(64) NOT NULL,
        updated_at VARCHAR(64) NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS recurring_expenses (
        id VARCHAR(64) PRIMARY KEY,
        description VARCHAR(255) NOT NULL,
        category_id VARCHAR(64) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        due_day INTEGER NOT NULL,
        frequency VARCHAR(32) NOT NULL,
        payment_method VARCHAR(64) NOT NULL,
        expense_type VARCHAR(32) NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at VARCHAR(64) NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS monthly_budgets (
        id VARCHAR(64) PRIMARY KEY,
        month_year VARCHAR(16) NOT NULL UNIQUE,
        overall_amount NUMERIC(12, 2) NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS category_budgets (
        id VARCHAR(64) PRIMARY KEY,
        month_year VARCHAR(16) NOT NULL,
        category_id VARCHAR(64) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL
      );
    `;

    return true;
  } catch (err) {
    console.error('Error initializing Neon tables:', err);
    return false;
  }
}
