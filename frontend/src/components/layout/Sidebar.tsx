import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  Building2,
  BrainCircuit,
  CalendarCheck,
  FolderGit2,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Database,
  Search,
  FileText,
  Network,
  CheckSquare,
} from 'lucide-react'
import { useAccess } from '../../context/AccessContext'

interface SidebarProps {
  onOpenSearch?: () => void
  onQuickAdd?: (type: 'note' | 'problem' | 'question' | 'journal') => void
}

const SIDEBAR_COLLAPSED_KEY = 'devvault_sidebar_collapsed'

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSearch, onQuickAdd }) => {
  const { isAdmin } = useAccess()
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
    } catch {
      // Ignore storage error
    }
  }, [collapsed])

  const toggleCollapse = () => {
    setCollapsed((prev) => !prev)
  }

  // Version 3 Navigation Items strictly adhering to Section 3 of design requirements
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
      icon: Network,
      color: 'text-purple-500 dark:text-purple-400',
      bg: 'bg-purple-500/15 dark:bg-purple-500/20',
      exact: true,
    },
    {
      to: '/revision',
      label: 'Revision Center',
      icon: BrainCircuit,
      color: 'text-fuchsia-500 dark:text-fuchsia-400',
      bg: 'bg-fuchsia-500/15 dark:bg-fuchsia-500/20',
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

  const isItemActive = (item: typeof navItems[0]) => {
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

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } dev-sidebar border-r border-[#E9EAF0] dark:border-[#262838] bg-white dark:bg-[#14151F] flex flex-col h-screen select-none shrink-0 z-30 transition-[width] duration-200 ease-in-out`}
    >
      {/* Brand Header */}
      <div className="h-14 px-3 border-b border-[#E9EAF0] dark:border-[#262838] flex items-center justify-between shrink-0">
        <NavLink to="/" className="flex items-center gap-2.5 overflow-hidden group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <img
              src="/favicon.svg"
              alt="DevVault"
              className="w-6 h-6 object-contain drop-shadow-xs"
            />
          </div>
          {!collapsed && (
            <div className="truncate animate-fade-in">
              <span className="text-base font-bold text-[#20212A] dark:text-white tracking-tight block">
                DevVault
              </span>
            </div>
          )}
        </NavLink>

        <button
          onClick={toggleCollapse}
          className="p-1.5 rounded-md text-[#777B8A] hover:text-[#20212A] dark:hover:text-[#F1F2F6] hover:bg-[#F5F6FA] dark:hover:bg-[#1E202E] transition-colors cursor-pointer"
          title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Search & New Entry Actions */}
      <div className="p-2.5 space-y-1.5 border-b border-[#E9EAF0]/80 dark:border-[#262838]/80">
        {/* Search Quick Trigger */}
        <button
          onClick={onOpenSearch}
          className={`w-full flex items-center ${
            collapsed ? 'justify-center p-2' : 'justify-between px-2.5 py-1.5'
          } rounded-lg bg-[#F8F9FC] dark:bg-[#1A1C28] border border-[#E9EAF0] dark:border-[#2B2D3F] text-xs text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6] hover:border-[#6C5CE7]/40 transition-colors cursor-pointer group`}
          title={collapsed ? 'Search (Ctrl K)' : undefined}
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-[#777B8A] group-hover:text-[#6C5CE7] dark:group-hover:text-[#8C7CFF] transition-colors shrink-0" />
            {!collapsed && <span className="text-xs font-medium">Search vault...</span>}
          </div>
          {!collapsed && (
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-[#232535] border border-[#E9EAF0] dark:border-[#34374C] rounded text-[#777B8A] dark:text-[#9497A8]">
              Ctrl K
            </kbd>
          )}
        </button>

        {/* New Entry Action (Owner Only) */}
        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => setQuickAddOpen(!quickAddOpen)}
              className={`btn-primary w-full py-1.5 px-2.5 text-xs font-semibold tracking-normal flex items-center ${
                collapsed ? 'justify-center' : 'justify-center gap-1.5'
              }`}
              title={collapsed ? 'New Entry' : undefined}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
              {!collapsed && <span>New Entry</span>}
            </button>

            {quickAddOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setQuickAddOpen(false)}
                />
                <div
                  className={`absolute top-10 dev-card shadow-xl py-1.5 z-50 text-xs animate-fade-in ${
                    collapsed ? 'left-14 w-52' : 'left-0 right-0'
                  }`}
                >
                  <button
                    onClick={() => {
                      setQuickAddOpen(false)
                      navigate('/problems')
                    }}
                    className="w-full px-3 py-1.5 text-left text-[#20212A] dark:text-[#F1F2F6] hover:bg-[#F0EDFF] dark:hover:bg-[#6C5CE7]/15 hover:text-[#6C5CE7] dark:hover:text-[#8C7CFF] flex items-center gap-2 transition-colors cursor-pointer font-medium"
                  >
                    <Code2 className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Coding Problem</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuickAddOpen(false)
                      if (onQuickAdd) onQuickAdd('note')
                      else navigate('/notes')
                    }}
                    className="w-full px-3 py-1.5 text-left text-[#20212A] dark:text-[#F1F2F6] hover:bg-[#F0EDFF] dark:hover:bg-[#6C5CE7]/15 hover:text-[#6C5CE7] dark:hover:text-[#8C7CFF] flex items-center gap-2 transition-colors cursor-pointer font-medium"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Technical Note</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuickAddOpen(false)
                      navigate('/checklist')
                    }}
                    className="w-full px-3 py-1.5 text-left text-[#20212A] dark:text-[#F1F2F6] hover:bg-[#F0EDFF] dark:hover:bg-[#6C5CE7]/15 hover:text-[#6C5CE7] dark:hover:text-[#8C7CFF] flex items-center gap-2 transition-colors cursor-pointer font-medium"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-green-500" />
                    <span>Checklist Task</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuickAddOpen(false)
                      navigate('/companies')
                    }}
                    className="w-full px-3 py-1.5 text-left text-[#20212A] dark:text-[#F1F2F6] hover:bg-[#F0EDFF] dark:hover:bg-[#6C5CE7]/15 hover:text-[#6C5CE7] dark:hover:text-[#8C7CFF] flex items-center gap-2 transition-colors cursor-pointer font-medium"
                  >
                    <Building2 className="w-3.5 h-3.5 text-orange-500" />
                    <span>Interview Question</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuickAddOpen(false)
                      navigate('/journal')
                    }}
                    className="w-full px-3 py-1.5 text-left text-[#20212A] dark:text-[#F1F2F6] hover:bg-[#F0EDFF] dark:hover:bg-[#6C5CE7]/15 hover:text-[#6C5CE7] dark:hover:text-[#8C7CFF] flex items-center gap-2 transition-colors cursor-pointer font-medium"
                  >
                    <CalendarCheck className="w-3.5 h-3.5 text-teal-500" />
                    <span>Journal Entry</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
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
              title={collapsed ? item.label : undefined}
              className={`group relative flex items-center ${
                collapsed ? 'justify-center px-1' : 'px-2.5'
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
              {!collapsed && (
                <span className="ml-2.5 truncate tracking-tight text-[#20212A] dark:text-white">
                  {item.label}
                </span>
              )}

              {/* Collapsed Tooltip */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#20212A] text-white text-[12px] font-sans font-medium rounded-md shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Storage Status Footer */}
      <div className="p-2.5 border-t border-[#E9EAF0] dark:border-[#262838] shrink-0">
        <div
          className={`flex items-center ${
            collapsed ? 'justify-center' : 'gap-2'
          } text-xs text-[#777B8A] dark:text-[#9497A8]`}
          title="Storage: Local JSON Flat-Files"
        >
          <Database className="w-3.5 h-3.5 text-[#6C5CE7] dark:text-[#8C7CFF] shrink-0" />
          {!collapsed && (
            <div className="truncate text-[11px]">
              <span className="text-[#20212A] dark:text-[#F1F2F6] font-medium block truncate">
                Local Vault Active
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
