import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  Building2,
  BrainCircuit,
  CalendarCheck,
  FolderGit2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
  Search,
  FileText,
  Network,
  Layers,
  CheckSquare,
  X,
} from 'lucide-react'
import { useAccess } from '../../context/AccessContext'

interface SidebarProps {
  onOpenSearch?: () => void
  onCloseMobile?: () => void
  isMobileDrawer?: boolean
}

const SIDEBAR_COLLAPSED_KEY = 'devvault_sidebar_collapsed'

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenSearch,
  onCloseMobile,
  isMobileDrawer = false,
}) => {
  const { isAdmin } = useAccess()
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (isMobileDrawer) return false
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
    } catch {
      return false
    }
  })
  const location = useLocation()

  useEffect(() => {
    if (isMobileDrawer) return
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
    } catch {
      // Ignore storage error
    }
  }, [collapsed, isMobileDrawer])

  const toggleCollapse = () => {
    setCollapsed((prev) => !prev)
  }

  // Version 3 Navigation Items strictly organized
  const navItems = [
    {
      to: '/',
      label: 'Home',
      icon: LayoutDashboard,
      color: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
      exact: true,
    },
    {
      to: '/notes',
      label: 'My Library',
      icon: BookOpen,
      color: 'text-indigo-500 dark:text-indigo-400',
      bg: 'bg-indigo-500/15 dark:bg-indigo-500/20',
      exact: true,
    },
    {
      to: '/problems',
      label: 'DSA Problems',
      icon: Code2,
      color: 'text-cyan-500 dark:text-cyan-400',
      bg: 'bg-cyan-500/15 dark:bg-cyan-500/20',
      exact: true,
    },
    {
      to: '/system-design',
      label: 'System Design',
      icon: Network,
      color: 'text-purple-500 dark:text-purple-400',
      bg: 'bg-purple-500/15 dark:bg-purple-500/20',
      exact: true,
    },
    {
      to: '/companies',
      label: 'Company Hub',
      icon: Building2,
      color: 'text-orange-500 dark:text-orange-400',
      bg: 'bg-orange-500/15 dark:bg-orange-500/20',
      exact: true,
    },
    {
      to: '/notes?folder=Technical',
      label: 'Technical Notes',
      icon: FileText,
      color: 'text-sky-500 dark:text-sky-400',
      bg: 'bg-sky-500/15 dark:bg-sky-500/20',
      exact: false,
      pathOnly: '/notes',
      queryCheck: 'folder=Technical',
    },
    {
      to: '/checklist',
      label: 'To-Do & Checklist',
      icon: CheckSquare,
      color: 'text-green-500 dark:text-green-400',
      bg: 'bg-green-500/15 dark:bg-green-500/20',
      exact: true,
    },
    {
      to: '/diagrams',
      label: 'Architecture Diagrams',
      icon: Layers,
      color: 'text-fuchsia-500 dark:text-fuchsia-400',
      bg: 'bg-fuchsia-500/15 dark:bg-fuchsia-500/20',
      exact: true,
    },
    {
      to: '/revision',
      label: 'Revision Center',
      icon: BrainCircuit,
      color: 'text-rose-500 dark:text-rose-400',
      bg: 'bg-rose-500/15 dark:bg-rose-500/20',
      exact: true,
    },
    {
      to: '/journal',
      label: 'Daily Journal',
      icon: CalendarCheck,
      color: 'text-teal-500 dark:text-teal-400',
      bg: 'bg-teal-500/15 dark:bg-teal-500/20',
      exact: true,
    },
    {
      to: '/projects',
      label: 'Projects',
      icon: FolderGit2,
      color: 'text-blue-500 dark:text-blue-400',
      bg: 'bg-blue-500/15 dark:bg-blue-500/20',
      exact: true,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
      color: 'text-slate-400 dark:text-slate-300',
      bg: 'bg-slate-400/15 dark:bg-slate-400/20',
      exact: true,
      adminOnly: true,
    },
  ].filter((item) => !item.adminOnly || isAdmin)

  const isItemActive = (item: (typeof navItems)[0]) => {
    const currentPath = location.pathname
    const currentSearch = location.search

    if (item.queryCheck) {
      return currentPath === item.pathOnly && currentSearch.includes(item.queryCheck)
    }
    if (item.exact) {
      if (item.to === '/') return currentPath === '/'
      if (item.to === '/notes') return currentPath === '/notes' && !currentSearch.includes('folder=')
      return currentPath === item.to
    }
    return currentPath === item.to
  }

  const isCollapsed = isMobileDrawer ? false : collapsed

  return (
    <aside
      className={`${
        isMobileDrawer
          ? 'w-72 max-w-[85vw]'
          : isCollapsed
          ? 'w-16'
          : 'w-64'
      } dev-sidebar border-r border-[#E9EAF0] dark:border-[#262838] bg-white dark:bg-[#14151F] flex flex-col h-full select-none shrink-0 z-30 transition-[width] duration-200 ease-in-out`}
    >
      {/* Brand Header */}
      <div className="h-14 px-3 border-b border-[#E9EAF0] dark:border-[#262838] flex items-center justify-between shrink-0">
        <NavLink
          to="/"
          onClick={() => {
            if (onCloseMobile) onCloseMobile()
          }}
          className="flex items-center gap-2.5 overflow-hidden group"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <img
              src="/favicon.svg"
              alt="DevVault"
              className="w-6 h-6 object-contain drop-shadow-xs"
            />
          </div>
          {!isCollapsed && (
            <div className="truncate animate-fade-in">
              <span className="text-base font-bold text-[#20212A] dark:text-white tracking-tight block">
                DevVault
              </span>
            </div>
          )}
        </NavLink>

        {isMobileDrawer ? (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-[#777B8A] hover:text-[#20212A] dark:hover:text-[#F1F2F6] hover:bg-[#F5F6FA] dark:hover:bg-[#1E202E] cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-md text-[#777B8A] hover:text-[#20212A] dark:hover:text-[#F1F2F6] hover:bg-[#F5F6FA] dark:hover:bg-[#1E202E] transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Search Quick Action (New Entry removed per user request) */}
      <div className="p-2.5 border-b border-[#E9EAF0]/80 dark:border-[#262838]/80">
        <button
          onClick={() => {
            if (onCloseMobile) onCloseMobile()
            if (onOpenSearch) onOpenSearch()
          }}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-2' : 'justify-between px-2.5 py-1.5'
          } rounded-lg bg-[#F8F9FC] dark:bg-[#1A1C28] border border-[#E9EAF0] dark:border-[#2B2D3F] text-xs text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6] hover:border-[#6C5CE7]/40 transition-colors cursor-pointer group`}
          title={isCollapsed ? 'Search (Ctrl K)' : undefined}
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-[#777B8A] group-hover:text-[#6C5CE7] dark:group-hover:text-[#8C7CFF] transition-colors shrink-0" />
            {!isCollapsed && <span className="text-xs font-medium">Search vault...</span>}
          </div>
          {!isCollapsed && (
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-[#232535] border border-[#E9EAF0] dark:border-[#34374C] rounded text-[#777B8A] dark:text-[#9497A8]">
              Ctrl K
            </kbd>
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isItemActive(item)
          return (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={() => {
                if (onCloseMobile) onCloseMobile()
              }}
              title={isCollapsed ? item.label : undefined}
              className={`group relative flex items-center ${
                isCollapsed ? 'justify-center px-1' : 'px-2.5'
              } py-2 rounded-xl text-[13.5px] transition-all duration-150 ${
                active
                  ? 'bg-[#F0EDFF] dark:bg-[#6C5CE7]/30 text-[#6C5CE7] dark:text-white font-bold shadow-2xs'
                  : 'text-[#20212A] dark:text-white hover:text-[#000000] dark:hover:text-white hover:bg-[#F5F6FA] dark:hover:bg-[#1C1E2A] font-medium'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${item.bg}`}
              >
                <Icon className={`w-4 h-4 stroke-[2.2] ${item.color}`} />
              </div>
              {!isCollapsed && (
                <span className="ml-2.5 truncate tracking-tight text-[#20212A] dark:text-white">
                  {item.label}
                </span>
              )}

              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#20212A] text-white text-[12px] font-sans font-medium rounded-md shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Vault Status Footer */}
      <div className="p-2.5 border-t border-[#E9EAF0] dark:border-[#262838] shrink-0">
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center' : 'gap-2'
          } text-xs text-[#777B8A] dark:text-[#9497A8]`}
          title="DevVault: Zero-Cost Firebase Spark"
        >
          <Database className="w-3.5 h-3.5 text-[#6C5CE7] dark:text-[#8C7CFF] shrink-0" />
          {!isCollapsed && (
            <div className="truncate text-[11px]">
              <span className="text-[#20212A] dark:text-[#F1F2F6] font-medium block truncate">
                DevVault Active
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
