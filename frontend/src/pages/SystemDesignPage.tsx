import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Network,
  Search,
  Plus,
  ExternalLink,
  Star,
  Trash2,
  Edit3,
  Server,
  BookOpen,
  ArrowLeft,
  X,
  Save,
  Link2,
  FileText,
  Boxes,
  HelpCircle,
  Eye,
} from 'lucide-react'
import { systemDesignApi } from '../services/api'
import type { SystemDesignQuestion, SystemDesignCategory, Difficulty, SystemDesignReference } from '../types'
import { useAccess } from '../context/AccessContext'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const SystemDesignPage: React.FC = () => {
  const queryClient = useQueryClient()
  const { isAdmin } = useAccess()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL')
  const [filterStarred, setFilterStarred] = useState(false)

  // Active question in workspace
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)
  const [mobileDetailView, setMobileDetailView] = useState(false)

  // Editor Modal / Sheet State
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Partial<SystemDesignQuestion> | null>(null)

  // Quick Add Link Modal State
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false)
  const [newLinkTitle, setNewLinkTitle] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [newLinkType, setNewLinkType] = useState<SystemDesignReference['type']>('ARTICLE')

  // Active Detail Tab
  const [activeTab, setActiveTab] = useState<'writeup' | 'requirements' | 'architecture' | 'tradeoffs' | 'references'>('writeup')

  // Fetch Questions
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['system-design', selectedCategory, selectedDifficulty, filterStarred, searchQuery],
    queryFn: () =>
      systemDesignApi.list({
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        difficulty: selectedDifficulty === 'ALL' ? undefined : selectedDifficulty,
        starred: filterStarred ? true : undefined,
        q: searchQuery || undefined,
      }),
  })

  // Set default active question
  React.useEffect(() => {
    if (questions.length > 0 && !activeQuestionId) {
      setActiveQuestionId(questions[0].id)
    }
  }, [questions, activeQuestionId])

  const activeQuestion = questions.find((q) => q.id === activeQuestionId) || questions[0]

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<SystemDesignQuestion>) => systemDesignApi.create(data),
    onSuccess: (newQ) => {
      queryClient.invalidateQueries({ queryKey: ['system-design'] })
      setIsEditorOpen(false)
      setEditingQuestion(null)
      setActiveQuestionId(newQ.id)
      setMobileDetailView(true)
      toast.success('System design question created!')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create question')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SystemDesignQuestion> }) =>
      systemDesignApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-design'] })
      setIsEditorOpen(false)
      setEditingQuestion(null)
      toast.success('System design updated!')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update question')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => systemDesignApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-design'] })
      setActiveQuestionId(null)
      setMobileDetailView(false)
      toast.success('Question deleted.')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete question')
    },
  })

  // Handlers
  const handleOpenCreate = () => {
    setEditingQuestion({
      title: '',
      category: 'HLD',
      difficulty: 'MEDIUM',
      status: 'ATTEMPTED',
      problemStatement: '',
      requirementsFunctional: '',
      requirementsNonFunctional: '',
      capacityEstimation: '',
      highLevelArchitecture: '',
      notesAndDeepDive: '',
      bottlenecksAndTradeoffs: '',
      referenceLinks: [],
      tags: ['System Design'],
      companyIds: [],
      starred: false,
    })
    setIsEditorOpen(true)
  }

  const handleOpenEdit = (q: SystemDesignQuestion) => {
    setEditingQuestion({ ...q })
    setIsEditorOpen(true)
  }

  const handleToggleStar = async (q: SystemDesignQuestion, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAdmin) {
      toast.error('Only the vault owner can bookmark questions.')
      return
    }
    updateMutation.mutate({
      id: q.id,
      updates: { starred: !q.starred },
    })
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAdmin) return
    if (window.confirm('Are you sure you want to delete this system design question?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSaveEditor = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingQuestion || !editingQuestion.title?.trim()) {
      toast.error('Question title is required.')
      return
    }
    if (editingQuestion.id) {
      updateMutation.mutate({ id: editingQuestion.id, updates: editingQuestion })
    } else {
      createMutation.mutate(editingQuestion)
    }
  }

  const handleAddReferenceLink = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeQuestion) return
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      toast.error('Please enter both link title and URL.')
      return
    }
    const newRef: SystemDesignReference = {
      id: `ref_${Date.now()}`,
      title: newLinkTitle.trim(),
      url: newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`,
      type: newLinkType,
    }
    const updatedLinks = [...(activeQuestion.referenceLinks || []), newRef]
    updateMutation.mutate({
      id: activeQuestion.id,
      updates: { referenceLinks: updatedLinks },
    })
    setNewLinkTitle('')
    setNewLinkUrl('')
    setIsAddLinkOpen(false)
    toast.success('Reference link added!')
  }

  const handleDeleteReferenceLink = (linkId?: string, linkUrl?: string) => {
    if (!isAdmin || !activeQuestion) return
    const updatedLinks = (activeQuestion.referenceLinks || []).filter(
      (l) => (l.id && linkId ? l.id !== linkId : l.url !== linkUrl)
    )
    updateMutation.mutate({
      id: activeQuestion.id,
      updates: { referenceLinks: updatedLinks },
    })
    toast.success('Reference link removed.')
  }

  const getDifficultyColor = (diff?: Difficulty) => {
    switch (diff) {
      case 'EASY':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
      case 'HARD':
        return 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25'
      case 'MEDIUM':
      default:
        return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25'
    }
  }

  const getCategoryBadge = (cat?: SystemDesignCategory) => {
    switch (cat) {
      case 'HLD':
        return { label: 'HLD', color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/25' }
      case 'LLD':
        return { label: 'LLD', color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/25' }
      case 'DISTRIBUTED_SYSTEMS':
        return { label: 'Distributed Systems', color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/25' }
      case 'ARCHITECTURE':
      default:
        return { label: 'Architecture', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/25' }
    }
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Top Banner Header */}
      <div className="border-b border-[#E9EAF0] dark:border-[#262838] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#20212A] dark:text-[#F1F2F6] tracking-tight flex items-center gap-2">
              <span>System Design</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">
                Architect Vault
              </span>
            </h1>
            <p className="text-xs text-[#777B8A] dark:text-[#9497A8] mt-0.5">
              High-level & low-level architecture questions, trade-offs, reference links, and deep-dive technical notes.
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5 cursor-pointer font-bold shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add System Design</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-2.5 flex-wrap text-xs">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-3.5 h-3.5 text-[#777B8A] dark:text-[#9497A8] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search system designs, references, or tags..."
            className="dev-input w-full pl-8.5 pr-7 py-1.5 text-xs font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 p-0.5 text-[#777B8A] hover:text-[#20212A] dark:hover:text-[#F1F2F6]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="dev-input px-2.5 py-1.5 text-xs cursor-pointer font-medium"
        >
          <option value="ALL">All Categories</option>
          <option value="HLD">High-Level Design (HLD)</option>
          <option value="LLD">Low-Level Design (LLD)</option>
          <option value="DISTRIBUTED_SYSTEMS">Distributed Systems</option>
          <option value="ARCHITECTURE">Architecture</option>
        </select>

        {/* Difficulty Filter */}
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="dev-input px-2.5 py-1.5 text-xs cursor-pointer font-medium"
        >
          <option value="ALL">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>

        {/* Starred Filter */}
        <button
          onClick={() => setFilterStarred(!filterStarred)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
            filterStarred
              ? 'bg-amber-500/15 border-amber-500/35 text-amber-700 dark:text-amber-300'
              : 'border-[#E9EAF0] dark:border-[#262838] bg-white dark:bg-[#1A1C28] text-[#777B8A] dark:text-[#9497A8]'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${filterStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
          <span className="hidden sm:inline">Starred</span>
        </button>

        <span className="text-[11px] font-mono text-[#777B8A] dark:text-[#9497A8] ml-auto">
          {questions.length} question(s)
        </span>
      </div>

      {/* Main Responsive Split Layout: Left List, Right Workspace */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Column: Questions List (Full width on mobile when not in detail view) */}
        <div
          className={`${
            mobileDetailView ? 'hidden lg:flex' : 'flex'
          } w-full lg:w-84 shrink-0 dev-card p-3 flex-col space-y-2 h-[calc(100vh-14rem)]`}
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-[#E9EAF0] dark:border-[#262838] px-1 text-[11px] font-mono text-[#777B8A] dark:text-[#9497A8] font-bold uppercase tracking-wider">
            <span>Questions Catalog</span>
            <span>{questions.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-[#777B8A] dark:text-[#9497A8]">
                Loading system designs...
              </div>
            ) : questions.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#777B8A] dark:text-[#9497A8] space-y-2">
                <HelpCircle className="w-8 h-8 mx-auto text-[#777B8A] opacity-40" />
                <p>No system design questions found.</p>
                {isAdmin && (
                  <button onClick={handleOpenCreate} className="btn-primary text-xs px-3 py-1">
                    Add First Question
                  </button>
                )}
              </div>
            ) : (
              questions.map((q) => {
                const isSelected = activeQuestion?.id === q.id
                const catBadge = getCategoryBadge(q.category)
                return (
                  <div
                    key={q.id}
                    onClick={() => {
                      setActiveQuestionId(q.id)
                      setMobileDetailView(true)
                    }}
                    className={`group p-3 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-[#6C5CE7] bg-[#F0EDFF]/80 dark:bg-[#6C5CE7]/15 shadow-sm ring-1 ring-[#6C5CE7]/40'
                        : 'border-[#E9EAF0] dark:border-[#262838] bg-white dark:bg-[#1A1C28] hover:border-[#6C5CE7]/30 hover:bg-[#F8F9FC] dark:hover:bg-[#1E202E]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#20212A] dark:text-[#F1F2F6] line-clamp-2 leading-snug">
                        {q.title}
                      </h4>
                      <button
                        onClick={(e) => handleToggleStar(q, e)}
                        className="text-[#777B8A] hover:text-amber-500 shrink-0 p-0.5"
                        title={q.starred ? 'Starred' : 'Star this question'}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            q.starred ? 'fill-amber-500 text-amber-500' : 'text-[#777B8A]'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${catBadge.color}`}>
                        {catBadge.label}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty}
                      </span>
                      {q.referenceLinks && q.referenceLinks.length > 0 && (
                        <span className="text-[9px] font-mono text-[#6C5CE7] dark:text-[#8C7CFF] bg-[#F0EDFF] dark:bg-[#6C5CE7]/20 px-1.5 py-0.2 rounded flex items-center gap-1">
                          <Link2 className="w-2.5 h-2.5" />
                          <span>{q.referenceLinks.length}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Question Workspace / Detail */}
        {activeQuestion ? (
          <div
            className={`${
              !mobileDetailView ? 'hidden lg:flex' : 'flex'
            } flex-1 w-full dev-card p-4 sm:p-6 flex-col space-y-5 min-w-0`}
          >
            {/* Mobile Back Button */}
            <div className="lg:hidden flex items-center justify-between pb-3 border-b border-[#E9EAF0] dark:border-[#262838]">
              <button
                onClick={() => setMobileDetailView(false)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#6C5CE7] dark:text-[#8C7CFF] hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Questions</span>
              </button>
              <span className="text-[11px] font-mono text-[#777B8A] dark:text-[#9497A8]">
                {activeQuestion.category}
              </span>
            </div>

            {/* Title & Metadata Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getCategoryBadge(activeQuestion.category).color}`}>
                    {getCategoryBadge(activeQuestion.category).label}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getDifficultyColor(activeQuestion.difficulty)}`}>
                    {activeQuestion.difficulty}
                  </span>
                  {activeQuestion.starred && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>Starred</span>
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-black text-[#20212A] dark:text-[#F1F2F6] tracking-tight">
                  {activeQuestion.title}
                </h2>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                {isAdmin ? (
                  <>
                    <button
                      onClick={() => handleOpenEdit(activeQuestion)}
                      className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 cursor-pointer font-bold"
                      title="Edit question and notes"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={(e) => handleDelete(activeQuestion.id, e)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>Reader View</span>
                  </span>
                )}
              </div>
            </div>

            {/* Problem Statement Card */}
            {activeQuestion.problemStatement && (
              <div className="p-3.5 rounded-xl bg-[#F8F9FC] dark:bg-[#1A1C28] border border-[#E9EAF0] dark:border-[#262838] text-xs text-[#20212A] dark:text-[#F1F2F6] leading-relaxed">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#777B8A] dark:text-[#9497A8] font-bold block mb-1">
                  Problem Statement & Scope
                </span>
                <p className="font-medium whitespace-pre-line">{activeQuestion.problemStatement}</p>
              </div>
            )}

            {/* Reference Links Section (Prominent User Request!) */}
            <div className="p-4 rounded-xl border border-[#6C5CE7]/30 dark:border-[#8C7CFF]/30 bg-gradient-to-br from-white to-[#F0EDFF]/30 dark:from-[#181927] dark:to-[#1E1F33] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-[#6C5CE7] dark:text-[#8C7CFF]" />
                  <h3 className="text-xs font-black text-[#20212A] dark:text-[#F1F2F6] uppercase tracking-wider">
                    Reference Links & Architecture Resources
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#6C5CE7]/15 text-[#6C5CE7] dark:text-[#8C7CFF] font-bold">
                    {activeQuestion.referenceLinks?.length || 0}
                  </span>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => setIsAddLinkOpen(true)}
                    className="text-xs font-bold text-[#6C5CE7] dark:text-[#8C7CFF] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add Link</span>
                  </button>
                )}
              </div>

              {activeQuestion.referenceLinks && activeQuestion.referenceLinks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeQuestion.referenceLinks.map((ref, idx) => (
                    <div
                      key={ref.id || idx}
                      className="group p-2.5 rounded-lg bg-white dark:bg-[#14151F] border border-[#E9EAF0] dark:border-[#262838] hover:border-[#6C5CE7]/50 transition-all flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[#6C5CE7] dark:text-[#8C7CFF] hover:underline flex items-center gap-1.5 truncate"
                          title={ref.url}
                        >
                          <span className="truncate">{ref.title || ref.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover:opacity-100" />
                        </a>
                        <span className="text-[10px] font-mono text-[#777B8A] dark:text-[#9497A8] truncate block">
                          {ref.url}
                        </span>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteReferenceLink(ref.id, ref.url)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#777B8A] hover:text-rose-500 rounded transition-all cursor-pointer shrink-0"
                          title="Remove reference link"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#777B8A] dark:text-[#9497A8] italic">
                  No reference links added yet. {isAdmin && 'Click "+ Add Link" to add engineering blogs, GitHub repos, or RFCs.'}
                </p>
              )}
            </div>

            {/* Navigation Tabs for Write-up Sections */}
            <div className="flex items-center gap-1 border-b border-[#E9EAF0] dark:border-[#262838] overflow-x-auto text-xs pb-1">
              {[
                { id: 'writeup', label: 'Deep Dive & Notes', icon: FileText },
                { id: 'requirements', label: 'Requirements & Scope', icon: BookOpen },
                { id: 'architecture', label: 'High-Level Architecture', icon: Server },
                { id: 'tradeoffs', label: 'Bottlenecks & Trade-offs', icon: Boxes },
              ].map((tab) => {
                const isActive = activeTab === tab.id
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#6C5CE7] text-white shadow-xs'
                        : 'text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6] hover:bg-[#F0EDFF] dark:hover:bg-[#1E202E]'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Tab Contents */}
            <div className="space-y-4">
              {activeTab === 'writeup' && (
                <div className="space-y-3">
                  {activeQuestion.notesAndDeepDive ? (
                    <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {activeQuestion.notesAndDeepDive}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-[#777B8A] dark:text-[#9497A8] space-y-2">
                      <p>No deep-dive write-up written yet for this question.</p>
                      {isAdmin && (
                        <button
                          onClick={() => handleOpenEdit(activeQuestion)}
                          className="btn-primary text-xs px-3 py-1 font-bold"
                        >
                          Write Deep Dive Notes
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'requirements' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#1A1C28] border border-[#E9EAF0] dark:border-[#262838] space-y-2">
                    <span className="text-[11px] font-mono uppercase font-black text-emerald-600 dark:text-emerald-400 block">
                      Functional Requirements
                    </span>
                    <div className="text-xs text-[#20212A] dark:text-[#F1F2F6] prose dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {activeQuestion.requirementsFunctional || '*No functional requirements specified.*'}
                      </ReactMarkdown>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#1A1C28] border border-[#E9EAF0] dark:border-[#262838] space-y-2">
                    <span className="text-[11px] font-mono uppercase font-black text-indigo-600 dark:text-indigo-400 block">
                      Non-Functional Requirements
                    </span>
                    <div className="text-xs text-[#20212A] dark:text-[#F1F2F6] prose dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {activeQuestion.requirementsNonFunctional || '*No non-functional requirements specified.*'}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {activeQuestion.capacityEstimation && (
                    <div className="md:col-span-2 p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#1A1C28] border border-[#E9EAF0] dark:border-[#262838] space-y-2">
                      <span className="text-[11px] font-mono uppercase font-black text-purple-600 dark:text-purple-400 block">
                        Scale & Capacity Estimation
                      </span>
                      <div className="text-xs text-[#20212A] dark:text-[#F1F2F6] prose dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {activeQuestion.capacityEstimation}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'architecture' && (
                <div className="space-y-4">
                  {activeQuestion.highLevelArchitecture ? (
                    <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#1A1C28] border border-[#E9EAF0] dark:border-[#262838]">
                      <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {activeQuestion.highLevelArchitecture}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#777B8A] dark:text-[#9497A8] italic">
                      No high-level architecture documented yet.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'tradeoffs' && (
                <div className="space-y-4">
                  {activeQuestion.bottlenecksAndTradeoffs ? (
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/25">
                      <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed text-[#20212A] dark:text-[#F1F2F6]">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {activeQuestion.bottlenecksAndTradeoffs}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#777B8A] dark:text-[#9497A8] italic">
                      No bottlenecks and trade-offs documented yet.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Tags Footer */}
            {activeQuestion.tags && activeQuestion.tags.length > 0 && (
              <div className="pt-3 border-t border-[#E9EAF0] dark:border-[#262838] flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-[#777B8A] dark:text-[#9497A8]">Tags:</span>
                {activeQuestion.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F0EDFF] dark:bg-[#1E202E] text-[#6C5CE7] dark:text-[#8C7CFF] border border-[#E9EAF0] dark:border-[#262838]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 dev-card p-12 text-center text-xs text-[#777B8A] dark:text-[#9497A8]">
            Select a system design question to view details.
          </div>
        )}
      </div>

      {/* Modal: Quick Add Reference Link */}
      {isAddLinkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="dev-card w-full max-w-md p-5 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E9EAF0] dark:border-[#262838] pb-2">
              <h3 className="text-sm font-black text-[#20212A] dark:text-[#F1F2F6] flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-[#6C5CE7]" />
                <span>Add Reference Link</span>
              </h3>
              <button
                onClick={() => setIsAddLinkOpen(false)}
                className="p-1 text-[#777B8A] hover:text-[#20212A] dark:hover:text-[#F1F2F6] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddReferenceLink} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#777B8A] dark:text-[#9497A8] mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. System Design Primer - TinyURL Solution"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  className="dev-input w-full py-1.5 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#777B8A] dark:text-[#9497A8] mb-1">
                  Destination URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="dev-input w-full py-1.5 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#777B8A] dark:text-[#9497A8] mb-1">
                  Resource Type
                </label>
                <select
                  value={newLinkType}
                  onChange={(e) => setNewLinkType(e.target.value as any)}
                  className="dev-input w-full py-1.5 px-3 text-xs"
                >
                  <option value="ARTICLE">Article / Blog Post</option>
                  <option value="OFFICIAL_DOC">Official Documentation / Spec</option>
                  <option value="GITHUB">GitHub Repository</option>
                  <option value="VIDEO">Video Breakdown / Lecture</option>
                  <option value="PAPER">Research Paper (RFC / Whitepaper)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E9EAF0] dark:border-[#262838]">
                <button
                  type="button"
                  onClick={() => setIsAddLinkOpen(false)}
                  className="btn-secondary text-xs px-3 py-1.5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-4 py-1.5 cursor-pointer font-bold"
                >
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Full Question Editor */}
      {isEditorOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
          <div className="dev-card w-full max-w-4xl p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#E9EAF0] dark:border-[#262838] pb-3">
              <h3 className="text-base font-black text-[#20212A] dark:text-[#F1F2F6] flex items-center gap-2">
                <Network className="w-5 h-5 text-[#6C5CE7]" />
                <span>{editingQuestion.id ? 'Edit System Design' : 'New System Design Question'}</span>
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1 text-[#777B8A] hover:text-[#20212A] dark:hover:text-[#F1F2F6] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditor} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#777B8A] dark:text-[#9497A8] mb-1">
                    Question Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design URL Shortener (TinyURL)"
                    value={editingQuestion.title || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
                    className="dev-input w-full py-1.5 px-3 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#777B8A] dark:text-[#9497A8] mb-1">
                    Category
                  </label>
                  <select
                    value={editingQuestion.category || 'HLD'}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, category: e.target.value as any })
                    }
                    className="dev-input w-full py-1.5 px-3 text-xs"
                  >
                    <option value="HLD">High-Level Design (HLD)</option>
                    <option value="LLD">Low-Level Design (LLD)</option>
                    <option value="DISTRIBUTED_SYSTEMS">Distributed Systems</option>
                    <option value="ARCHITECTURE">Architecture</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#777B8A] dark:text-[#9497A8] mb-1">
                    Difficulty
                  </label>
                  <select
                    value={editingQuestion.difficulty || 'MEDIUM'}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as any })
                    }
                    className="dev-input w-full py-1.5 px-3 text-xs"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#777B8A] dark:text-[#9497A8] mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HLD, Redis, Base62, Caching"
                    value={editingQuestion.tags?.join(', ') || ''}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                      })
                    }
                    className="dev-input w-full py-1.5 px-3 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#777B8A] dark:text-[#9497A8] mb-1">
                  Problem Statement & Scope
                </label>
                <textarea
                  rows={2}
                  placeholder="Summarize the core requirements, constraints, and problem scope..."
                  value={editingQuestion.problemStatement || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, problemStatement: e.target.value })
                  }
                  className="dev-input w-full p-2.5 text-xs custom-scrollbar"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#777B8A] dark:text-[#9497A8] mb-1">
                    Functional Requirements
                  </label>
                  <textarea
                    rows={3}
                    placeholder="- Given long URL, generate short alias&#10;- Redirect user on click"
                    value={editingQuestion.requirementsFunctional || ''}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, requirementsFunctional: e.target.value })
                    }
                    className="dev-input w-full p-2.5 text-xs font-mono custom-scrollbar"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#777B8A] dark:text-[#9497A8] mb-1">
                    Non-Functional Requirements
                  </label>
                  <textarea
                    rows={3}
                    placeholder="- High availability (99.99%)&#10;- Low latency redirection (< 15ms)"
                    value={editingQuestion.requirementsNonFunctional || ''}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, requirementsNonFunctional: e.target.value })
                    }
                    className="dev-input w-full p-2.5 text-xs font-mono custom-scrollbar"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#777B8A] dark:text-[#9497A8] mb-1">
                  High-Level Architecture (Markdown supported)
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline the API Gateway, Load Balancer, Caching layer, Database partition strategy..."
                  value={editingQuestion.highLevelArchitecture || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, highLevelArchitecture: e.target.value })
                  }
                  className="dev-input w-full p-2.5 text-xs custom-scrollbar"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#777B8A] dark:text-[#9497A8] mb-1">
                  Write-up & Deep Dive Notes (Markdown supported)
                </label>
                <textarea
                  rows={6}
                  placeholder="Write your comprehensive technical analysis, algorithms, component choices, and diagrams..."
                  value={editingQuestion.notesAndDeepDive || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, notesAndDeepDive: e.target.value })
                  }
                  className="dev-input w-full p-2.5 text-xs custom-scrollbar font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#777B8A] dark:text-[#9497A8] mb-1">
                  Bottlenecks & Trade-offs
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe edge cases, failure modes, replication lag, and cache stampede trade-offs..."
                  value={editingQuestion.bottlenecksAndTradeoffs || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, bottlenecksAndTradeoffs: e.target.value })
                  }
                  className="dev-input w-full p-2.5 text-xs custom-scrollbar"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E9EAF0] dark:border-[#262838]">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="btn-secondary text-xs px-3.5 py-1.5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn-primary text-xs px-4 py-1.5 cursor-pointer font-bold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingQuestion.id ? 'Save Changes' : 'Create Question'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
