import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { GlobalSearchModal } from '../search/GlobalSearchModal'
import { LoginScreen } from '../auth/LoginScreen'
import { dashboardApi } from '../../services/api'
import { useAccess } from '../../context/AccessContext'

export const AppLayout: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const { isViewer, isFirebaseActive, currentUser, authLoading, isGuestViewer } = useAccess()

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Fetch quick dashboard stats for header indicators
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.stats,
    refetchInterval: 60000,
  })

  if (isFirebaseActive && authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen dev-app">
        <div className="w-9 h-9 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono text-[#777B8A] dark:text-[#9497A8]">Connecting to DevVault secure vault...</p>
      </div>
    )
  }

  if (isFirebaseActive && !currentUser && !isGuestViewer) {
    return <LoginScreen />
  }

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/':
        return { title: 'Workspace Home', subtitle: 'Personal developer dashboard & learning overview' }
      case '/projects':
        return { title: 'Projects Showcase', subtitle: 'Active repositories, system architecture, and deployments' }
      case '/diagrams':
        return { title: 'Architecture Diagrams', subtitle: 'Draw.io diagrams (.drawio, .png, .svg, .xml) by engineering topic' }
      case '/notes':
        return { title: 'My Library', subtitle: 'Personal knowledge base, JVM internals, system patterns' }
      case '/problems':
        return { title: 'DSA Problems', subtitle: 'Algorithmic workspace with multi-approach solutions and complexity' }
      case '/companies':
        return { title: 'Company Hub', subtitle: 'Target companies, interview questions, and specific tracks' }
      case '/revision':
        return { title: 'Revision Center', subtitle: 'Active recall system powered by SM-2 spaced repetition algorithm' }
      case '/journal':
        return { title: 'Daily Journal', subtitle: 'Track daily engineering progress, reflections, and solved blockers' }
      case '/settings':
        return { title: 'Settings', subtitle: 'Manage JSON flat-file storage, backups, and tags' }
      default:
        return { title: 'DevVault', subtitle: '' }
    }
  }

  const { title, subtitle } = getPageInfo()

  return (
    <div className="flex h-screen dev-app overflow-hidden font-sans transition-colors duration-200">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden dev-app">
        <Header
          title={title}
          subtitle={subtitle}
          onOpenSearch={() => setSearchOpen(true)}
          dueCount={stats?.revisionDueToday ?? 0}
          streakCount={stats?.practiceStreak ?? 1}
        />

        {/* Read-Only Notice Bar for Guests / Shared Links */}
        {isViewer && (
          <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/25 px-4 sm:px-7 py-1.5 text-xs text-amber-700 dark:text-amber-300 font-medium flex items-center justify-between shrink-0">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>
                <strong>Read-Only Mode:</strong> Shared by Saravanan K (SDE-2). You can view, search, and study all notes, code solutions, and interview tracks.
              </span>
            </span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-6 lg:px-8 lg:py-6 custom-scrollbar">
          <div key={location.pathname + location.search} className="page-transition max-w-6xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  )
}
