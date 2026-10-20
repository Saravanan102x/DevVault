import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import type { User } from 'firebase/auth'
import { authService } from '../services/firebase/authService'
import { isFirebaseConfigured } from '../services/firebase/config'

export type UserRole = 'admin' | 'viewer'

interface AccessContextType {
  role: UserRole
  isAdmin: boolean
  isViewer: boolean
  currentUser: User | null
  isFirebaseActive: boolean
  authLoading: boolean
  isGuestViewer: boolean
  continueAsGuest: () => void
  setRole: (role: UserRole) => void
  unlockAdmin: (passcode: string) => boolean
  loginWithFirebase: (email: string, pass: string) => Promise<boolean>
  registerWithFirebase: (email: string, pass: string) => Promise<boolean>
  logoutFirebase: () => Promise<void>
  lockViewerMode: () => void
  shareReadOnlyLink: () => void
  getReadOnlyUrl: () => string
}

const AccessContext = createContext<AccessContextType | undefined>(undefined)

const ROLE_STORAGE_KEY = 'devvault_user_role'

export const AccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isFirebaseActive = isFirebaseConfigured || import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState<boolean>(isFirebaseActive)

  const [role, setRoleState] = useState<UserRole>(() => {
    // 1. First priority: Check URL query parameter (for shareable read-only links)
    try {
      const params = new URLSearchParams(window.location.search)
      const accessParam = params.get('access') || params.get('role') || params.get('mode')
      if (accessParam === 'view' || accessParam === 'viewer' || accessParam === 'readonly') {
        return 'viewer'
      }
    } catch {
      // ignore
    }

    // 2. Second priority: Local storage
    try {
      const stored = localStorage.getItem(ROLE_STORAGE_KEY)
      if (stored === 'viewer') return 'viewer'
      if (stored === 'admin') return 'admin'
    } catch {
      // ignore
    }

    // 3. Default: Admin (for local dev mode)
    return 'admin'
  })

  // Listen to Firebase Auth state changes
  useEffect(() => {
    if (!isFirebaseActive) {
      setAuthLoading(false)
      return
    }

    const unsubscribe = authService.onStateChange((user) => {
      setCurrentUser(user)
      if (user) {
        setRoleState('admin')
      }
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [isFirebaseActive])

  // Watch for URL param changes if user navigates with ?access=view
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const accessParam = params.get('access') || params.get('role') || params.get('mode')
      if (accessParam === 'view' || accessParam === 'viewer' || accessParam === 'readonly') {
        setRoleState('viewer')
        try {
          sessionStorage.removeItem('devvault_admin_token')
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole)
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, newRole)
    } catch {
      // ignore
    }
  }

  const unlockAdmin = (passcode: string): boolean => {
    if (isFirebaseActive) {
      toast.error('Passcode unlock is disabled in Firebase mode. You must sign in with your verified owner account.')
      return false
    }

    const trimmed = passcode.trim()
    if (!trimmed) {
      toast.error('Please enter your admin passcode.')
      return false
    }

    try {
      sessionStorage.setItem('devvault_admin_token', trimmed)
    } catch {
      // ignore
    }

    setRole('admin')

    // Clean query parameter from URL
    try {
      const url = new URL(window.location.href)
      url.searchParams.delete('access')
      url.searchParams.delete('role')
      url.searchParams.delete('mode')
      const newSearch = url.searchParams.toString()
      window.history.replaceState(
        {},
        '',
        url.pathname + (newSearch ? `?${newSearch}` : '')
      )
    } catch {
      // ignore
    }
    toast.success('Admin mode unlocked! Authorization active. 🚀')
    return true
  }

  const loginWithFirebase = async (email: string, pass: string): Promise<boolean> => {
    try {
      const user = await authService.login(email, pass)
      setCurrentUser(user)
      setRole('admin')
      toast.success(`Welcome back, ${user.email}! Firebase Owner Vault unlocked. 🚀`)
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      toast.error(`Authentication error: ${message}`)
      return false
    }
  }

  const registerWithFirebase = async (email: string, pass: string): Promise<boolean> => {
    try {
      const user = await authService.register(email, pass)
      setCurrentUser(user)
      setRole('admin')
      toast.success(`Owner account created for ${user.email}! 🚀`)
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      toast.error(`Registration error: ${message}`)
      return false
    }
  }

  const logoutFirebase = async (): Promise<void> => {
    try {
      await authService.logout()
      setCurrentUser(null)
      lockViewerMode()
      toast.success('Signed out from Firebase Vault.')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Logout failed'
      toast.error(`Sign out error: ${message}`)
    }
  }

  const lockViewerMode = () => {
    try {
      sessionStorage.removeItem('devvault_admin_token')
    } catch {
      // ignore
    }
    setRole('viewer')
    toast('Switched to Read-Only Viewer mode. Editing is disabled.', {
      icon: '👁️',
    })
  }

  const getReadOnlyUrl = (): string => {
    const origin = window.location.origin
    const pathname = window.location.pathname
    return `${origin}${pathname}?access=view`
  }

  const shareReadOnlyLink = () => {
    const shareUrl = getReadOnlyUrl()
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(
        () => {
          toast.success(
            '🔗 Shareable Read-Only link copied!\nRecipients can only view and read.',
            { duration: 4500 }
          )
        },
        () => {
          window.prompt('Copy this Read-Only share link:', shareUrl)
        }
      )
    } else {
      window.prompt('Copy this Read-Only share link:', shareUrl)
    }
  }

  const isAdmin = isFirebaseActive ? Boolean(currentUser) : role === 'admin'
  const isViewer = !isAdmin
  const isGuestViewer = role === 'viewer'

  const continueAsGuest = () => {
    setRole('viewer')
    toast('Entered Read-Only Viewer mode. Enjoy exploring DevVault! 🚀', {
      icon: '👀',
    })
  }

  return (
    <AccessContext.Provider
      value={{
        role,
        isAdmin,
        isViewer,
        currentUser,
        isFirebaseActive,
        authLoading,
        isGuestViewer,
        continueAsGuest,
        setRole,
        unlockAdmin,
        loginWithFirebase,
        registerWithFirebase,
        logoutFirebase,
        lockViewerMode,
        shareReadOnlyLink,
        getReadOnlyUrl,
      }}
    >
      {children}
    </AccessContext.Provider>
  )
}

export const useAccess = (): AccessContextType => {
  const context = useContext(AccessContext)
  if (!context) {
    throw new Error('useAccess must be used within an AccessProvider')
  }
  return context
}
