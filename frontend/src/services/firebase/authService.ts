import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth } from './config'

const OWNER_EMAIL = (import.meta.env.VITE_DEVVAULT_OWNER_EMAIL || '').trim().toLowerCase()

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
    if (OWNER_EMAIL && cred.user.email?.toLowerCase() !== OWNER_EMAIL) {
      await signOut(auth)
      throw new Error(`Unauthorized: Only the designated DevVault owner (${OWNER_EMAIL}) may sign in.`)
    }
    return cred.user
  },

  register: async (email: string, password: string): Promise<User> => {
    if (OWNER_EMAIL && email.trim().toLowerCase() !== OWNER_EMAIL) {
      throw new Error(`Registration restricted: Only the owner email (${OWNER_EMAIL}) can be registered.`)
    }
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
    return cred.user
  },

  logout: async (): Promise<void> => {
    await signOut(auth)
  },

  onStateChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (user) => {
      if (user && OWNER_EMAIL && user.email?.toLowerCase() !== OWNER_EMAIL) {
        signOut(auth).then(() => callback(null))
        return
      }
      callback(user)
    })
  },

  getCurrentUser: (): User | null => auth.currentUser,

  getOwnerEmail: (): string => OWNER_EMAIL,
}
