import React, { useState, useEffect } from 'react'
import { Outlet, useLocation, NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  Code2,
  Network,
  BookOpen,
  Menu,
} from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { GlobalSearchModal } from '../search/GlobalSearchModal'
import { LoginScreen } from '../auth/LoginScreen'
import { dashboardApi } from '../../services/api'
import { useAccess } from '../../context/AccessContext'

export const AppLayout: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()
  const { isViewer, isFirebaseActive, currentUser, authLoading, isGuestViewer } = useAccess()

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname, location.search])

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
      case '/system-design':
        return { title: 'System Design', subtitle: 'High-level architecture, reference links, trade-offs, and design write-ups' }
      case '/companies':
        return { title: 'Company Hub', subtitle: 'Target companies, interview questions, and specific tracks' }
      case '/revision':
        return { title: 'Revision Center', subtitle: 'Active recall system powered by SM-2 spaced repetition algorithm' }
      case '/journal':
        return { title: 'Daily Journal', subtitle: 'Track daily engineering progress, reflections, and solved blockers' }
      case '/checklist':
        return { title: 'To-Do & Checklist', subtitle: 'Track preparation milestones, mock interview tasks, and goals' }
      case '/settings':
        return { title: 'Settings', subtitle: 'Manage JSON flat-file storage, backups, and tags' }
      default:
        return { title: 'DevVault', subtitle: '' }
    }
  }

  const { title, subtitle } = getPageInfo()

  return (
    <div className="flex h-screen dev-app overflow-hidden font-sans transition-colors duration-200">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex h-full">
        <Sidebar onOpenSearch={() => setSearchOpen(true)} />
      </div>

      {/* Mobile / Tablet Drawer & Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          isMobileDrawer={true}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onOpenSearch={() => {
            setMobileSidebarOpen(false)
            setSearchOpen(true)
          }}
        />
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden dev-app relative">
        <Header
          title={title}
          subtitle={subtitle}
          onOpenSearch={() => setSearchOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          dueCount={stats?.revisionDueToday ?? 0}
          streakCount={stats?.practiceStreak ?? 1}
        />

        {/* Read-Only Notice Bar for Guests / Shared Links */}
        {isViewer && (
          <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/25 px-3 sm:px-7 py-1.5 text-xs text-amber-700 dark:text-amber-300 font-medium flex items-center justify-between shrink-0">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="truncate">
                <strong>Read-Only Mode:</strong> Shared by Saravanan K (SDE-2).
              </span>
            </span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-7 sm:py-6 lg:px-8 lg:py-6 pb-20 lg:pb-6 custom-scrollbar">
          <div key={location.pathname + location.search} className="page-transition max-w-6xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* Mobile / Tablet Bottom Navigation Bar */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#14151F]/95 backdrop-blur-md border-t border-[#E9EAF0] dark:border-[#262838] px-2 py-1.5 flex items-center justify-around shadow-lg">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
                isActive
                  ? 'text-[#6C5CE7] dark:text-[#8C7CFF]'
                  : 'text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/problems"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
                isActive
                  ? 'text-cyan-600 dark:text-cyan-400'
                  : 'text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
              }`
            }
          >
            <Code2 className="w-4 h-4" />
            <span>DSA</span>
          </NavLink>

          <NavLink
            to="/system-design"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
                isActive
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
              }`
            }
          >
            <Network className="w-4 h-4" />
            <span>Sys Design</span>
          </NavLink>

          <NavLink
            to="/notes"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
              }`
            }
          >
            <BookOpen className="w-4 h-4" />
            <span>Notes</span>
          </NavLink>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-bold text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6] cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>Menu</span>
          </button>
        </nav>
      </div>

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  )
}
