import React, { useState, useEffect } from 'react';
import {
  Category,
  CategoryBudget,
  CreditCard,
  InstallmentPlan,
  MonthlyBudget,
  NavigationTab,
  RecurringExpense,
  RecurringExpensePayment,
  Transaction,
  TransactionType,
} from './types';
import { StorageEngine } from './utils/storage';
import { FirestoreService } from './services/firestoreService';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { TransactionsView } from './components/Transactions/TransactionsView';
import { RecurringView } from './components/Recurring/RecurringView';
import { BudgetView } from './components/Budget/BudgetView';
import { ComparisonView } from './components/Comparison/ComparisonView';
import { CreditCardsView } from './components/CreditCards/CreditCardsView';
import { CategoriesView } from './components/Categories/CategoriesView';
import { ReportsView } from './components/Reports/ReportsView';
import { SettingsView } from './components/Settings/SettingsView';

import { TransactionModal } from './components/Modals/TransactionModal';
import { RecurringModal } from './components/Modals/RecurringModal';
import { CategoryModal } from './components/Modals/CategoryModal';
import { CreditCardModal } from './components/Modals/CreditCardModal';
import { InstallmentModal } from './components/Modals/InstallmentModal';
import { ConfirmDeleteModal } from './components/Modals/ConfirmDeleteModal';

export default function App() {
  // User Profile Name State
  const [currentUser, setCurrentUser] = useState<string>(() => localStorage.getItem('idm_user') || 'Izabel');

  // Current active navigation tab
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  // Selected Month/Year key, e.g. '2026-08'
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>('2026-08');

  // Mobile sidebar drawer
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // App Data States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [recurringPayments, setRecurringPayments] = useState<RecurringExpensePayment[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([]);
  const [monthlyBudgets, setMonthlyBudgets] = useState<MonthlyBudget[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);

  // Modals States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [txInitialType, setTxInitialType] = useState<TransactionType>('expense');

  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [editingRec, setEditingRec] = useState<RecurringExpense | null>(null);

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isInstModalOpen, setIsInstModalOpen] = useState(false);

  // Confirm Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'transaction' | 'recurring' | 'category' | 'card';
    item: any;
    title: string;
    description: string;
  } | null>(null);

  // Initialize and load data on boot with SQLite Sync
  const syncWithSqlite = async (dataToSync?: any) => {
    try {
      const payload = dataToSync || {
        categories: StorageEngine.getCategories(),
        transactions: StorageEngine.getTransactions(),
        recurring: StorageEngine.getRecurringExpenses(),
        creditCards: StorageEngine.getCreditCards(),
        installmentPlans: StorageEngine.getInstallmentPlans(),
        monthlyBudgets: StorageEngine.getMonthlyBudgets(),
        categoryBudgets: StorageEngine.getCategoryBudgets(selectedMonthYear),
      };

      await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Sync to SQLite failed:', err);
    }
  };

  const reloadData = async () => {
    StorageEngine.init();

    try {
      // Fetch data directly from Cloud Firestore
      const cloudData = await FirestoreService.fetchAllData();
      const hasCloudData =
        (cloudData.transactions && cloudData.transactions.length > 0) ||
        (cloudData.categories && cloudData.categories.length > 0) ||
        (cloudData.creditCards && cloudData.creditCards.length > 0);

      if (hasCloudData) {
        setCategories(cloudData.categories.length > 0 ? cloudData.categories : StorageEngine.getCategories());
        setTransactions(cloudData.transactions || []);
        setRecurringExpenses(cloudData.recurring || []);
        setCreditCards(cloudData.creditCards || []);
        setInstallmentPlans(cloudData.installmentPlans || []);
        setMonthlyBudgets(cloudData.monthlyBudgets || []);
        setCategoryBudgets(cloudData.categoryBudgets || []);
        setRecurringPayments(cloudData.recurringPayments || []);

        StorageEngine.setAllData({
          transactions: cloudData.transactions,
          categories: cloudData.categories,
          creditCards: cloudData.creditCards,
          recurring: cloudData.recurring,
          installmentPlans: cloudData.installmentPlans,
          monthlyBudgets: cloudData.monthlyBudgets,
          categoryBudgets: cloudData.categoryBudgets,
        });

        syncWithSqlite(cloudData);
        return;
      } else {
        // First run on Cloud Firestore: push initial state to Cloud Firestore
        const localCats = StorageEngine.getCategories();
        const localTxs = StorageEngine.getTransactions();
        const localRec = StorageEngine.getRecurringExpenses();
        const localCards = StorageEngine.getCreditCards();
        const localPlans = StorageEngine.getInstallmentPlans();
        const localMB = StorageEngine.getMonthlyBudgets();
        const localCB = StorageEngine.getCategoryBudgets(selectedMonthYear);
        const localPay = StorageEngine.getRecurringPayments();

        setCategories(localCats);
        setTransactions(localTxs);
        setRecurringExpenses(localRec);
        setCreditCards(localCards);
        setInstallmentPlans(localPlans);
        setMonthlyBudgets(localMB);
        setCategoryBudgets(localCB);
        setRecurringPayments(localPay);

        await FirestoreService.syncAllData({
          categories: localCats,
          transactions: localTxs,
          recurring: localRec,
          creditCards: localCards,
          installmentPlans: localPlans,
          monthlyBudgets: localMB,
          categoryBudgets: localCB,
          recurringPayments: localPay,
        });

        syncWithSqlite({
          categories: localCats,
          transactions: localTxs,
          recurring: localRec,
          creditCards: localCards,
          installmentPlans: localPlans,
          monthlyBudgets: localMB,
          categoryBudgets: localCB,
        });
        return;
      }
    } catch (err) {
      console.warn('Fetch from Cloud Firestore skipped/failed:', err);
    }

    // Fallback to initial local engine state
    setTransactions(StorageEngine.getTransactions());
    setCategories(StorageEngine.getCategories());
    setRecurringExpenses(StorageEngine.getRecurringExpenses());
    setRecurringPayments(StorageEngine.getRecurringPayments());
    setCreditCards(StorageEngine.getCreditCards());
    setInstallmentPlans(StorageEngine.getInstallmentPlans());
    setMonthlyBudgets(StorageEngine.getMonthlyBudgets());
    setCategoryBudgets(StorageEngine.getCategoryBudgets(selectedMonthYear));
  };

  useEffect(() => {
    reloadData();
  }, []);

  useEffect(() => {
    // Reload category budgets when month changes
    setCategoryBudgets(StorageEngine.getCategoryBudgets(selectedMonthYear));
  }, [selectedMonthYear]);

  // --- HANDLERS FOR TRANSACTIONS ---
  const handleOpenNewTransaction = (type: TransactionType = 'expense') => {
    setEditingTx(null);
    setTxInitialType(type);
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTx(tx);
    setTxInitialType(tx.type);
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => {
    StorageEngine.saveTransaction(txData);
    reloadData();
    syncWithSqlite();
  };

  const handleDeleteTransaction = (tx: Transaction) => {
    setDeleteTarget({
      type: 'transaction',
      item: tx,
      title: 'Excluir Lançamento',
      description: `Deseja realmente excluir o lançamento "${tx.description}" no valor de R$ ${tx.amount.toFixed(2)}?`,
    });
  };

  // --- HANDLERS FOR RECURRING EXPENSES ---
  const handleOpenNewRecurring = () => {
    setEditingRec(null);
    setIsRecModalOpen(true);
  };

  const handleEditRecurring = (rec: RecurringExpense) => {
    setEditingRec(rec);
    setIsRecModalOpen(true);
  };

  const handleSaveRecurring = (
    recData: Omit<RecurringExpense, 'id' | 'createdAt'> & { id?: string }
  ) => {
    StorageEngine.saveRecurringExpense(recData);
    reloadData();
    syncWithSqlite();
  };

  const handleDeleteRecurring = (rec: RecurringExpense) => {
    setDeleteTarget({
      type: 'recurring',
      item: rec,
      title: 'Excluir Despesa Fixa Recorrente',
      description: `Deseja excluir a regra de despesa fixa "${rec.description}"? O histórico de meses passados será mantido.`,
    });
  };

  const handleMarkRecurringAsPaid = (
    recurringId: string,
    monthYear: string,
    actualAmount: number,
    paidDate: string
  ) => {
    StorageEngine.markRecurringAsPaid(recurringId, monthYear, actualAmount, paidDate);
    reloadData();
  };

  // --- HANDLERS FOR CATEGORIES ---
  const handleOpenNewCategory = () => {
    setEditingCat(null);
    setIsCatModalOpen(true);
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCat(cat);
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = (catData: Omit<Category, 'id'> & { id?: string }) => {
    StorageEngine.saveCategory(catData);
    reloadData();
    syncWithSqlite();
  };

  const handleDeleteCategory = (cat: Category) => {
    if (cat.isDefault) {
      alert('Categorias padrão do sistema não podem ser excluídas.');
      return;
    }
    setDeleteTarget({
      type: 'category',
      item: cat,
      title: 'Excluir Categoria',
      description: `Deseja remover a categoria "${cat.name}"? Lançamentos existentes associados manterão seu histórico.`,
    });
  };

  // --- HANDLERS FOR CREDIT CARDS & INSTALLMENTS ---
  const handleSaveCreditCard = (cardData: Omit<CreditCard, 'id'>) => {
    StorageEngine.saveCreditCard(cardData);
    reloadData();
    syncWithSqlite();
  };

  const handleDeleteCreditCard = (id: string) => {
    const card = creditCards.find((c) => c.id === id);
    setDeleteTarget({
      type: 'card',
      item: card || { id },
      title: 'Excluir Cartão de Crédito',
      description: `Deseja excluir o cartão "${card ? card.name : ''}"?`,
    });
  };

  const handleSaveInstallmentPurchase = (planData: {
    description: string;
    creditCardId: string;
    categoryId: string;
    purchaseDate: string;
    totalAmount: number;
    installments: number;
    expenseType: 'fixed' | 'variable';
  }) => {
    StorageEngine.createInstallmentPurchase(planData);
    reloadData();
    syncWithSqlite();
  };

  // --- HANDLERS FOR BUDGETS ---
  const handleSaveMonthlyBudget = (monthYear: string, overallAmount: number) => {
    StorageEngine.saveMonthlyBudget(monthYear, overallAmount);
    reloadData();
    syncWithSqlite();
  };

  const handleSaveCategoryBudget = (
    monthYear: string,
    categoryId: string,
    amount: number
  ) => {
    StorageEngine.saveCategoryBudget(monthYear, categoryId, amount);
    reloadData();
    syncWithSqlite();
  };

  const handleDeleteCategoryBudget = (id: string) => {
    StorageEngine.deleteCategoryBudget(id);
    reloadData();
    syncWithSqlite();
  };

  // --- CONFIRM DELETE EXECUTION ---
  const handleExecuteDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'transaction') {
      StorageEngine.deleteTransaction(deleteTarget.item.id);
    } else if (deleteTarget.type === 'recurring') {
      StorageEngine.deleteRecurringExpense(deleteTarget.item.id);
    } else if (deleteTarget.type === 'category') {
      StorageEngine.deleteCategory(deleteTarget.item.id);
    } else if (deleteTarget.type === 'card') {
      StorageEngine.deleteCreditCard(deleteTarget.item.id);
    }

    setDeleteTarget(null);
    reloadData();
    syncWithSqlite();
  };

  // --- SETTINGS HANDLERS ---
  const handleResetSampleData = () => {
    StorageEngine.resetToSampleData();
    reloadData();
    syncWithSqlite();
  };

  const handleClearAllData = () => {
    StorageEngine.clearAllData();
    reloadData();
    syncWithSqlite();
  };

  // Handle User Profile Update
  const handleUpdateUser = (user: string) => {
    localStorage.setItem('idm_user', user);
    setCurrentUser(user);
  };

  // Find monthly budget for selected month
  const currentMonthlyBudget = monthlyBudgets.find((b) => b.monthYear === selectedMonthYear);

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex text-slate-800 antialiased font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Sticky Header with Month Selector & Quick Actions */}
        <Header
          selectedMonthYear={selectedMonthYear}
          onMonthYearChange={setSelectedMonthYear}
          onOpenNewTransaction={(type) => handleOpenNewTransaction(type)}
          onOpenNewRecurring={handleOpenNewRecurring}
          onOpenNewInstallment={() => setIsInstModalOpen(true)}
          onToggleSidebarMobile={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* View Component Renderer */}
        <main className="p-4 lg:p-8 max-w-7xl mx-auto w-full flex-1">
          {activeTab === 'dashboard' && (
            <DashboardView
              selectedMonthYear={selectedMonthYear}
              transactions={transactions}
              categories={categories}
              onNavigateToTab={setActiveTab}
              onOpenNewTransaction={handleOpenNewTransaction}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              selectedMonthYear={selectedMonthYear}
              transactions={transactions}
              categories={categories}
              onOpenNewTransaction={() => handleOpenNewTransaction('expense')}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'recurring' && (
            <RecurringView
              selectedMonthYear={selectedMonthYear}
              recurringExpenses={recurringExpenses}
              payments={recurringPayments}
              transactions={transactions}
              categories={categories}
              onOpenNewRecurring={handleOpenNewRecurring}
              onEditRecurring={handleEditRecurring}
              onDeleteRecurring={handleDeleteRecurring}
              onMarkAsPaid={handleMarkRecurringAsPaid}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetView
              selectedMonthYear={selectedMonthYear}
              monthlyBudget={currentMonthlyBudget}
              categoryBudgets={categoryBudgets}
              transactions={transactions}
              categories={categories}
              onSaveMonthlyBudget={handleSaveMonthlyBudget}
              onSaveCategoryBudget={handleSaveCategoryBudget}
              onDeleteCategoryBudget={handleDeleteCategoryBudget}
            />
          )}

          {activeTab === 'comparison' && (
            <ComparisonView
              selectedMonthYear={selectedMonthYear}
              transactions={transactions}
              categories={categories}
            />
          )}

          {activeTab === 'credit_cards' && (
            <CreditCardsView
              creditCards={creditCards}
              installmentPlans={installmentPlans}
              transactions={transactions}
              categories={categories}
              onOpenNewCreditCard={() => setIsCardModalOpen(true)}
              onOpenNewInstallment={() => setIsInstModalOpen(true)}
              onDeleteCreditCard={handleDeleteCreditCard}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesView
              categories={categories}
              onOpenNewCategory={handleOpenNewCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              selectedMonthYear={selectedMonthYear}
              transactions={transactions}
              categories={categories}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              onResetSampleData={handleResetSampleData}
              onClearAllData={handleClearAllData}
              currentUser={currentUser}
              onUpdateUser={handleUpdateUser}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTx}
        categories={categories}
        creditCards={creditCards}
        initialType={txInitialType}
      />

      <RecurringModal
        isOpen={isRecModalOpen}
        onClose={() => setIsRecModalOpen(false)}
        onSave={handleSaveRecurring}
        editingRecurring={editingRec}
        categories={categories}
      />

      <CategoryModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        onSave={handleSaveCategory}
        editingCategory={editingCat}
      />

      <CreditCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onSave={handleSaveCreditCard}
      />

      <InstallmentModal
        isOpen={isInstModalOpen}
        onClose={() => setIsInstModalOpen(false)}
        onSave={handleSaveInstallmentPurchase}
        categories={categories}
        creditCards={creditCards}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.title}
        description={deleteTarget?.description}
        onConfirm={handleExecuteDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
