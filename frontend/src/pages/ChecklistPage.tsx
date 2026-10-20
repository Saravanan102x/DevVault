import React, { useState, useEffect, useMemo } from 'react'
import {
  CheckSquare,
  Square,
  Plus,
  Calendar,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { ChecklistItem, ChecklistPriority } from '../types'
import { Modal } from '../components/common/Modal'
import { useAccess } from '../context/AccessContext'

const STORAGE_KEY = 'devvault_checklist_items'

const DEFAULT_TASKS: ChecklistItem[] = [
  {
    id: 'task-1',
    title: 'Master JVM Garbage Collection (G1 vs ZGC pause times & tuning flags)',
    description: 'Understand young/tenured generation compaction, STW pauses, and throughput trade-offs.',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'HIGH',
    category: 'Core Java',
    completed: false,
    referenceUrl: 'https://docs.oracle.com/en/java/javase/21/gctuning/',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Solve 2 Medium Graph & BFS/DFS problems (Rotting Oranges, Word Ladder)',
    description: 'Focus on clean modular Java solution with time & space complexity analysis.',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'HIGH',
    category: 'DSA Practice',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Revise Kafka Consumer Groups, Partitions & Rebalance Protocols',
    description: 'Study eager vs cooperative sticky assignors and consumer lag monitoring.',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    priority: 'MEDIUM',
    category: 'System Design',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Review STAR method answers for PayPal & Walmart SDE-2 Rounds',
    description: 'Prepare 3 compelling stories: complex technical challenge, production incident, cross-team conflict.',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    priority: 'MEDIUM',
    category: 'Interview Prep',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Deep dive into Java 21 Virtual Threads & Loom vs Reactive WebFlux',
    description: 'Benchmarking carrier threads vs continuation-based user-mode threads.',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    priority: 'HIGH',
    category: 'Core Java',
    completed: true,
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
]

export const ChecklistPage: React.FC = () => {
  const { isAdmin } = useAccess()
  const [tasks, setTasks] = useState<ChecklistItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // fallback
    }
    return DEFAULT_TASKS
  })

  // Filter & Search State
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'DUE_TODAY' | 'OVERDUE'>('ALL')
  const [filterCategory, setFilterCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('dueDate')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formDueDate, setFormDueDate] = useState(new Date().toISOString().split('T')[0])
  const [formPriority, setFormPriority] = useState<ChecklistPriority>('HIGH')
  const [formCategory, setFormCategory] = useState('Core Java')
  const [formReferenceUrl, setFormReferenceUrl] = useState('')

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // ignore
    }
  }, [tasks])

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>(['Core Java', 'DSA Practice', 'System Design', 'Interview Prep', 'Work', 'Architecture'])
    tasks.forEach((t) => {
      if (t.category) set.add(t.category)
    })
    return Array.from(set)
  }, [tasks])

  // Metrics
  const totalCount = tasks.length
  const completedCount = tasks.filter((t) => t.completed).length
  const pendingCount = totalCount - completedCount
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const dueTodayCount = tasks.filter((t) => !t.completed && t.dueDate === todayStr).length
  const overdueCount = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr).length

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchTitle = t.title.toLowerCase().includes(q)
          const matchDesc = t.description?.toLowerCase().includes(q)
          const matchCat = t.category.toLowerCase().includes(q)
          if (!matchTitle && !matchDesc && !matchCat) return false
        }

        // Status Filter
        if (filterStatus === 'PENDING') return !t.completed
        if (filterStatus === 'COMPLETED') return t.completed
        if (filterStatus === 'DUE_TODAY') return !t.completed && t.dueDate === todayStr
        if (filterStatus === 'OVERDUE') return !t.completed && t.dueDate && t.dueDate < todayStr

        // Category Filter
        if (filterCategory !== 'ALL' && t.category !== filterCategory) return false

        return true
      })
      .sort((a, b) => {
        // Pending first
        if (a.completed !== b.completed) return a.completed ? 1 : -1

        if (sortBy === 'dueDate') {
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return a.dueDate.localeCompare(b.dueDate)
        }
        if (sortBy === 'priority') {
          const priorityScore = { HIGH: 3, MEDIUM: 2, LOW: 1 }
          return priorityScore[b.priority] - priorityScore[a.priority]
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [tasks, filterStatus, filterCategory, searchQuery, sortBy, todayStr])

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const next = !t.completed
          if (next) {
            toast.success('Task completed! Keep the momentum! 🚀')
          }
          return {
            ...t,
            completed: next,
            completedAt: next ? new Date().toISOString() : undefined,
          }
        }
        return t
      })
    )
  }

  const deleteTask = (id: string, taskTitle?: string) => {
    if (window.confirm(`Delete checklist task "${taskTitle || 'this task'}"?`)) {
      setTasks((prev) => prev.filter((t) => t.id !== id))
      toast.success('Task removed')
    }
  }

  const handleOpenCreate = () => {
    setEditId(null)
    setFormTitle('')
    setFormDescription('')
    setFormDueDate(todayStr)
    setFormPriority('HIGH')
    setFormCategory('Core Java')
    setFormReferenceUrl('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (task: ChecklistItem) => {
    setEditId(task.id)
    setFormTitle(task.title)
    setFormDescription(task.description || '')
    setFormDueDate(task.dueDate || todayStr)
    setFormPriority(task.priority)
    setFormCategory(task.category)
    setFormReferenceUrl(task.referenceUrl || '')
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      toast.error('Task title is required')
      return
    }

    if (editId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editId
            ? {
                ...t,
                title: formTitle.trim(),
                description: formDescription.trim() || undefined,
                dueDate: formDueDate || undefined,
                priority: formPriority,
                category: formCategory.trim() || 'General',
                referenceUrl: formReferenceUrl.trim() || undefined,
              }
            : t
        )
      )
      toast.success('Task updated')
    } else {
      const newTask: ChecklistItem = {
        id: `task-${Date.now()}`,
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        dueDate: formDueDate || undefined,
        priority: formPriority,
        category: formCategory.trim() || 'General',
        completed: false,
        referenceUrl: formReferenceUrl.trim() || undefined,
        createdAt: new Date().toISOString(),
      }
      setTasks((prev) => [newTask, ...prev])
      toast.success('New task added to your checklist!')
    }

    setIsModalOpen(false)
  }

  const setDueDatePreset = (daysFromToday: number) => {
    const target = new Date()
    target.setDate(target.getDate() + daysFromToday)
    setFormDueDate(target.toISOString().split('T')[0])
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-[#E9EAF0] dark:border-[#262838]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckSquare className="w-4 h-4" />
            <span>Productivity & Milestone Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#20212A] dark:text-[#F1F2F6] tracking-tight mt-1">
            To-Do List & Preparation Checklist
          </h1>
          <p className="text-xs text-[#777B8A] dark:text-[#9497A8] mt-1 font-medium">
            Manage your daily tasks, target dates, DSA practice schedules, and technical goals with high accountability.
          </p>
        </div>

        {isAdmin && (
          <button onClick={handleOpenCreate} className="btn-primary text-xs px-3.5 py-2 cursor-pointer shadow-sm">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="font-semibold">Add New Task</span>
          </button>
        )}
      </div>

      {/* 2. Metrics & Progress Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="dev-card p-3.5 space-y-1">
          <div className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">Total Tasks</div>
          <div className="text-xl sm:text-2xl font-bold text-[#20212A] dark:text-[#F1F2F6]">{totalCount}</div>
          <div className="text-[11px] text-[#777B8A] dark:text-[#9497A8]">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{completedCount}</span> completed
          </div>
        </div>

        <div className="dev-card p-3.5 space-y-1">
          <div className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">Pending Tasks</div>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</div>
          <div className="text-[11px] text-[#777B8A] dark:text-[#9497A8]">Awaiting action</div>
        </div>

        <div className="dev-card p-3.5 space-y-1">
          <div className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">Due Today</div>
          <div className="text-xl sm:text-2xl font-bold text-[#6C5CE7] dark:text-[#8C7CFF]">{dueTodayCount}</div>
          <div className="text-[11px] text-[#777B8A] dark:text-[#9497A8]">Today's target</div>
        </div>

        <div className="dev-card p-3.5 space-y-1">
          <div className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">Overdue</div>
          <div className={`text-xl sm:text-2xl font-bold ${overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {overdueCount}
          </div>
          <div className="text-[11px] text-[#777B8A] dark:text-[#9497A8]">
            {overdueCount > 0 ? 'Needs immediate focus' : 'Zero overdue! Great pace'}
          </div>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="dev-card p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-semibold text-[#20212A] dark:text-[#F1F2F6]">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Preparation Completion Rate</span>
          </div>
          <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
            {completionRate}% ({completedCount} / {totalCount})
          </div>
        </div>
        <div className="w-full bg-[#E9EAF0] dark:bg-[#262838] h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-[11px] text-[#777B8A] dark:text-[#9497A8] font-medium">
          {completionRate >= 80
            ? '🔥 Outstanding consistency! You are operating at top product-company standards.'
            : completionRate >= 50
            ? '⚡ Great progress! Knock out remaining tasks to maintain high interview momentum.'
            : '🎯 Focus on 2-3 high-priority tasks today to build momentum.'}
        </p>
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="dev-card p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, topics, or categories..."
            className="dev-input w-full pl-8 pr-7 py-1.5 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 p-0.5 text-[#777B8A] hover:text-[#20212A] dark:hover:text-[#F1F2F6] cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
              filterStatus === 'ALL'
                ? 'bg-[#6C5CE7] text-white shadow-xs'
                : 'bg-[#F0EDFF] dark:bg-[#1E202E] text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
              filterStatus === 'PENDING'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-[#F0EDFF] dark:bg-[#1E202E] text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('DUE_TODAY')}
            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
              filterStatus === 'DUE_TODAY'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-[#F0EDFF] dark:bg-[#1E202E] text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
            }`}
          >
            Due Today ({dueTodayCount})
          </button>
          {overdueCount > 0 && (
            <button
              onClick={() => setFilterStatus('OVERDUE')}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                filterStatus === 'OVERDUE'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:opacity-90'
              }`}
            >
              Overdue ({overdueCount})
            </button>
          )}
          <button
            onClick={() => setFilterStatus('COMPLETED')}
            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
              filterStatus === 'COMPLETED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[#F0EDFF] dark:bg-[#1E202E] text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Category & Sort Select Dropdowns */}
        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="dev-input px-2.5 py-1 text-xs cursor-pointer font-medium"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="dev-input px-2.5 py-1 text-xs cursor-pointer font-medium"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="created">Sort by Recently Added</option>
          </select>
        </div>
      </div>

      {/* 4. Tasks List */}
      <div className="space-y-2">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isDueToday = task.dueDate === todayStr
            const isOverdue = task.dueDate && task.dueDate < todayStr && !task.completed

            return (
              <div
                key={task.id}
                className={`dev-card p-3.5 sm:p-4 transition-all flex items-start gap-3.5 group ${
                  task.completed
                    ? 'opacity-70 bg-[#FAFBFD] dark:bg-[#151620]'
                    : isOverdue
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                    : 'hover:border-[#6C5CE7]/40'
                }`}
              >
                {/* Toggle Checkbox Button */}
                {isAdmin ? (
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 text-gray-400 hover:text-emerald-500 dark:text-gray-500 dark:hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                    title={task.completed ? 'Mark as pending' : 'Mark as completed'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                ) : (
                  <div
                    className="mt-0.5 text-gray-400 dark:text-gray-500 shrink-0"
                    title={task.completed ? 'Completed' : 'Pending (Read-only)'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Priority Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        task.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                          : task.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                      }`}
                    >
                      {task.priority} Priority
                    </span>

                    {/* Category Tag */}
                    <span className="text-[11px] font-semibold text-[#6C5CE7] dark:text-[#8C7CFF] bg-[#F0EDFF] dark:bg-[#1E202E] px-2 py-0.5 rounded border border-[#6C5CE7]/20">
                      {task.category}
                    </span>

                    {/* Due Date Indicator */}
                    {task.dueDate && (
                      <span
                        className={`text-[11px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded ${
                          isOverdue
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : isDueToday
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'text-[#777B8A] dark:text-[#9497A8] bg-[#F5F6FA] dark:bg-[#1E202E]'
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        {isOverdue
                          ? `⚠️ Overdue (${task.dueDate})`
                          : isDueToday
                          ? '⚡ Due Today'
                          : `Due: ${task.dueDate}`}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3
                    onClick={() => {
                      if (isAdmin) toggleTask(task.id)
                    }}
                    className={`text-sm sm:text-base font-bold transition-colors ${isAdmin ? 'cursor-pointer' : ''} ${
                      task.completed
                        ? 'line-through text-[#777B8A] dark:text-[#9497A8]'
                        : 'text-[#20212A] dark:text-[#F1F2F6] hover:text-[#6C5CE7] dark:hover:text-[#8C7CFF]'
                    }`}
                  >
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-xs text-[#777B8A] dark:text-[#9497A8] leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  {/* Reference URL / Learning Material Link */}
                  {task.referenceUrl && (
                    <div className="pt-1">
                      <a
                        href={task.referenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6C5CE7] dark:text-[#8C7CFF] hover:underline bg-[#F0EDFF]/80 dark:bg-[#1E202E] px-2 py-0.5 rounded"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Reference / Tutorial: {task.referenceUrl.replace(/^https?:\/\/(www\.)?/, '').slice(0, 45)}...</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions (Admin Only) */}
                {isAdmin && (
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={() => handleOpenEdit(task)}
                      className="p-1.5 rounded text-[#777B8A] hover:text-[#20212A] dark:hover:text-[#F1F2F6] hover:bg-[#F5F6FA] dark:hover:bg-[#1E202E] cursor-pointer"
                      title="Edit task"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(task.id, task.title)}
                      className="p-1.5 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="dev-card p-12 text-center space-y-3">
            <CheckSquare className="w-10 h-10 text-emerald-500/50 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#20212A] dark:text-[#F1F2F6]">No tasks match this filter</h3>
              <p className="text-xs text-[#777B8A] dark:text-[#9497A8] max-w-sm mx-auto">
                Keep up the great work or add a new checklist item to plan ahead.
              </p>
            </div>
            {isAdmin && (
              <button onClick={handleOpenCreate} className="btn-primary text-xs mx-auto">
                <Plus className="w-3.5 h-3.5" />
                <span>Create Task</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Task Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editId ? 'Edit Checklist Item' : 'Add New Checklist Item'}
        subtitle="Set a high-impact technical milestone, Java study goal, or interview task with a due date."
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8] font-bold">
              Task Title *
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Master Virtual Threads & Project Loom Architecture"
              className="dev-input w-full px-3 py-2 text-xs font-semibold"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8] font-bold">
              Description / Action Steps
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Key sub-points to cover, practice examples, or specific test cases..."
              rows={3}
              className="dev-input w-full p-2.5 text-xs leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Due Date & Presets */}
            <div className="space-y-1 sm:col-span-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8] font-bold">
                Due Date
              </label>
              <input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="dev-input w-full px-2.5 py-1.5 text-xs cursor-pointer font-medium"
              />
              <div className="flex items-center gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => setDueDatePreset(0)}
                  className="text-[10px] bg-[#F5F6FA] dark:bg-[#1E202E] px-1.5 py-0.5 rounded text-[#777B8A] hover:text-[#20212A] dark:hover:text-[#F1F2F6] cursor-pointer"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDueDatePreset(1)}
                  className="text-[10px] bg-[#F5F6FA] dark:bg-[#1E202E] px-1.5 py-0.5 rounded text-[#777B8A] hover:text-[#20212A] dark:hover:text-[#F1F2F6] cursor-pointer"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setDueDatePreset(7)}
                  className="text-[10px] bg-[#F5F6FA] dark:bg-[#1E202E] px-1.5 py-0.5 rounded text-[#777B8A] hover:text-[#20212A] dark:hover:text-[#F1F2F6] cursor-pointer"
                >
                  +1 Week
                </button>
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8] font-bold">
                Priority
              </label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as ChecklistPriority)}
                className="dev-input w-full px-2.5 py-1.5 text-xs cursor-pointer font-bold"
              >
                <option value="HIGH">High Priority (Urgent)</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8] font-bold">
                Category
              </label>
              <input
                type="text"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                placeholder="Core Java, DSA, etc."
                className="dev-input w-full px-2.5 py-1.5 text-xs font-semibold"
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Reference URL */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8] font-bold">
              Reference Link / YouTube / Docs (Optional)
            </label>
            <input
              type="url"
              value={formReferenceUrl}
              onChange={(e) => setFormReferenceUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or documentation URL"
              className="dev-input w-full px-3 py-1.5 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E9EAF0] dark:border-[#262838]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs cursor-pointer font-semibold">
              {editId ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
