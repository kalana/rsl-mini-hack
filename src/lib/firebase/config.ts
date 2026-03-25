/* eslint-disable @typescript-eslint/no-require-imports */
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// Firebase is a browser-only library. We lazily initialize it so that
// Next.js can SSR pages without Firebase trying to validate credentials.
let _auth: Auth | undefined;
let _db: Firestore | undefined;

function getApp() {
  const { initializeApp, getApps, getApp: _getApp } = require('firebase/app');
  const firebaseConfig = {
    apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  return getApps().length === 0 ? initializeApp(firebaseConfig) : _getApp();
}

export function getAuth(): Auth {
  if (!_auth) {
    const { getAuth: _getAuth } = require('firebase/auth');
    _auth = _getAuth(getApp());
  }
  return _auth!;
}

export function getDb(): Firestore {
  if (!_db) {
    const { getFirestore: _getFirestore } = require('firebase/firestore');
    _db = _getFirestore(getApp());
  }
  return _db!;
}
