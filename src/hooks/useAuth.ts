'use client';
import { useEffect } from 'react';
import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { getAuth } from '@/lib/firebase/config';
import {
  getUserProfile,
  createUserProfile,
  seedDefaultCategories,
} from '@/lib/firebase/firestore';
import { useAuthStore } from '@/store/authStore';

export function useAuthListener() {
  const { setUser, setLoading, clearAuth } = useAuthStore();

  useEffect(() => {
    // getAuth() is only called client-side (inside useEffect)
    const auth = getAuth();
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        document.cookie = `firebase-auth-token=${token}; path=/; max-age=3600; SameSite=Strict`;

        let profile = await getUserProfile(firebaseUser.uid);
        if (!profile) {
          await createUserProfile(firebaseUser.uid, {
            name: firebaseUser.displayName ?? '',
            email: firebaseUser.email ?? '',
            monthlyIncome: 0,
            monthlyBudget: 0,
            savingsTarget: 0,
            currency: 'USD',
          });
          await seedDefaultCategories(firebaseUser.uid);
          profile = await getUserProfile(firebaseUser.uid);
        }
        setUser(profile);
      } else {
        document.cookie = 'firebase-auth-token=; path=/; max-age=0';
        clearAuth();
      }
    });

    return () => unsubscribe();
  }, [setUser, setLoading, clearAuth]);
}

export async function login(email: string, password: string) {
  await signInWithEmailAndPassword(getAuth(), email, password);
}

export async function register(name: string, email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(getAuth(), email, password);
  await updateProfile(credential.user, { displayName: name });
  return credential.user;
}

export async function logout() {
  await signOut(getAuth());
  document.cookie = 'firebase-auth-token=; path=/; max-age=0';
}
