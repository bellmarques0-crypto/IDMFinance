import { Category, CreditCard, InstallmentPlan, MonthlyBudget, CategoryBudget, RecurringExpense, Transaction } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // MORADIA
  { id: 'cat-aluguel', name: 'Aluguel', type: 'expense', group: 'MORADIA', isDefault: true, active: true },
  { id: 'cat-fin-casa', name: 'Financiamento Casa', type: 'expense', group: 'MORADIA', isDefault: true, active: true },
  { id: 'cat-condominio', name: 'Condomínio', type: 'expense', group: 'MORADIA', isDefault: true, active: true },
  { id: 'cat-manut-casa', name: 'Manutenção da Casa', type: 'expense', group: 'MORADIA', isDefault: true, active: true },

  // CONTAS DA CASA
  { id: 'cat-agua', name: 'Água', type: 'expense', group: 'CONTAS DA CASA', isDefault: true, active: true },
  { id: 'cat-luz', name: 'Luz', type: 'expense', group: 'CONTAS DA CASA', isDefault: true, active: true },
  { id: 'cat-internet', name: 'Internet', type: 'expense', group: 'CONTAS DA CASA', isDefault: true, active: true },
  { id: 'cat-telefone', name: 'Telefone', type: 'expense', group: 'CONTAS DA CASA', isDefault: true, active: true },
  { id: 'cat-gas', name: 'Gás', type: 'expense', group: 'CONTAS DA CASA', isDefault: true, active: true },

  // TRANSPORTE
  { id: 'cat-fin-carro', name: 'Financiamento Carro', type: 'expense', group: 'TRANSPORTE', isDefault: true, active: true },
  { id: 'cat-combustivel', name: 'Combustível', type: 'expense', group: 'TRANSPORTE', isDefault: true, active: true },
  { id: 'cat-manut-carro', name: 'Manutenção Carro', type: 'expense', group: 'TRANSPORTE', isDefault: true, active: true },
  { id: 'cat-seguro-carro', name: 'Seguro Carro', type: 'expense', group: 'TRANSPORTE', isDefault: true, active: true },
  { id: 'cat-transporte', name: 'Transporte', type: 'expense', group: 'TRANSPORTE', isDefault: true, active: true },

  // ALIMENTAÇÃO
  { id: 'cat-supermercado', name: 'Supermercado', type: 'expense', group: 'ALIMENTAÇÃO', isDefault: true, active: true },
  { id: 'cat-restaurante', name: 'Restaurante', type: 'expense', group: 'ALIMENTAÇÃO', isDefault: true, active: true },
  { id: 'cat-delivery', name: 'Delivery', type: 'expense', group: 'ALIMENTAÇÃO', isDefault: true, active: true },
  { id: 'cat-lanches', name: 'Lanches', type: 'expense', group: 'ALIMENTAÇÃO', isDefault: true, active: true },

  // SAÚDE
  { id: 'cat-farmacia', name: 'Farmácia', type: 'expense', group: 'SAÚDE', isDefault: true, active: true },
  { id: 'cat-medico', name: 'Médico', type: 'expense', group: 'SAÚDE', isDefault: true, active: true },
  { id: 'cat-exames', name: 'Exames', type: 'expense', group: 'SAÚDE', isDefault: true, active: true },
  { id: 'cat-plano-saude', name: 'Plano de Saúde', type: 'expense', group: 'SAÚDE', isDefault: true, active: true },

  // EDUCAÇÃO
  { id: 'cat-escola', name: 'Escola', type: 'expense', group: 'EDUCAÇÃO', isDefault: true, active: true },
  { id: 'cat-cursos', name: 'Cursos', type: 'expense', group: 'EDUCAÇÃO', isDefault: true, active: true },
  { id: 'cat-material', name: 'Material', type: 'expense', group: 'EDUCAÇÃO', isDefault: true, active: true },

  // LAZER
  { id: 'cat-passeios', name: 'Passeios', type: 'expense', group: 'LAZER', isDefault: true, active: true },
  { id: 'cat-entretenimento', name: 'Entretenimento', type: 'expense', group: 'LAZER', isDefault: true, active: true },
  { id: 'cat-viagens', name: 'Viagens', type: 'expense', group: 'LAZER', isDefault: true, active: true },

  // PESSOAL
  { id: 'cat-roupas', name: 'Roupas', type: 'expense', group: 'PESSOAL', isDefault: true, active: true },
  { id: 'cat-beleza', name: 'Beleza', type: 'expense', group: 'PESSOAL', isDefault: true, active: true },
  { id: 'cat-presentes', name: 'Presentes', type: 'expense', group: 'PESSOAL', isDefault: true, active: true },
  { id: 'cat-outros-gastos', name: 'Outros', type: 'expense', group: 'PESSOAL', isDefault: true, active: true },

  // ENTRADAS
  { id: 'cat-salario', name: 'Salário', type: 'income', group: 'ENTRADAS', isDefault: true, active: true },
  { id: 'cat-vale', name: 'Vale', type: 'income', group: 'ENTRADAS', isDefault: true, active: true },
  { id: 'cat-renda-extra', name: 'Renda Extra', type: 'income', group: 'ENTRADAS', isDefault: true, active: true },
  { id: 'cat-reembolso', name: 'Reembolso', type: 'income', group: 'ENTRADAS', isDefault: true, active: true },
  { id: 'cat-outras-entradas', name: 'Outros (Entradas)', type: 'income', group: 'ENTRADAS', isDefault: true, active: true },
];

export const INITIAL_RECURRING_EXPENSES: RecurringExpense[] = [];

export const INITIAL_CREDIT_CARDS: CreditCard[] = [];

export const INITIAL_INSTALLMENT_PLANS: InstallmentPlan[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_MONTHLY_BUDGETS: MonthlyBudget[] = [];

export const INITIAL_CATEGORY_BUDGETS: CategoryBudget[] = [];

