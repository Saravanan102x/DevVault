import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  FileText,
  Code2,
  HelpCircle,
  ArrowRight,
  Loader2,
  X,
  LayoutDashboard,
  FolderGit2,
  FileCode2,
  Building2,
  BrainCircuit,
  CalendarCheck,
  Settings,
  Sun,
  Moon,
  Plus,
} from 'lucide-react'
import { searchApi } from '../../services/api'
import type { SearchResult, Note, Problem, InterviewQuestion } from '../../types'
import { Badge } from '../common/Badge'
import { useTheme } from '../../context/ThemeContext'

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

interface CommandAction {
  id: string
  title: string
  subtitle?: string
  icon: React.ElementType
  category: 'Actions' | 'Navigation'
  shortcut?: string
  perform: () => void
}

interface FlatResultItem {
  id: string
  title: string
  snippet: string
  type: 'NOTE' | 'PROBLEM' | 'INTERVIEW_QUESTION'
  tags: string[]
}

type SearchCategory = 'ALL' | 'NOTE' | 'PROBLEM' | 'INTERVIEW_QUESTION' | 'ACTION'

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('ALL')
  const [results, setResults] = useState<FlatResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  // Suggested popular tags/topics for instant search
  const popularTopics = [
    'Concurrency',
    'Two-Pointers',
    'LRU Cache',
    'Dynamic Programming',
    'System Design',
    'PayPal',
    'Walmart',
    'Spring Boot',
  ]

  // Predefined Command Actions
  const commandActions: CommandAction[] = [
    {
      id: 'cmd-create-problem',
      title: 'Add a new Coding Problem',
      subtitle: 'Record DSA problem with Java solution and complexity analysis',
      icon: Plus,
      category: 'Actions',
      shortcut: 'P',
      perform: () => navigate('/problems'),
    },
    {
      id: 'cmd-create-note',
      title: 'Write a Technical Note',
      subtitle: 'Create architecture, JVM, or system design note',
      icon: Plus,
      category: 'Actions',
      shortcut: 'N',
      perform: () => navigate('/notes'),
    },
    {
      id: 'cmd-start-revision',
      title: 'Start a Revision Session',
      subtitle: 'Review cards due for SM-2 spaced repetition',
      icon: BrainCircuit,
      category: 'Actions',
      shortcut: 'R',
      perform: () => navigate('/revision'),
    },
    {
      id: 'cmd-toggle-theme',
      title: theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      subtitle: 'Toggle between warm editorial light and charcoal dark themes',
      icon: theme === 'dark' ? Sun : Moon,
      category: 'Actions',
      shortcut: 'T',
      perform: () => toggleTheme(),
    },
    {
      id: 'cmd-nav-dashboard',
      title: 'Open Dashboard',
      subtitle: 'Personal developer workspace overview',
      icon: LayoutDashboard,
      category: 'Navigation',
      perform: () => navigate('/'),
    },
    {
      id: 'cmd-nav-notes',
      title: 'Open My Library & Notes',
      subtitle: 'Technical notes, JVM internals, and architecture docs',
      icon: FileText,
      category: 'Navigation',
      perform: () => navigate('/notes'),
    },
    {
      id: 'cmd-nav-problems',
      title: 'Open DSA Problems',
      subtitle: 'Algorithmic problem catalog and solutions workspace',
      icon: Code2,
      category: 'Navigation',
      perform: () => navigate('/problems'),
    },
    {
      id: 'cmd-nav-companies',
      title: 'Open Company Hub',
      subtitle: 'Target company tracks: PayPal, Walmart, Freshworks, etc.',
      icon: Building2,
      category: 'Navigation',
      perform: () => navigate('/companies'),
    },
    {
      id: 'cmd-nav-revision',
      title: 'Open Revision Center',
      subtitle: 'Active recall system powered by SM-2 spaced repetition',
      icon: BrainCircuit,
      category: 'Navigation',
      perform: () => navigate('/revision'),
    },
    {
      id: 'cmd-nav-diagrams',
      title: 'Open Architecture Diagrams',
      subtitle: 'Draw.io diagrams and system blueprints',
      icon: FileCode2,
      category: 'Navigation',
      perform: () => navigate('/diagrams'),
    },
    {
      id: 'cmd-nav-projects',
      title: 'Open Projects Showcase',
      subtitle: 'Repositories, system architecture designs, and live deployments',
      icon: FolderGit2,
      category: 'Navigation',
      perform: () => navigate('/projects'),
    },
    {
      id: 'cmd-nav-journal',
      title: 'Open Daily Journal',
      subtitle: 'Daily learning logs, achievements, and reflections',
      icon: CalendarCheck,
      category: 'Navigation',
      perform: () => navigate('/journal'),
    },
    {
      id: 'cmd-nav-settings',
      title: 'Open Vault Settings',
      subtitle: 'Manage JSON flat-file storage, backups, and tags',
      icon: Settings,
      category: 'Navigation',
      perform: () => navigate('/settings'),
    },
  ]

  const filteredCommands = query.trim()
    ? commandActions.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.subtitle?.toLowerCase().includes(query.toLowerCase())
      )
    : commandActions

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 40)
      setQuery('')
      setSelectedCategory('ALL')
      setResults([])
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Live search backend when query changes
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const data: SearchResult = await searchApi.search(trimmed)
        const flat: FlatResultItem[] = []

        data.notes?.forEach((n: Note) => {
          flat.push({
            id: n.id,
            title: n.title,
            snippet: n.content ? n.content.slice(0, 120).replace(/^[#\s]+/, '') : '',
            type: 'NOTE',
            tags: n.tags || [],
          })
        })

        data.problems?.forEach((p: Problem) => {
          flat.push({
            id: p.id,
            title: p.title,
            snippet: p.statement ? p.statement.slice(0, 120).replace(/^[#\s]+/, '') : '',
            type: 'PROBLEM',
            tags: p.tags || [],
          })
        })

        data.questions?.forEach((q: InterviewQuestion) => {
          flat.push({
            id: q.id,
            title: q.question,
            snippet: q.answer ? q.answer.slice(0, 120).replace(/^[#\s]+/, '') : '',
            type: 'INTERVIEW_QUESTION',
            tags: q.tags || [],
          })
        })

        setResults(flat)
      } catch (err) {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 180)

    return () => clearTimeout(timeout)
  }, [query])

  // Apply category filtering
  const visibleResults = results.filter((item) => {
    if (selectedCategory === 'ALL') return true
    if (selectedCategory === 'ACTION') return false
    return item.type === selectedCategory
  })

  const visibleCommands =
    selectedCategory === 'ALL' || selectedCategory === 'ACTION' ? filteredCommands : []

  const isResultsMode = query.trim().length >= 2 && selectedCategory !== 'ACTION'
  const currentTotal = isResultsMode ? visibleResults.length : visibleCommands.length

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (currentTotal > 0 ? (prev + 1) % currentTotal : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (currentTotal > 0 ? (prev - 1 + currentTotal) % currentTotal : 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (isResultsMode) {
          if (visibleResults[selectedIndex]) {
            handleSelectResult(visibleResults[selectedIndex])
          }
        } else {
          if (visibleCommands[selectedIndex]) {
            onClose()
            visibleCommands[selectedIndex].perform()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentTotal, selectedIndex, isResultsMode, visibleResults, visibleCommands])

  const handleSelectResult = (item: FlatResultItem) => {
    onClose()
    if (item.type === 'NOTE') navigate(`/notes`)
    else if (item.type === 'PROBLEM') navigate(`/problems`)
    else if (item.type === 'INTERVIEW_QUESTION') navigate(`/companies`)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'NOTE':
        return <FileText className="w-4 h-4 text-[#6C5CE7] dark:text-[#8C7CFF]" />
      case 'PROBLEM':
        return <Code2 className="w-4 h-4 text-[#6C5CE7] dark:text-[#8C7CFF]" />
      case 'INTERVIEW_QUESTION':
        return <HelpCircle className="w-4 h-4 text-[#777B8A] dark:text-[#9497A8]" />
      default:
        return <FileText className="w-4 h-4 text-[#777B8A] dark:text-[#9497A8]" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#20212A]/40 dark:bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Palette Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#171822] border border-[#E9EAF0] dark:border-[#262838] rounded-lg shadow-xl overflow-hidden z-10 flex flex-col max-h-[82vh] animate-in fade-in duration-120">
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-[#E9EAF0] dark:border-[#262838] bg-[#F8F9FC] dark:bg-[#14151F]">
          <Search className="w-4 h-4 text-[#777B8A] dark:text-[#9497A8] mr-2.5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Search notes, DSA problems, interview questions, or commands..."
            className="w-full py-3 bg-transparent text-[#20212A] dark:text-[#F1F2F6] placeholder-[#777B8A] dark:placeholder-[#9497A8] text-xs focus:outline-none font-medium"
          />
          {loading && <Loader2 className="w-3.5 h-3.5 text-[#6C5CE7] dark:text-[#8C7CFF] animate-spin mr-2 shrink-0" />}
          {query && (
            <button
              onClick={() => {
                setQuery('')
                setSelectedIndex(0)
              }}
              className="p-1 rounded text-[#777B8A] hover:text-[#20212A] dark:hover:text-[#F1F2F6] mr-1 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[#777B8A] dark:text-[#9497A8] bg-[#F0EDFF] dark:bg-[#1E202E] rounded border border-[#E9EAF0] dark:border-[#262838]">
            ESC
          </kbd>
        </div>

        {/* Quick Category Filter Tabs */}
        <div className="flex items-center gap-1 px-4 py-1.5 bg-[#F8F9FC] dark:bg-[#14151F] border-b border-[#E9EAF0] dark:border-[#262838] overflow-x-auto text-[11px]">
          {(
            [
              { id: 'ALL', label: 'All' },
              { id: 'NOTE', label: 'Notes' },
              { id: 'PROBLEM', label: 'DSA' },
              { id: 'INTERVIEW_QUESTION', label: 'Interview Qs' },
              { id: 'ACTION', label: 'Commands' },
            ] as const
          ).map((tab) => {
            const isActive = selectedCategory === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedCategory(tab.id)
                  setSelectedIndex(0)
                }}
                className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer shrink-0 font-medium ${
                  isActive
                    ? 'bg-[#6C5CE7] dark:bg-[#8C7CFF] text-white shadow-2xs'
                    : 'text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6] hover:bg-[#F0EDFF] dark:hover:bg-[#1E202E]'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-2 custom-scrollbar flex-1">
          {/* Quick Topic Chips when query is empty and ALL category */}
          {!query.trim() && selectedCategory === 'ALL' && (
            <div className="px-2 pt-1 pb-2 border-b border-[#E9EAF0]/60 dark:border-[#262838]/60 mb-2">
              <div className="text-[10px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8] mb-1.5">
                Popular Vault Topics
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {popularTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => {
                      setQuery(topic)
                      setSelectedIndex(0)
                    }}
                    className="text-[11px] px-2 py-0.5 rounded bg-[#F0EDFF] dark:bg-[#1E202E] text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6] hover:bg-[#F0EDFF] dark:hover:bg-[#282A3C] border border-[#E9EAF0]/60 dark:border-[#262838] transition-colors cursor-pointer"
                  >
                    #{topic.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isResultsMode ? (
            /* Results View */
            visibleResults.length > 0 ? (
              <div className="space-y-1">
                <div className="px-2.5 py-1 text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
                  Search Results ({visibleResults.length})
                </div>
                {visibleResults.map((item, idx) => {
                  const isSelected = idx === selectedIndex
                  return (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleSelectResult(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left p-2.5 rounded transition-colors flex items-start gap-2.5 group cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-[#F0EDFF] dark:bg-[#1E202E] border-l-2 border-[#6C5CE7] dark:border-[#8C7CFF] text-[#20212A] dark:text-[#F1F2F6]'
                          : 'hover:bg-[#F8F9FC] dark:hover:bg-[#1A1C28] text-[#20212A] dark:text-[#F1F2F6]'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">{getTypeIcon(item.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#20212A] dark:text-[#F1F2F6] truncate">
                            {item.title}
                          </span>
                          <Badge size="sm" variant="purple">
                            {item.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        {item.snippet && (
                          <p className="text-[11px] text-[#777B8A] dark:text-[#9497A8] mt-0.5 line-clamp-1">
                            {item.snippet}
                          </p>
                        )}
                      </div>
                      <ArrowRight
                        className={`w-3.5 h-3.5 text-[#6C5CE7] dark:text-[#8C7CFF] self-center shrink-0 transition-opacity ${
                          isSelected ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
            ) : !loading ? (
              <div className="py-10 text-center text-[#777B8A] dark:text-[#9497A8] text-xs">
                No matching entries found for "{query}".
              </div>
            ) : null
          ) : (
            /* Command Palette Menu */
            <div className="space-y-3 py-1">
              {['Actions', 'Navigation'].map((category) => {
                const items = visibleCommands.filter((c) => c.category === category)
                if (items.length === 0) return null

                return (
                  <div key={category} className="space-y-0.5">
                    <div className="px-2.5 py-1 text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
                      {category}
                    </div>
                    {items.map((cmd) => {
                      const actualIdx = visibleCommands.findIndex((c) => c.id === cmd.id)
                      const isSelected = actualIdx === selectedIndex
                      const Icon = cmd.icon

                      return (
                        <button
                          key={cmd.id}
                          onClick={() => {
                            onClose()
                            cmd.perform()
                          }}
                          onMouseEnter={() => setSelectedIndex(actualIdx)}
                          className={`w-full text-left px-2.5 py-2 rounded transition-colors flex items-center justify-between group cursor-pointer text-xs ${
                            isSelected
                              ? 'bg-[#F0EDFF] dark:bg-[#1E202E] border-l-2 border-[#6C5CE7] dark:border-[#8C7CFF] text-[#20212A] dark:text-[#F1F2F6]'
                              : 'hover:bg-[#F8F9FC] dark:hover:bg-[#1A1C28] text-[#20212A] dark:text-[#F1F2F6]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className="w-3.5 h-3.5 text-[#777B8A] dark:text-[#9497A8] group-hover:text-[#6C5CE7] dark:group-hover:text-[#8C7CFF] shrink-0" />
                            <div className="truncate">
                              <span className="font-medium text-[#20212A] dark:text-[#F1F2F6] block truncate">
                                {cmd.title}
                              </span>
                              {cmd.subtitle && (
                                <span className="text-[10px] text-[#777B8A] dark:text-[#9497A8] block truncate">
                                  {cmd.subtitle}
                                </span>
                              )}
                            </div>
                          </div>
                          {cmd.shortcut && (
                            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#777B8A] dark:text-[#9497A8] bg-[#F0EDFF] dark:bg-[#1E202E] rounded border border-[#E9EAF0] dark:border-[#262838] shrink-0 ml-2">
                              {cmd.shortcut}
                            </kbd>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#E9EAF0] dark:border-[#262838] bg-[#F8F9FC] dark:bg-[#14151F] flex items-center justify-between text-[11px] text-[#777B8A] dark:text-[#9497A8]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-white dark:bg-[#1E202E] border border-[#E9EAF0] dark:border-[#262838] px-1 rounded text-[10px]">↑</kbd>{' '}
              <kbd className="font-mono bg-white dark:bg-[#1E202E] border border-[#E9EAF0] dark:border-[#262838] px-1 rounded text-[10px]">↓</kbd> navigate
            </span>
            <span>
              <kbd className="font-mono bg-white dark:bg-[#1E202E] border border-[#E9EAF0] dark:border-[#262838] px-1 rounded text-[10px]">↵</kbd> select
            </span>
          </div>
          <span className="hidden sm:inline">DevVault Quick Navigation</span>
        </div>
      </div>
    </div>
  )
}
