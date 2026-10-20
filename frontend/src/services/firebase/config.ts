import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  connectFirestoreEmulator,
  type Firestore,
} from 'firebase/firestore'

// Safe Public Web Configuration (Vite Environment Variables)
// WARNING: Service account keys, private keys, and administrative secrets must NEVER be placed here.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-devvault.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-devvault',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-devvault.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456',
}

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
)

const app: FirebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)

// Cloud Firestore with Multi-Tab IndexedDB Local Persistence
// Drastically conserves Spark Plan free-tier read quota (50k reads/day) by serving repeated queries from disk
export const db: Firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
})

export const auth: Auth = getAuth(app)

// Connect to local emulator if enabled
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectFirestoreEmulator(db, '127.0.0.1', 8085)
    connectAuthEmulator(auth, 'http://127.0.0.1:9099')
    console.info('🔌 Connected DevVault to local Firebase Emulators (Firestore: 8085, Auth: 9099)')
  } catch {
    // Ignore emulator re-connection errors during fast-refresh
  }
}
