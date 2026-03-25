import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { getDb } from './config';
import type { Transaction, Category, UserProfile, TransactionType } from '@/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function toDate(value: Timestamp | Date | string | undefined): Date {
  if (!value) return new Date();
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return new Date(value);
}

// ─── User Profile ────────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    name: data.name ?? '',
    email: data.email ?? '',
    monthlyIncome: data.monthlyIncome ?? 0,
    monthlyBudget: data.monthlyBudget ?? 0,
    savingsTarget: data.savingsTarget ?? 0,
    currency: data.currency ?? 'USD',
    createdAt: toDate(data.createdAt),
  };
}

export async function createUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  const db = getDb();
  await setDoc(doc(db, 'users', userId), {
    ...data,
    createdAt: serverTimestamp(),
  }, { merge: true });
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  const db = getDb();
  await setDoc(doc(db, 'users', userId), data, { merge: true });
}

// ─── Transactions ────────────────────────────────────────────────────────────

function transactionFromDoc(snap: { id: string; data: () => Record<string, unknown> }): Transaction {
  const data = snap.data();
  return {
    id: snap.id,
    userId: data.userId as string,
    type: data.type as TransactionType,
    amount: data.amount as number,
    categoryId: data.categoryId as string,
    date: toDate(data.date as Timestamp | Date | undefined),
    note: data.note as string | undefined,
    createdAt: toDate(data.createdAt as Timestamp | Date | undefined),
  };
}

export function subscribeToTransactions(
  userId: string,
  callback: (transactions: Transaction[]) => void
) {
  const db = getDb();
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId)
  );
  return onSnapshot(q, (snapshot) => {
    const sorted = snapshot.docs
      .map(transactionFromDoc)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    callback(sorted);
  });
}

export async function addTransaction(
  data: Omit<Transaction, 'id' | 'createdAt'>
): Promise<string> {
  const db = getDb();
  const ref = await addDoc(collection(db, 'transactions'), {
    ...data,
    date: Timestamp.fromDate(data.date),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTransaction(
  id: string,
  data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const db = getDb();
  const update: Record<string, unknown> = { ...data };
  if (data.date) update.date = Timestamp.fromDate(data.date);
  await updateDoc(doc(db, 'transactions', id), update);
}

export async function deleteTransaction(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), 'transactions', id));
}

// ─── Categories ──────────────────────────────────────────────────────────────

function categoryFromDoc(snap: { id: string; data: () => Record<string, unknown> }): Category {
  const data = snap.data();
  return {
    id: snap.id,
    userId: data.userId as string,
    name: data.name as string,
    color: data.color as string,
    icon: data.icon as string,
    isDefault: (data.isDefault as boolean) ?? false,
  };
}

export function subscribeToCategories(
  userId: string,
  callback: (categories: Category[]) => void
) {
  const db = getDb();
  const q = query(collection(db, 'categories'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(categoryFromDoc));
  });
}

export async function getCategories(userId: string): Promise<Category[]> {
  const db = getDb();
  const q = query(collection(db, 'categories'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(categoryFromDoc);
}

export async function addCategory(data: Omit<Category, 'id'>): Promise<string> {
  const ref = await addDoc(collection(getDb(), 'categories'), data);
  return ref.id;
}

export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, 'id' | 'userId'>>
): Promise<void> {
  await updateDoc(doc(getDb(), 'categories', id), data as Record<string, unknown>);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), 'categories', id));
}

// ─── Default categories ───────────────────────────────────────────────────────

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'userId'>[] = [
  { name: 'Food',          color: '#fb923c', icon: '🍔', isDefault: true },
  { name: 'Transport',     color: '#60a5fa', icon: '🚗', isDefault: true },
  { name: 'Shopping',      color: '#a78bfa', icon: '🛍️', isDefault: true },
  { name: 'Health',        color: '#4ade80', icon: '💊', isDefault: true },
  { name: 'Bills',         color: '#f87171', icon: '📄', isDefault: true },
  { name: 'Salary',        color: '#34d399', icon: '💰', isDefault: true },
  { name: 'Other',         color: '#94a3b8', icon: '📦', isDefault: true },
  { name: 'Entertainment', color: '#f472b6', icon: '🎬', isDefault: true },
  { name: 'Education',     color: '#818cf8', icon: '📚', isDefault: true },
  { name: 'Savings',       color: '#2dd4bf', icon: '🏦', isDefault: true },
];

export async function seedDefaultCategories(userId: string): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  for (const cat of DEFAULT_CATEGORIES) {
    const ref = doc(collection(db, 'categories'));
    batch.set(ref, { ...cat, userId });
  }
  await batch.commit();
}
