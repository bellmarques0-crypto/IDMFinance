import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
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

// Remove undefined fields which cause setDoc errors in Firebase SDK
function cleanForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(cleanForFirestore);
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        cleaned[key] = cleanForFirestore(val);
      }
    }
    return cleaned;
  }
  return obj;
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

  // Real-time listener for changes across all collections
  subscribeToData(onUpdate: (data: AppCloudData) => void): () => void {
    const collections = [
      'categories',
      'transactions',
      'recurringExpenses',
      'creditCards',
      'installmentPlans',
      'monthlyBudgets',
      'categoryBudgets',
      'recurringPayments',
    ];

    const currentData: Partial<AppCloudData> = {};

    const unsubscribes = collections.map((colName) => {
      return onSnapshot(
        collection(db, colName),
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          if (colName === 'recurringExpenses') {
            currentData.recurring = docs as RecurringExpense[];
          } else {
            (currentData as any)[colName] = docs;
          }

          onUpdate({
            categories: currentData.categories || [],
            transactions: currentData.transactions || [],
            recurring: currentData.recurring || [],
            creditCards: currentData.creditCards || [],
            installmentPlans: currentData.installmentPlans || [],
            monthlyBudgets: currentData.monthlyBudgets || [],
            categoryBudgets: currentData.categoryBudgets || [],
            recurringPayments: currentData.recurringPayments || [],
          });
        },
        (error) => {
          console.warn(`Realtime listener warning on ${colName}:`, error);
        }
      );
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  },

  // Save single items
  async saveDocument(collectionName: string, id: string, data: any): Promise<void> {
    try {
      const cleanData = cleanForFirestore(data);
      await setDoc(doc(db, collectionName, id), cleanData, { merge: true });
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
          batch.set(doc(db, 'categories', item.id), cleanForFirestore(item), { merge: true });
        });
      }
      if (data.transactions) {
        data.transactions.forEach((item) => {
          batch.set(doc(db, 'transactions', item.id), cleanForFirestore(item), { merge: true });
        });
      }
      if (data.recurring) {
        data.recurring.forEach((item) => {
          batch.set(doc(db, 'recurringExpenses', item.id), cleanForFirestore(item), { merge: true });
        });
      }
      if (data.creditCards) {
        data.creditCards.forEach((item) => {
          batch.set(doc(db, 'creditCards', item.id), cleanForFirestore(item), { merge: true });
        });
      }
      if (data.installmentPlans) {
        data.installmentPlans.forEach((item) => {
          batch.set(doc(db, 'installmentPlans', item.id), cleanForFirestore(item), { merge: true });
        });
      }
      if (data.monthlyBudgets) {
        data.monthlyBudgets.forEach((item) => {
          batch.set(doc(db, 'monthlyBudgets', item.id), cleanForFirestore(item), { merge: true });
        });
      }
      if (data.categoryBudgets) {
        data.categoryBudgets.forEach((item) => {
          batch.set(doc(db, 'categoryBudgets', item.id), cleanForFirestore(item), { merge: true });
        });
      }
      if (data.recurringPayments) {
        data.recurringPayments.forEach((item) => {
          batch.set(doc(db, 'recurringPayments', item.id), cleanForFirestore(item), { merge: true });
        });
      }

      await batch.commit();
    } catch (err) {
      console.error('Error batch syncing data to Firestore:', err);
    }
  },
};
