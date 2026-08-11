import express, { Router } from 'express';
import cors from 'cors';
import { checkNeonConnection, initNeonTables, getNeonSql } from '../db/neonService';

export function createApiApp() {
  const app = express();

  // Enable CORS for all origins (Vercel frontend -> API calls)
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  const router = Router();

  // API Health Check
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // DB Status Check
  router.get('/db/status', async (req, res) => {
    try {
      const status = await checkNeonConnection();
      res.json({
        configured: Boolean(process.env.DATABASE_URL),
        ...status,
      });
    } catch (err: any) {
      console.error('Error checking DB status:', err);
      res.status(500).json({
        configured: Boolean(process.env.DATABASE_URL),
        connected: false,
        message: err.message || 'Erro ao conectar ao banco de dados Neon.',
      });
    }
  });

  // DB Init Tables
  router.post('/db/init', async (req, res) => {
    try {
      const success = await initNeonTables();
      if (success) {
        res.json({ success: true, message: 'Tabelas criadas/verificadas com sucesso no Neon PostgreSQL!' });
      } else {
        res.status(500).json({ success: false, message: 'Erro ao inicializar tabelas no Neon.' });
      }
    } catch (err: any) {
      console.error('Error initializing tables:', err);
      res.status(500).json({ success: false, message: err.message || 'Erro ao inicializar tabelas.' });
    }
  });

  // Sync / Bulk Get
  router.get('/db/data', async (req, res) => {
    const sql = getNeonSql();
    if (!sql) {
      return res.status(400).json({ error: 'DATABASE_URL não configurada' });
    }

    try {
      await initNeonTables();

      const [categories, transactions, recurring, creditCards, installmentPlans, monthlyBudgets, categoryBudgets] = await Promise.all([
        sql`SELECT * FROM categories;`,
        sql`SELECT * FROM transactions;`,
        sql`SELECT * FROM recurring_expenses;`,
        sql`SELECT * FROM credit_cards;`,
        sql`SELECT * FROM installment_plans;`,
        sql`SELECT * FROM monthly_budgets;`,
        sql`SELECT * FROM category_budgets;`,
      ]);

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
      console.error('Error fetching data from Neon:', err);
      res.status(500).json({ error: err.message || 'Erro ao buscar dados do Neon' });
    }
  });

  // Bulk Save / Import to Neon
  router.post('/db/sync', async (req, res) => {
    const sql = getNeonSql();
    if (!sql) {
      return res.status(400).json({ error: 'DATABASE_URL não configurada' });
    }

    const { categories, transactions, recurring, creditCards, installmentPlans, monthlyBudgets, categoryBudgets } = req.body || {};

    try {
      await initNeonTables();

      if (Array.isArray(categories)) {
        for (const cat of categories) {
          await sql`
            INSERT INTO categories (id, name, type, group_name, is_default, active)
            VALUES (${cat.id}, ${cat.name}, ${cat.type}, ${cat.group || cat.groupName || null}, ${cat.isDefault || false}, ${cat.active !== false})
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              type = EXCLUDED.type,
              group_name = EXCLUDED.group_name,
              active = EXCLUDED.active;
          `;
        }
      }

      if (Array.isArray(transactions)) {
        for (const tx of transactions) {
          await sql`
            INSERT INTO transactions (
              id, type, date, description, category_id, amount, expense_type, payment_method,
              credit_card_id, notes, recurrence, installment_plan_id, current_installment, total_installments,
              created_at, updated_at
            )
            VALUES (
              ${tx.id}, ${tx.type}, ${tx.date}, ${tx.description}, ${tx.categoryId}, ${tx.amount},
              ${tx.expenseType}, ${tx.paymentMethod}, ${tx.creditCardId || null}, ${tx.notes || null},
              ${tx.recurrence || 'none'}, ${tx.installmentPlanId || null}, ${tx.currentInstallment || null},
              ${tx.totalInstallments || null}, ${tx.createdAt || tx.date}, ${tx.updatedAt || tx.date}
            )
            ON CONFLICT (id) DO UPDATE SET
              type = EXCLUDED.type,
              date = EXCLUDED.date,
              description = EXCLUDED.description,
              category_id = EXCLUDED.category_id,
              amount = EXCLUDED.amount,
              expense_type = EXCLUDED.expense_type,
              payment_method = EXCLUDED.payment_method,
              credit_card_id = EXCLUDED.credit_card_id,
              notes = EXCLUDED.notes,
              updated_at = EXCLUDED.updated_at;
          `;
        }
      }

      res.json({ success: true, message: 'Dados sincronizados com o Neon PostgreSQL com sucesso!' });
    } catch (err: any) {
      console.error('Error syncing data to Neon:', err);
      res.status(500).json({ error: err.message || 'Erro ao sincronizar dados com o Neon' });
    }
  });

  // Mount API router under /api AND root / to support both local and Vercel serverless routes
  app.use('/api', router);
  app.use('/', router);

  // Global error handler for Express
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Unhandled API error:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  });

  return app;
}
