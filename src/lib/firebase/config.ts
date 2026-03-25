import { initializeApp, getApps, getApp as _getApp } from 'firebase/app';
import { getAuth as _getAuth } from 'firebase/auth';
import { getFirestore as _getFirestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// Firebase is a browser-only library. We guard initialization here but
// let Firebase's own internal singletons handle caching — do NOT cache
// _auth / _db ourselves, since Next.js Fast Refresh resets module scope
// while Firebase's internal registry persists, causing type-identity mismatches.

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getApp() {
  return getApps().length === 0 ? initializeApp(firebaseConfig) : _getApp();
}

export function getAuth(): Auth {
  return _getAuth(getApp());
}

export function getDb(): Firestore {
  return _getFirestore(getApp());
}
