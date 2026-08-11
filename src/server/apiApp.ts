import dotenv from 'dotenv';
dotenv.config();

import express, { Router } from 'express';
import cors from 'cors';
import { getSqliteDb, initSqliteTables, checkSqliteConnection } from '../db/sqliteService';

export function createApiApp() {
  const app = express();

  // Enable CORS for all origins
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Prevent API caching
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  const router = Router();

  // API Health Check
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // DB Status Check
  router.all('/db/status', async (req, res) => {
    try {
      const status = await checkSqliteConnection();
      res.json({
        configured: true,
        ...status,
      });
    } catch (err: any) {
      console.error('Error checking DB status:', err);
      res.json({
        configured: true,
        connected: false,
        message: err.message || 'Erro ao conectar ao banco de dados SQLite.',
      });
    }
  });

  // DB Init Tables
  router.all('/db/init', async (req, res) => {
    try {
      const success = await initSqliteTables();
      if (success) {
        res.json({ success: true, message: 'Tabelas criadas/verificadas com sucesso no SQLite!' });
      } else {
        res.json({ success: false, message: 'Erro ao inicializar tabelas no SQLite.' });
      }
    } catch (err: any) {
      console.error('Error initializing tables:', err);
      res.json({ success: false, message: err.message || 'Erro ao inicializar tabelas.' });
    }
  });

  // Bulk Get Data
  router.all('/db/data', async (req, res) => {
    try {
      await initSqliteTables();
      const db = getSqliteDb();

      const [catsRes, txsRes, recRes, cardsRes, plansRes, mbRes, cbRes] = await Promise.all([
        db.execute('SELECT * FROM categories;'),
        db.execute('SELECT * FROM transactions;'),
        db.execute('SELECT * FROM recurring_expenses;'),
        db.execute('SELECT * FROM credit_cards;'),
        db.execute('SELECT * FROM installment_plans;'),
        db.execute('SELECT * FROM monthly_budgets;'),
        db.execute('SELECT * FROM category_budgets;'),
      ]);

      const categories = catsRes.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        group: row.group_name,
        groupName: row.group_name,
        isDefault: Boolean(row.is_default),
        active: Boolean(row.active),
      }));

      const transactions = txsRes.rows.map((row: any) => ({
        id: row.id,
        type: row.type,
        date: row.date,
        description: row.description,
        categoryId: row.category_id,
        amount: Number(row.amount),
        expenseType: row.expense_type,
        paymentMethod: row.payment_method,
        creditCardId: row.credit_card_id,
        notes: row.notes,
        recurrence: row.recurrence,
        installmentPlanId: row.installment_plan_id,
        currentInstallment: row.current_installment ? Number(row.current_installment) : undefined,
        totalInstallments: row.total_installments ? Number(row.total_installments) : undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      const recurring = recRes.rows.map((row: any) => ({
        id: row.id,
        description: row.description,
        categoryId: row.category_id,
        amount: Number(row.amount),
        dueDay: Number(row.due_day),
        frequency: row.frequency,
        paymentMethod: row.payment_method,
        expenseType: row.expense_type,
        active: Boolean(row.active),
        createdAt: row.created_at,
      }));

      const creditCards = cardsRes.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        closingDay: Number(row.closing_day),
        dueDay: Number(row.due_day),
        limitAmount: Number(row.limit_amount),
      }));

      const installmentPlans = plansRes.rows.map((row: any) => ({
        id: row.id,
        description: row.description,
        creditCardId: row.credit_card_id,
        categoryId: row.category_id,
        purchaseDate: row.purchase_date,
        totalAmount: Number(row.total_amount),
        installments: Number(row.installments),
        installmentAmount: Number(row.installment_amount),
        expenseType: row.expense_type,
        createdAt: row.created_at,
      }));

      const monthlyBudgets = mbRes.rows.map((row: any) => ({
        id: row.id,
        monthYear: row.month_year,
        overallAmount: Number(row.overall_amount),
      }));

      const categoryBudgets = cbRes.rows.map((row: any) => ({
        id: row.id,
        monthYear: row.month_year,
        categoryId: row.category_id,
        amount: Number(row.amount),
      }));

      res.json({
        categories,
        transactions,
        recurring,
        creditCards,
        installmentPlans,
        monthlyBudgets,
        categoryBudgets,
      });
    } catch (err: any) {
      console.error('Error fetching data from SQLite:', err);
      res.status(500).json({ error: err.message || 'Erro ao buscar dados do SQLite' });
    }
  });

  // Bulk Save / Sync to SQLite
  router.post('/db/sync', async (req, res) => {
    const { categories, transactions, recurring, creditCards, installmentPlans, monthlyBudgets, categoryBudgets } = req.body || {};

    try {
      await initSqliteTables();
      const db = getSqliteDb();

      if (Array.isArray(categories)) {
        for (const cat of categories) {
          await db.execute({
            sql: `
              INSERT INTO categories (id, name, type, group_name, is_default, active)
              VALUES (?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                type = excluded.type,
                group_name = excluded.group_name,
                active = excluded.active;
            `,
            args: [
              cat.id,
              cat.name,
              cat.type,
              cat.group || cat.groupName || null,
              cat.isDefault ? 1 : 0,
              cat.active !== false ? 1 : 0,
            ],
          });
        }
      }

      if (Array.isArray(transactions)) {
        for (const tx of transactions) {
          await db.execute({
            sql: `
              INSERT INTO transactions (
                id, type, date, description, category_id, amount, expense_type, payment_method,
                credit_card_id, notes, recurrence, installment_plan_id, current_installment, total_installments,
                created_at, updated_at
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                type = excluded.type,
                date = excluded.date,
                description = excluded.description,
                category_id = excluded.category_id,
                amount = excluded.amount,
                expense_type = excluded.expense_type,
                payment_method = excluded.payment_method,
                credit_card_id = excluded.credit_card_id,
                notes = excluded.notes,
                updated_at = excluded.updated_at;
            `,
            args: [
              tx.id,
              tx.type,
              tx.date,
              tx.description,
              tx.categoryId,
              tx.amount,
              tx.expenseType,
              tx.paymentMethod,
              tx.creditCardId || null,
              tx.notes || null,
              tx.recurrence || 'none',
              tx.installmentPlanId || null,
              tx.currentInstallment || null,
              tx.totalInstallments || null,
              tx.createdAt || tx.date,
              tx.updatedAt || tx.date,
            ],
          });
        }
      }

      if (Array.isArray(creditCards)) {
        for (const card of creditCards) {
          await db.execute({
            sql: `
              INSERT INTO credit_cards (id, name, closing_day, due_day, limit_amount)
              VALUES (?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                closing_day = excluded.closing_day,
                due_day = excluded.due_day,
                limit_amount = excluded.limit_amount;
            `,
            args: [card.id, card.name, card.closingDay, card.dueDay, card.limitAmount],
          });
        }
      }

      if (Array.isArray(recurring)) {
        for (const rec of recurring) {
          await db.execute({
            sql: `
              INSERT INTO recurring_expenses (id, description, category_id, amount, due_day, frequency, payment_method, expense_type, active, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                description = excluded.description,
                category_id = excluded.category_id,
                amount = excluded.amount,
                due_day = excluded.due_day,
                frequency = excluded.frequency,
                payment_method = excluded.payment_method,
                expense_type = excluded.expense_type,
                active = excluded.active;
            `,
            args: [
              rec.id,
              rec.description,
              rec.categoryId,
              rec.amount,
              rec.dueDay,
              rec.frequency,
              rec.paymentMethod,
              rec.expenseType,
              rec.active !== false ? 1 : 0,
              rec.createdAt || new Date().toISOString(),
            ],
          });
        }
      }

      if (Array.isArray(installmentPlans)) {
        for (const plan of installmentPlans) {
          await db.execute({
            sql: `
              INSERT INTO installment_plans (id, description, credit_card_id, category_id, purchase_date, total_amount, installments, installment_amount, expense_type, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                description = excluded.description,
                credit_card_id = excluded.credit_card_id,
                category_id = excluded.category_id,
                purchase_date = excluded.purchase_date,
                total_amount = excluded.total_amount,
                installments = excluded.installments,
                installment_amount = excluded.installment_amount,
                expense_type = excluded.expense_type;
            `,
            args: [
              plan.id,
              plan.description,
              plan.creditCardId || null,
              plan.categoryId,
              plan.purchaseDate,
              plan.totalAmount,
              plan.installments,
              plan.installmentAmount,
              plan.expenseType,
              plan.createdAt || new Date().toISOString(),
            ],
          });
        }
      }

      if (Array.isArray(monthlyBudgets)) {
        for (const mb of monthlyBudgets) {
          await db.execute({
            sql: `
              INSERT INTO monthly_budgets (id, month_year, overall_amount)
              VALUES (?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                overall_amount = excluded.overall_amount;
            `,
            args: [mb.id, mb.monthYear, mb.overallAmount],
          });
        }
      }

      if (Array.isArray(categoryBudgets)) {
        for (const cb of categoryBudgets) {
          await db.execute({
            sql: `
              INSERT INTO category_budgets (id, month_year, category_id, amount)
              VALUES (?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                amount = excluded.amount;
            `,
            args: [cb.id, cb.monthYear, cb.categoryId, cb.amount],
          });
        }
      }

      res.json({ success: true, message: 'Dados sincronizados com o SQLite com sucesso!' });
    } catch (err: any) {
      console.error('Error syncing data to SQLite:', err);
      res.status(500).json({ error: err.message || 'Erro ao sincronizar dados com o SQLite' });
    }
  });

  // Mount API router
  app.use('/api', router);
  app.use('/', router);

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Unhandled API error:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  });

  return app;
}
