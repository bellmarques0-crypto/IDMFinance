export type TransactionType = 'income' | 'expense'; // 'entrada' | 'saida'
export type ExpenseType = 'fixed' | 'variable'; // 'fixo' | 'variavel'
export type RecurrenceType = 'none' | 'monthly' | 'weekly' | 'yearly';

export type PaymentMethod =
  | 'pix'
  | 'dinheiro'
  | 'debito'
  | 'credito'
  | 'transferencia'
  | 'boleto'
  | 'outro';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  group: string; // e.g. 'MORADIA', 'CONTAS DA CASA', 'TRANSPORTE', 'ALIMENTAÇÃO', 'SAÚDE', 'EDUCAÇÃO', 'LAZER', 'PESSOAL', 'ENTRADAS'
  isDefault?: boolean;
  active: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string; // ISO format 'YYYY-MM-DD'
  description: string;
  categoryId: string;
  amount: number;
  expenseType: ExpenseType;
  paymentMethod: PaymentMethod;
  notes?: string;
  recurrence: RecurrenceType;
  creditCardId?: string;
  installmentPlanId?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringExpense {
  id: string;
  description: string;
  categoryId: string;
  amount: number;
  dueDay: number; // 1 - 31
  frequency: 'monthly' | 'weekly' | 'yearly';
  paymentMethod: PaymentMethod;
  expenseType: ExpenseType;
  active: boolean;
  notes?: string;
  createdAt: string;
}

export type RecurringPaymentStatus = 'pending' | 'paid' | 'overdue';

export interface RecurringExpensePayment {
  id: string;
  recurringExpenseId: string;
  monthYear: string; // 'YYYY-MM'
  status: RecurringPaymentStatus;
  paidDate?: string;
  transactionId?: string;
  amountPaid?: number;
}

export interface MonthlyBudget {
  id: string;
  monthYear: string; // 'YYYY-MM'
  overallAmount: number;
}

export interface CategoryBudget {
  id: string;
  monthYear: string; // 'YYYY-MM'
  categoryId: string;
  amount: number;
}

export interface CreditCard {
  id: string;
  name: string;
  closingDay: number;
  dueDay: number;
  limit: number;
}

export interface InstallmentPlan {
  id: string;
  description: string;
  creditCardId: string;
  categoryId: string;
  purchaseDate: string; // 'YYYY-MM-DD'
  totalAmount: number;
  installments: number;
  installmentAmount: number;
  expenseType: ExpenseType;
  createdAt: string;
}

export type NavigationTab =
  | 'dashboard'
  | 'transactions'
  | 'recurring'
  | 'budget'
  | 'comparison'
  | 'credit_cards'
  | 'categories'
  | 'reports'
  | 'settings';
