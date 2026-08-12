import {
  Category,
  CreditCard,
  InstallmentPlan,
  MonthlyBudget,
  CategoryBudget,
  RecurringExpense,
  RecurringExpensePayment,
  Transaction,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  INITIAL_CATEGORY_BUDGETS,
  INITIAL_CREDIT_CARDS,
  INITIAL_INSTALLMENT_PLANS,
  INITIAL_MONTHLY_BUDGETS,
  INITIAL_RECURRING_EXPENSES,
  INITIAL_TRANSACTIONS,
} from './initialData';
import { FirestoreService } from '../services/firestoreService';

const KEYS = {
  TRANSACTIONS: 'cfp_transactions_v2',
  CATEGORIES: 'cfp_categories_v2',
  RECURRING: 'cfp_recurring_v2',
  RECURRING_PAYMENTS: 'cfp_recurring_payments_v2',
  BUDGETS: 'cfp_budgets_v2',
  CATEGORY_BUDGETS: 'cfp_category_budgets_v2',
  CREDIT_CARDS: 'cfp_credit_cards_v2',
  INSTALLMENT_PLANS: 'cfp_installment_plans_v2',
};

// Safe JSON fetcher from LocalStorage
function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading key ${key} from localStorage`, err);
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing key ${key} to localStorage`, err);
  }
}

export const StorageEngine = {
  setAllData(data: {
    categories?: Category[];
    transactions?: Transaction[];
    recurring?: RecurringExpense[];
    creditCards?: CreditCard[];
    installmentPlans?: InstallmentPlan[];
    monthlyBudgets?: MonthlyBudget[];
    categoryBudgets?: CategoryBudget[];
  }) {
    if (data.categories) setItem(KEYS.CATEGORIES, data.categories);
    if (data.transactions) setItem(KEYS.TRANSACTIONS, data.transactions);
    if (data.recurring) setItem(KEYS.RECURRING, data.recurring);
    if (data.creditCards) setItem(KEYS.CREDIT_CARDS, data.creditCards);
    if (data.installmentPlans) setItem(KEYS.INSTALLMENT_PLANS, data.installmentPlans);
    if (data.monthlyBudgets) setItem(KEYS.BUDGETS, data.monthlyBudgets);
    if (data.categoryBudgets) setItem(KEYS.CATEGORY_BUDGETS, data.categoryBudgets);

    FirestoreService.syncAllData(data);
  },

  // Initialize with seed data if keys don't exist
  init() {
    // Clear old v1 keys if present to ensure no legacy mock data persists
    const legacyKeys = [
      'cfp_transactions_v1',
      'cfp_categories_v1',
      'cfp_recurring_v1',
      'cfp_recurring_payments_v1',
      'cfp_budgets_v1',
      'cfp_category_budgets_v1',
      'cfp_credit_cards_v1',
      'cfp_installment_plans_v1',
    ];
    legacyKeys.forEach((key) => localStorage.removeItem(key));

    if (!localStorage.getItem(KEYS.CATEGORIES)) {
      setItem(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    }
    if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
      setItem(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    }
    if (!localStorage.getItem(KEYS.RECURRING)) {
      setItem(KEYS.RECURRING, INITIAL_RECURRING_EXPENSES);
    }
    if (!localStorage.getItem(KEYS.CREDIT_CARDS)) {
      setItem(KEYS.CREDIT_CARDS, INITIAL_CREDIT_CARDS);
    }
    if (!localStorage.getItem(KEYS.INSTALLMENT_PLANS)) {
      setItem(KEYS.INSTALLMENT_PLANS, INITIAL_INSTALLMENT_PLANS);
    }
    if (!localStorage.getItem(KEYS.BUDGETS)) {
      setItem(KEYS.BUDGETS, INITIAL_MONTHLY_BUDGETS);
    }
    if (!localStorage.getItem(KEYS.CATEGORY_BUDGETS)) {
      setItem(KEYS.CATEGORY_BUDGETS, INITIAL_CATEGORY_BUDGETS);
    }
    if (!localStorage.getItem(KEYS.RECURRING_PAYMENTS)) {
      setItem(KEYS.RECURRING_PAYMENTS, []);
    }
  },

  resetToSampleData() {
    setItem(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    setItem(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    setItem(KEYS.RECURRING, INITIAL_RECURRING_EXPENSES);
    setItem(KEYS.CREDIT_CARDS, INITIAL_CREDIT_CARDS);
    setItem(KEYS.INSTALLMENT_PLANS, INITIAL_INSTALLMENT_PLANS);
    setItem(KEYS.BUDGETS, INITIAL_MONTHLY_BUDGETS);
    setItem(KEYS.CATEGORY_BUDGETS, INITIAL_CATEGORY_BUDGETS);
    setItem(KEYS.RECURRING_PAYMENTS, []);

    FirestoreService.syncAllData({
      categories: DEFAULT_CATEGORIES,
      transactions: INITIAL_TRANSACTIONS,
      recurring: INITIAL_RECURRING_EXPENSES,
      creditCards: INITIAL_CREDIT_CARDS,
      installmentPlans: INITIAL_INSTALLMENT_PLANS,
      monthlyBudgets: INITIAL_MONTHLY_BUDGETS,
      categoryBudgets: INITIAL_CATEGORY_BUDGETS,
      recurringPayments: [],
    });
  },

  clearAllData() {
    setItem(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    setItem(KEYS.TRANSACTIONS, []);
    setItem(KEYS.RECURRING, []);
    setItem(KEYS.CREDIT_CARDS, []);
    setItem(KEYS.INSTALLMENT_PLANS, []);
    setItem(KEYS.BUDGETS, []);
    setItem(KEYS.CATEGORY_BUDGETS, []);
    setItem(KEYS.RECURRING_PAYMENTS, []);

    FirestoreService.syncAllData({
      categories: DEFAULT_CATEGORIES,
      transactions: [],
      recurring: [],
      creditCards: [],
      installmentPlans: [],
      monthlyBudgets: [],
      categoryBudgets: [],
      recurringPayments: [],
    });
  },

  // --- TRANSACTIONS ---
  getTransactions(): Transaction[] {
    return getItem<Transaction[]>(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  },

  saveTransaction(tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Transaction {
    const list = this.getTransactions();
    const now = new Date().toISOString();
    let result: Transaction;

    if (tx.id) {
      // Edit existing
      const index = list.findIndex((item) => item.id === tx.id);
      if (index !== -1) {
        const updated: Transaction = {
          ...list[index],
          ...tx,
          id: tx.id,
          updatedAt: now,
        };
        list[index] = updated;
        setItem(KEYS.TRANSACTIONS, list);
        result = updated;
      } else {
        result = {
          ...tx,
          id: tx.id,
          createdAt: now,
          updatedAt: now,
        } as Transaction;
        list.unshift(result);
        setItem(KEYS.TRANSACTIONS, list);
      }
    } else {
      // Create new
      const newTx: Transaction = {
        ...tx,
        id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        createdAt: now,
        updatedAt: now,
      };
      list.unshift(newTx);
      setItem(KEYS.TRANSACTIONS, list);
      result = newTx;
    }

    FirestoreService.saveDocument('transactions', result.id, result);
    return result;
  },

  deleteTransaction(id: string): void {
    const list = this.getTransactions().filter((tx) => tx.id !== id);
    setItem(KEYS.TRANSACTIONS, list);
    FirestoreService.deleteDocument('transactions', id);
  },

  // --- CATEGORIES ---
  getCategories(): Category[] {
    return getItem<Category[]>(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  },

  saveCategory(cat: Omit<Category, 'id'> & { id?: string }): Category {
    const list = this.getCategories();
    let result: Category;

    if (cat.id) {
      const index = list.findIndex((item) => item.id === cat.id);
      if (index !== -1) {
        list[index] = { ...list[index], ...cat };
        setItem(KEYS.CATEGORIES, list);
        result = list[index];
      } else {
        result = { ...cat, id: cat.id, active: cat.active ?? true } as Category;
        list.push(result);
        setItem(KEYS.CATEGORIES, list);
      }
    } else {
      result = {
        ...cat,
        id: 'cat-' + Date.now(),
        active: cat.active ?? true,
      };
      list.push(result);
      setItem(KEYS.CATEGORIES, list);
    }

    FirestoreService.saveDocument('categories', result.id, result);
    return result;
  },

  deleteCategory(id: string): void {
    const list = this.getCategories().filter((cat) => cat.id !== id);
    setItem(KEYS.CATEGORIES, list);
    FirestoreService.deleteDocument('categories', id);
  },

  // --- RECURRING EXPENSES ---
  getRecurringExpenses(): RecurringExpense[] {
    return getItem<RecurringExpense[]>(KEYS.RECURRING, INITIAL_RECURRING_EXPENSES);
  },

  saveRecurringExpense(item: Omit<RecurringExpense, 'id' | 'createdAt'> & { id?: string }): RecurringExpense {
    const list = this.getRecurringExpenses();
    let result: RecurringExpense;

    if (item.id) {
      const index = list.findIndex((r) => r.id === item.id);
      if (index !== -1) {
        list[index] = { ...list[index], ...item };
        setItem(KEYS.RECURRING, list);
        result = list[index];
      } else {
        result = { ...item, id: item.id, createdAt: new Date().toISOString().split('T')[0] } as RecurringExpense;
        list.push(result);
        setItem(KEYS.RECURRING, list);
      }
    } else {
      result = {
        ...item,
        id: 'rec-' + Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      list.push(result);
      setItem(KEYS.RECURRING, list);
    }

    FirestoreService.saveDocument('recurringExpenses', result.id, result);
    return result;
  },

  deleteRecurringExpense(id: string): void {
    const list = this.getRecurringExpenses().filter((item) => item.id !== id);
    setItem(KEYS.RECURRING, list);
    FirestoreService.deleteDocument('recurringExpenses', id);
  },

  // --- RECURRING PAYMENTS STATUS (Controle de Vencimentos) ---
  getRecurringPayments(): RecurringExpensePayment[] {
    return getItem<RecurringExpensePayment[]>(KEYS.RECURRING_PAYMENTS, []);
  },

  markRecurringAsPaid(recurringId: string, monthYear: string, actualAmount?: number, paidDate?: string): Transaction {
    const recurringList = this.getRecurringExpenses();
    const item = recurringList.find((r) => r.id === recurringId);
    if (!item) {
      throw new Error('Despesa recorrente não encontrada');
    }

    const todayStr = paidDate || new Date().toISOString().split('T')[0];
    const amount = actualAmount !== undefined ? actualAmount : item.amount;

    // Create the transaction in history for this specific month
    const createdTx = this.saveTransaction({
      type: 'expense',
      date: todayStr,
      description: item.description,
      categoryId: item.categoryId,
      amount: amount,
      expenseType: item.expenseType,
      paymentMethod: item.paymentMethod,
      notes: `Pagamento de despesa fixa do mês ${monthYear}`,
      recurrence: 'monthly',
    });

    // Record the status
    const payments = this.getRecurringPayments();
    const existingIndex = payments.findIndex((p) => p.recurringExpenseId === recurringId && p.monthYear === monthYear);

    const paymentRecord: RecurringExpensePayment = {
      id: existingIndex !== -1 ? payments[existingIndex].id : 'pay-' + Date.now(),
      recurringExpenseId: recurringId,
      monthYear: monthYear,
      status: 'paid',
      paidDate: todayStr,
      transactionId: createdTx.id,
      amountPaid: amount,
    };

    if (existingIndex !== -1) {
      payments[existingIndex] = paymentRecord;
    } else {
      payments.push(paymentRecord);
    }

    setItem(KEYS.RECURRING_PAYMENTS, payments);
    FirestoreService.saveDocument('recurringPayments', paymentRecord.id, paymentRecord);
    return createdTx;
  },

  // --- BUDGETS ---
  getMonthlyBudgets(): MonthlyBudget[] {
    return getItem<MonthlyBudget[]>(KEYS.BUDGETS, INITIAL_MONTHLY_BUDGETS);
  },

  saveMonthlyBudget(monthYear: string, overallAmount: number): MonthlyBudget {
    const list = this.getMonthlyBudgets();
    const index = list.findIndex((b) => b.monthYear === monthYear);
    let result: MonthlyBudget;

    if (index !== -1) {
      list[index].overallAmount = overallAmount;
      setItem(KEYS.BUDGETS, list);
      result = list[index];
    } else {
      result = {
        id: 'mb-' + monthYear,
        monthYear,
        overallAmount,
      };
      list.push(result);
      setItem(KEYS.BUDGETS, list);
    }

    FirestoreService.saveDocument('monthlyBudgets', result.id, result);
    return result;
  },

  getCategoryBudgets(monthYear: string): CategoryBudget[] {
    const all = getItem<CategoryBudget[]>(KEYS.CATEGORY_BUDGETS, INITIAL_CATEGORY_BUDGETS);
    return all.filter((b) => b.monthYear === monthYear);
  },

  saveCategoryBudget(monthYear: string, categoryId: string, amount: number): CategoryBudget {
    const all = getItem<CategoryBudget[]>(KEYS.CATEGORY_BUDGETS, INITIAL_CATEGORY_BUDGETS);
    const index = all.findIndex((b) => b.monthYear === monthYear && b.categoryId === categoryId);
    let result: CategoryBudget;

    if (index !== -1) {
      all[index].amount = amount;
      setItem(KEYS.CATEGORY_BUDGETS, all);
      result = all[index];
    } else {
      result = {
        id: 'cb-' + monthYear + '-' + categoryId,
        monthYear,
        categoryId,
        amount,
      };
      all.push(result);
      setItem(KEYS.CATEGORY_BUDGETS, all);
    }

    FirestoreService.saveDocument('categoryBudgets', result.id, result);
    return result;
  },

  deleteCategoryBudget(id: string): void {
    const all = getItem<CategoryBudget[]>(KEYS.CATEGORY_BUDGETS, INITIAL_CATEGORY_BUDGETS).filter((b) => b.id !== id);
    setItem(KEYS.CATEGORY_BUDGETS, all);
    FirestoreService.deleteDocument('categoryBudgets', id);
  },

  // --- CREDIT CARDS & INSTALLMENTS ---
  getCreditCards(): CreditCard[] {
    return getItem<CreditCard[]>(KEYS.CREDIT_CARDS, INITIAL_CREDIT_CARDS);
  },

  saveCreditCard(card: Omit<CreditCard, 'id'> & { id?: string }): CreditCard {
    const list = this.getCreditCards();
    let result: CreditCard;

    if (card.id) {
      const idx = list.findIndex((c) => c.id === card.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...card };
        setItem(KEYS.CREDIT_CARDS, list);
        result = list[idx];
      } else {
        result = { ...card, id: card.id } as CreditCard;
        list.push(result);
        setItem(KEYS.CREDIT_CARDS, list);
      }
    } else {
      result = {
        ...card,
        id: 'card-' + Date.now(),
      };
      list.push(result);
      setItem(KEYS.CREDIT_CARDS, list);
    }

    FirestoreService.saveDocument('creditCards', result.id, result);
    return result;
  },

  deleteCreditCard(id: string): void {
    const list = this.getCreditCards().filter((c) => c.id !== id);
    setItem(KEYS.CREDIT_CARDS, list);
    FirestoreService.deleteDocument('creditCards', id);
  },

  getInstallmentPlans(): InstallmentPlan[] {
    return getItem<InstallmentPlan[]>(KEYS.INSTALLMENT_PLANS, INITIAL_INSTALLMENT_PLANS);
  },

  createInstallmentPurchase(planData: {
    description: string;
    creditCardId: string;
    categoryId: string;
    purchaseDate: string; // 'YYYY-MM-DD'
    totalAmount: number;
    installments: number;
    expenseType: 'fixed' | 'variable';
  }): { plan: InstallmentPlan; transactions: Transaction[] } {
    const planId = 'inst-' + Date.now();
    const instAmount = Number((planData.totalAmount / planData.installments).toFixed(2));

    const plan: InstallmentPlan = {
      id: planId,
      description: planData.description,
      creditCardId: planData.creditCardId,
      categoryId: planData.categoryId,
      purchaseDate: planData.purchaseDate,
      totalAmount: planData.totalAmount,
      installments: planData.installments,
      installmentAmount: instAmount,
      expenseType: planData.expenseType,
      createdAt: new Date().toISOString(),
    };

    const allPlans = this.getInstallmentPlans();
    allPlans.push(plan);
    setItem(KEYS.INSTALLMENT_PLANS, allPlans);
    FirestoreService.saveDocument('installmentPlans', plan.id, plan);

    // Auto-create transactions distributed across future months based on purchaseDate!
    const createdTxs: Transaction[] = [];
    const baseDate = new Date(planData.purchaseDate + 'T12:00:00');

    for (let i = 1; i <= planData.installments; i++) {
      const currentMonthDate = new Date(baseDate);
      currentMonthDate.setMonth(baseDate.getMonth() + (i - 1));

      const yyyy = currentMonthDate.getFullYear();
      const mm = String(currentMonthDate.getMonth() + 1).padStart(2, '0');
      const dd = String(baseDate.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const tx = this.saveTransaction({
        type: 'expense',
        date: dateStr,
        description: `${planData.description} (${i}/${planData.installments})`,
        categoryId: planData.categoryId,
        amount: instAmount,
        expenseType: planData.expenseType,
        paymentMethod: 'credito',
        creditCardId: planData.creditCardId,
        installmentPlanId: planId,
        installmentNumber: i,
        totalInstallments: planData.installments,
        notes: `Compra de R$ ${planData.totalAmount.toFixed(2)} em ${planData.installments}x`,
        recurrence: 'none',
      });
      createdTxs.push(tx);
    }

    return { plan, transactions: createdTxs };
  },
};
