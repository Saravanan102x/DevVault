import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  BellRing,
  Sun,
  Moon,
  ChevronRight,
  Share2,
  ShieldCheck,
  Eye,
  Lock,
  Unlock,
  LogOut,
  X,
  Flame,
  Menu,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAccess } from '../../context/AccessContext'

interface HeaderProps {
  title: string
  subtitle?: string
  onOpenSearch: () => void
  onToggleMobileSidebar?: () => void
  dueCount?: number
  streakCount?: number
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenSearch,
  onToggleMobileSidebar,
  dueCount = 0,
}) => {
  const { theme, toggleTheme } = useTheme()
  const {
    isAdmin,
    shareReadOnlyLink,
    unlockAdmin,
    lockViewerMode,
    currentUser,
    isFirebaseActive,
    loginWithFirebase,
    registerWithFirebase,
    logoutFirebase,
  } = useAccess()

  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false)
  const [passcodeInput, setPasscodeInput] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [emailInput, setEmailInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isFirebaseActive) {
        let success = false
        if (authMode === 'login') {
          success = await loginWithFirebase(emailInput, passwordInput)
        } else {
          success = await registerWithFirebase(emailInput, passwordInput)
        }
        if (success) {
          setIsUnlockModalOpen(false)
          setEmailInput('')
          setPasswordInput('')
        }
      } else {
        const success = unlockAdmin(passcodeInput)
        if (success) {
          setIsUnlockModalOpen(false)
          setPasscodeInput('')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header className="dev-header h-13 px-3 sm:px-7 border-b border-[#E9EAF0] dark:border-[#262838] bg-white/95 dark:bg-[#14151F]/95 flex items-center justify-between shrink-0 sticky top-0 z-20">
        {/* Title & Section Context */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 pr-2 sm:pr-4">
          {onToggleMobileSidebar && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-1.5 -ml-1 rounded-lg text-[#777B8A] hover:text-[#20212A] dark:hover:text-[#F1F2F6] hover:bg-[#F5F6FA] dark:hover:bg-[#1E202E] transition-colors cursor-pointer shrink-0"
              aria-label="Toggle navigation drawer"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6] font-medium transition-colors shrink-0"
          >
            <img src="/favicon.svg" alt="DevVault" className="w-4 h-4 object-contain" />
            <span className="font-bold text-[#20212A] dark:text-[#F1F2F6]">DevVault</span>
          </Link>
          <ChevronRight className="hidden sm:inline w-3 h-3 text-[#B0B4C3] dark:text-[#5E6278] shrink-0" />
          <span className="text-xs font-semibold text-[#20212A] dark:text-[#F1F2F6] truncate max-w-[120px] sm:max-w-none hidden xs:inline">
            {title}
          </span>
          {subtitle && (
            <span className="text-xs text-[#777B8A] dark:text-[#9497A8] truncate hidden md:inline-block border-l border-[#E9EAF0] dark:border-[#262838] pl-2.5 ml-1">
              {subtitle}
            </span>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Share Read-Only Link Button */}
          <button
            onClick={shareReadOnlyLink}
            className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-[#F0EDFF] dark:bg-[#6C5CE7]/20 border border-[#6C5CE7]/35 text-[#6C5CE7] dark:text-[#8C7CFF] text-xs font-bold hover:bg-[#6C5CE7] hover:text-white dark:hover:bg-[#8C7CFF] dark:hover:text-black transition-all cursor-pointer shadow-2xs"
            title="Copy public Read-Only link to share with others (disables editing & deleting)"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share View Link</span>
          </button>

          {/* Role Status Pill */}
          {isAdmin ? (
            <div className="flex items-center gap-1">
              <span
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                title={currentUser?.email ? `Signed in as ${currentUser.email}` : 'Admin with full edit/delete permissions'}
              >
                {isFirebaseActive && <Flame className="w-3 h-3 text-amber-500 shrink-0" />}
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline max-w-[120px] truncate">
                  {currentUser?.email ? currentUser.email.split('@')[0] : 'Admin'}
                </span>
              </span>
              {currentUser && (
                <button
                  onClick={logoutFirebase}
                  className="p-1 text-[#777B8A] hover:text-red-500 rounded text-[11px] transition-colors cursor-pointer"
                  title="Sign out from Firebase Vault"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={lockViewerMode}
                className="hidden sm:inline-flex p-1 text-[#777B8A] hover:text-indigo-500 rounded text-[11px] transition-colors cursor-pointer"
                title="Preview as Read-Only Viewer"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25"
                title="Viewing in Read-Only Mode"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Read-Only</span>
              </span>
              <button
                onClick={() => setIsUnlockModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer shadow-2xs"
                title="Unlock Admin permissions"
              >
                <Lock className="w-3 h-3" />
                <span>{isFirebaseActive ? 'Sign In' : 'Unlock'}</span>
              </button>
            </div>
          )}

          {/* Command Palette Trigger (Desktop only) */}
          <button
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#F8F9FC] dark:bg-[#1A1C28] border border-[#E9EAF0] dark:border-[#2A2C3E] text-xs text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6] hover:border-[#6C5CE7]/40 transition-colors cursor-pointer"
            title="Search vault (Ctrl + K)"
          >
            <Search className="w-3 h-3 text-[#777B8A]" />
            <span className="hidden md:inline text-[11px]">Search...</span>
            <kbd className="px-1 py-0.2 text-[10px] font-mono bg-white dark:bg-[#232535] border border-[#E9EAF0] dark:border-[#35384D] rounded text-[#777B8A] dark:text-[#9497A8]">
              Ctrl K
            </kbd>
          </button>

          {/* Due Revision Indicator (Desktop only) */}
          {dueCount > 0 && (
            <Link
              to="/revision"
              className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F0EDFF] dark:bg-[#6C5CE7]/18 border border-[#DDD6FE] dark:border-[#6C5CE7]/30 text-[#6C5CE7] dark:text-[#8C7CFF] text-xs font-medium hover:opacity-90 transition-opacity"
              title={`${dueCount} revision cards due`}
            >
              <BellRing className="w-3 h-3" />
              <span className="text-[11px]">{dueCount} Due</span>
            </Link>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="p-1.5 rounded-lg bg-[#F8F9FC] dark:bg-[#1A1C28] border border-[#E9EAF0] dark:border-[#2A2C3E] text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6] transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-[#F59E0B]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#6C5CE7]" />
            )}
          </button>
        </div>
      </header>

      {/* Unlock / Authentication Modal */}
      {isUnlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="dev-card p-5 max-w-sm w-full space-y-4 shadow-xl border-[#6C5CE7]/40 relative">
            <button
              onClick={() => setIsUnlockModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#6C5CE7] dark:text-[#8C7CFF]">
                {isFirebaseActive && <Flame className="w-5 h-5 text-amber-500" />}
                <Unlock className="w-5 h-5" />
                <h3 className="font-bold text-base text-[#20212A] dark:text-[#F1F2F6]">
                  {isFirebaseActive
                    ? authMode === 'login'
                      ? 'Firebase Owner Login'
                      : 'Register Owner Vault'
                    : 'Unlock Admin Permissions'}
                </h3>
              </div>
              <p className="text-xs text-[#777B8A] dark:text-[#9497A8]">
                {isFirebaseActive
                  ? 'Sign in to access your private encrypted Cloud Firestore vault.'
                  : 'Enter your admin passcode to enable editing, creating, and deleting content.'}
              </p>
            </div>

            <form onSubmit={handleUnlockSubmit} className="space-y-3">
              {isFirebaseActive ? (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#777B8A] dark:text-[#9497A8] mb-1">
                      Owner Email
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="owner@example.com"
                      className="dev-input w-full px-3 py-2 text-sm"
                      autoFocus
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#777B8A] dark:text-[#9497A8] mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="dev-input w-full px-3 py-2 text-sm font-mono"
                      required
                    />
                  </div>
                </>
              ) : (
                <input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="Admin passcode..."
                  className="dev-input w-full px-3 py-2 text-sm font-mono"
                  autoFocus
                  required
                />
              )}
              {/* Mode Toggle link if Firebase is active */}
              {isFirebaseActive && (
                <div className="flex items-center justify-between text-xs pt-1">
                  {authMode === 'login' ? (
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="text-indigo-500 hover:underline cursor-pointer"
                    >
                      Need to create owner account?
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-indigo-500 hover:underline cursor-pointer"
                    >
                      Already have an account? Sign In
                    </button>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUnlockModalOpen(false)}
                  className="btn-secondary text-xs px-3 py-1.5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary text-xs px-3.5 py-1.5 font-bold cursor-pointer disabled:opacity-50"
                >
                  {loading
                    ? 'Authenticating...'
                    : isFirebaseActive && authMode === 'login'
                    ? 'Sign In to Vault'
                    : isFirebaseActive && authMode === 'register'
                    ? 'Create Vault Account'
                    : 'Unlock Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
