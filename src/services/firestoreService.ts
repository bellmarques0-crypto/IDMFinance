import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
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

export interface AppCloudData {
  categories: Category[];
  transactions: Transaction[];
  recurring: RecurringExpense[];
  creditCards: CreditCard[];
  installmentPlans: InstallmentPlan[];
  monthlyBudgets: MonthlyBudget[];
  categoryBudgets: CategoryBudget[];
  recurringPayments: RecurringExpensePayment[];
}

export const FirestoreService = {
  // Check connection to Cloud Firestore
  async checkConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      return {
        connected: true,
        message: `Conectado ao Firebase Cloud Firestore com sucesso (${querySnapshot.size} categorias salvas)`,
      };
    } catch (err: any) {
      console.error('Firestore connection error:', err);
      return {
        connected: false,
        message: err.message || 'Erro ao conectar ao Firebase Cloud Firestore.',
      };
    }
  },

  // Load all cloud data from Firestore collections
  async fetchAllData(): Promise<AppCloudData> {
    try {
      const [
        catSnap,
        txSnap,
        recSnap,
        cardsSnap,
        plansSnap,
        mbSnap,
        cbSnap,
        paySnap,
      ] = await Promise.all([
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'transactions')),
        getDocs(collection(db, 'recurringExpenses')),
        getDocs(collection(db, 'creditCards')),
        getDocs(collection(db, 'installmentPlans')),
        getDocs(collection(db, 'monthlyBudgets')),
        getDocs(collection(db, 'categoryBudgets')),
        getDocs(collection(db, 'recurringPayments')),
      ]);

      return {
        categories: catSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Category)),
        transactions: txSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Transaction)),
        recurring: recSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as RecurringExpense)),
        creditCards: cardsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CreditCard)),
        installmentPlans: plansSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as InstallmentPlan)),
        monthlyBudgets: mbSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as MonthlyBudget)),
        categoryBudgets: cbSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CategoryBudget)),
        recurringPayments: paySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as RecurringExpensePayment)),
      };
    } catch (err) {
      console.error('Error fetching all data from Firestore:', err);
      throw err;
    }
  },

  // Save single items
  async saveDocument(collectionName: string, id: string, data: any): Promise<void> {
    try {
      await setDoc(doc(db, collectionName, id), data, { merge: true });
    } catch (err) {
      console.error(`Error saving document to ${collectionName}:`, err);
    }
  },

  // Delete single items
  async deleteDocument(collectionName: string, id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      console.error(`Error deleting document from ${collectionName}:`, err);
    }
  },

  // Bulk sync all app data to Firestore
  async syncAllData(data: Partial<AppCloudData>): Promise<void> {
    try {
      const batch = writeBatch(db);

      if (data.categories) {
        data.categories.forEach((item) => {
          batch.set(doc(db, 'categories', item.id), item, { merge: true });
        });
      }
      if (data.transactions) {
        data.transactions.forEach((item) => {
          batch.set(doc(db, 'transactions', item.id), item, { merge: true });
        });
      }
      if (data.recurring) {
        data.recurring.forEach((item) => {
          batch.set(doc(db, 'recurringExpenses', item.id), item, { merge: true });
        });
      }
      if (data.creditCards) {
        data.creditCards.forEach((item) => {
          batch.set(doc(db, 'creditCards', item.id), item, { merge: true });
        });
      }
      if (data.installmentPlans) {
        data.installmentPlans.forEach((item) => {
          batch.set(doc(db, 'installmentPlans', item.id), item, { merge: true });
        });
      }
      if (data.monthlyBudgets) {
        data.monthlyBudgets.forEach((item) => {
          batch.set(doc(db, 'monthlyBudgets', item.id), item, { merge: true });
        });
      }
      if (data.categoryBudgets) {
        data.categoryBudgets.forEach((item) => {
          batch.set(doc(db, 'categoryBudgets', item.id), item, { merge: true });
        });
      }
      if (data.recurringPayments) {
        data.recurringPayments.forEach((item) => {
          batch.set(doc(db, 'recurringPayments', item.id), item, { merge: true });
        });
      }

      await batch.commit();
    } catch (err) {
      console.error('Error batch syncing data to Firestore:', err);
    }
  },
};
