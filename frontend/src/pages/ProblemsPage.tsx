import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Code2,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Edit,
  Sparkles,
  AlertTriangle,
  FileCode,
  Columns,
  List,
  CheckCircle2,
  FolderGit2,
  GitBranch,
  Copy,
  Check,
  X,
  RotateCcw,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { problemsApi, revisionsApi } from '../services/api'
import type { Problem, Solution, Difficulty, ProblemStatus, ProblemType, GitHubReference } from '../types'
import { Modal } from '../components/common/Modal'
import { Badge, DifficultyBadge, StatusBadge } from '../components/common/Badge'
import { CodeEditor } from '../components/common/CodeEditor'
import { MarkdownViewer } from '../components/common/MarkdownViewer'
import { useAccess } from '../context/AccessContext'

export const ProblemsPage: React.FC = () => {
  const { isAdmin } = useAccess()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const typeParam = searchParams.get('type')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedType, setSelectedType] = useState<string>(typeParam || 'ALL')

  useEffect(() => {
    if (typeParam) {
      setSelectedType(typeParam)
    }
  }, [typeParam])

  const [searchQuery, setSearchQuery] = useState('')
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null)
  const [activeSolutionIdx, setActiveSolutionIdx] = useState(0)
  const [viewMode, setViewMode] = useState<'workspace' | 'table'>('workspace')
  const [copiedCode, setCopiedCode] = useState(false)

  // Modals
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false)
  const [isSolutionModalOpen, setIsSolutionModalOpen] = useState(false)
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false)
  const [isEditingProblem, setIsEditingProblem] = useState(false)
  const [editingSolutionId, setEditingSolutionId] = useState<string | null>(null)

  // Problem Form
  const [formTitle, setFormTitle] = useState('')
  const [formStatement, setFormStatement] = useState('')
  const [formSourceUrl, setFormSourceUrl] = useState('')
  const [formDifficulty, setFormDifficulty] = useState<Difficulty>('MEDIUM')
  const [formType, setFormType] = useState<ProblemType>('DSA')
  const [formStatus, setFormStatus] = useState<ProblemStatus>('ATTEMPTED')
  const [formTags, setFormTags] = useState('')
  const [formKeyInsight, setFormKeyInsight] = useState('')
  const [formEdgeCases, setFormEdgeCases] = useState('')

  // Solution Form
  const [solTitle, setSolTitle] = useState('Optimal Approach')
  const [solApproach, setSolApproach] = useState('')
  const [solCode, setSolCode] = useState(
    'class Solution {\n    public int solve() {\n        // implementation here\n        return 0;\n    }\n}'
  )
  const [solTimeComp, setSolTimeComp] = useState('O(n)')
  const [solSpaceComp, setSolSpaceComp] = useState('O(1)')
  const [solMistakes, setSolMistakes] = useState('')
  const [solGithubUrl, setSolGithubUrl] = useState('')

  // GitHub Reference Form
  const [ghRepoUrl, setGhRepoUrl] = useState('')
  const [ghFileUrl, setGhFileUrl] = useState('')
  const [ghBranch, setGhBranch] = useState('main')
  const [ghNotes, setGhNotes] = useState('')

  const { data: problems, isLoading } = useQuery({
    queryKey: ['problems', selectedDifficulty, selectedStatus, selectedType, searchQuery],
    queryFn: () =>
      problemsApi.list({
        difficulty: selectedDifficulty === 'ALL' ? undefined : selectedDifficulty,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        type: selectedType === 'ALL' ? undefined : selectedType,
        q: searchQuery || undefined,
      }),
  })

  // Select first problem by default if workspace mode
  React.useEffect(() => {
    if (problems && problems.length > 0 && !activeProblem) {
      setActiveProblem(problems[0])
    }
  }, [problems, activeProblem])

  // Reset Filters Helper
  const hasActiveFilters =
    selectedDifficulty !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedType !== 'ALL' ||
    searchQuery.trim().length > 0

  const handleResetFilters = () => {
    setSelectedDifficulty('ALL')
    setSelectedStatus('ALL')
    setSelectedType('ALL')
    setSearchQuery('')
  }

  // Mutations
  const createProblemMutation = useMutation({
    mutationFn: (p: Partial<Problem>) => problemsApi.create(p),
    onSuccess: (newProblem) => {
      queryClient.invalidateQueries({ queryKey: ['problems'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Problem added')
      setActiveProblem(newProblem)
      setIsProblemModalOpen(false)
    },
    onError: () => toast.error('Failed to create problem'),
  })

  const updateProblemMutation = useMutation({
    mutationFn: ({ id, p }: { id: string; p: Partial<Problem> }) => problemsApi.update(id, p),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['problems'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Problem updated')
      setActiveProblem(updated)
      setIsProblemModalOpen(false)
      setIsGithubModalOpen(false)
    },
    onError: () => toast.error('Failed to update problem'),
  })

  const deleteProblemMutation = useMutation({
    mutationFn: (id: string) => problemsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Problem deleted')
      setActiveProblem(null)
    },
    onError: () => toast.error('Failed to delete problem'),
  })

  const addSolutionMutation = useMutation({
    mutationFn: ({ problemId, sol }: { problemId: string; sol: Partial<Solution> }) =>
      problemsApi.addSolution(problemId, sol),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['problems'] })
      toast.success('Solution recorded')
      setActiveProblem(updated)
      setActiveSolutionIdx(updated.solutions.length - 1)
      setIsSolutionModalOpen(false)
    },
    onError: () => toast.error('Failed to record solution'),
  })

  const updateSolutionMutation = useMutation({
    mutationFn: ({ problemId, solutionId, sol }: { problemId: string; solutionId: string; sol: Partial<Solution> }) =>
      problemsApi.updateSolution(problemId, solutionId, sol),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['problems'] })
      toast.success('Solution approach updated')
      setActiveProblem(updated)
      setIsSolutionModalOpen(false)
    },
    onError: () => toast.error('Failed to update solution approach'),
  })

  const deleteSolutionMutation = useMutation({
    mutationFn: ({ problemId, solutionId }: { problemId: string; solutionId: string }) =>
      problemsApi.deleteSolution(problemId, solutionId),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['problems'] })
      toast.success('Solution deleted')
      setActiveProblem(updated)
      setActiveSolutionIdx(0)
    },
    onError: () => toast.error('Failed to delete solution'),
  })

  const recordRevisionMutation = useMutation({
    mutationFn: ({ id, outcome }: { id: string; outcome: string }) =>
      revisionsApi.record({
        entityId: id,
        entityType: 'PROBLEM',
        outcome: outcome as any,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisions-due-today'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Revision logged via SM-2 interval')
    },
  })

  // Handlers for Problem Modal
  const handleOpenCreateProblem = () => {
    setFormTitle('')
    setFormStatement('')
    setFormSourceUrl('')
    setFormDifficulty('MEDIUM')
    setFormType('DSA')
    setFormStatus('NOT_STARTED')
    setFormTags('array, two-pointers')
    setFormKeyInsight('')
    setFormEdgeCases('')
    setIsEditingProblem(false)
    setIsProblemModalOpen(true)
  }

  const handleOpenEditProblem = (prob: Problem) => {
    setFormTitle(prob.title)
    setFormStatement(prob.statement || '')
    setFormSourceUrl(prob.sourceUrl || '')
    setFormDifficulty(prob.difficulty || 'MEDIUM')
    setFormType(prob.type || 'DSA')
    setFormStatus(prob.status)
    setFormTags((prob.tags || []).join(', '))
    setFormKeyInsight(prob.keyInsight || '')
    setFormEdgeCases(prob.edgeCases || '')
    setIsEditingProblem(true)
    setIsProblemModalOpen(true)
  }

  const handleSaveProblem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      toast.error('Title is required')
      return
    }

    const payload: Partial<Problem> = {
      title: formTitle.trim(),
      statement: formStatement,
      sourceUrl: formSourceUrl,
      difficulty: formDifficulty,
      type: formType,
      status: formStatus,
      tags: formTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      keyInsight: formKeyInsight,
      edgeCases: formEdgeCases,
    }

    if (isEditingProblem && activeProblem) {
      updateProblemMutation.mutate({ id: activeProblem.id, p: payload })
    } else {
      createProblemMutation.mutate(payload)
    }
  }

  // Handlers for Solution Modal
  const handleOpenAddSolution = () => {
    const nextIdx = (activeProblem?.solutions?.length || 0) + 1
    setSolTitle(`Approach ${nextIdx}: Optimal Solution`)
    setSolApproach('')
    setSolCode('class Solution {\n    public int solve() {\n        // implementation here\n        return 0;\n    }\n}')
    setSolTimeComp('O(n)')
    setSolSpaceComp('O(1)')
    setSolMistakes('')
    setSolGithubUrl('')
    setEditingSolutionId(null)
    setIsSolutionModalOpen(true)
  }

  const handleOpenEditSolution = (sol: Solution) => {
    setSolTitle(sol.title || 'Solution Approach')
    setSolApproach(sol.approach || '')
    setSolCode(sol.code || '')
    setSolTimeComp(sol.timeComplexity || 'O(n)')
    setSolSpaceComp(sol.spaceComplexity || 'O(1)')
    setSolMistakes(sol.mistakes || '')
    setSolGithubUrl(sol.githubReferences?.[0]?.fileUrl || sol.githubReferences?.[0]?.repositoryUrl || '')
    setEditingSolutionId(sol.id)
    setIsSolutionModalOpen(true)
  }

  const handleSaveSolution = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeProblem) return

    const ghRefs: GitHubReference[] = solGithubUrl.trim()
      ? [
          {
            id: 'gh-sol-' + Date.now(),
            repositoryUrl: solGithubUrl.trim(),
            fileUrl: solGithubUrl.trim(),
            branch: 'main',
            notes: 'Implementation repository reference',
            createdAt: new Date().toISOString(),
          },
        ]
      : []

    const payload: Partial<Solution> = {
      title: solTitle.trim(),
      approach: solApproach,
      code: solCode,
      language: 'JAVA',
      timeComplexity: solTimeComp,
      spaceComplexity: solSpaceComp,
      mistakes: solMistakes,
      githubReferences: ghRefs,
    }

    if (editingSolutionId) {
      updateSolutionMutation.mutate({
        problemId: activeProblem.id,
        solutionId: editingSolutionId,
        sol: payload,
      })
    } else {
      addSolutionMutation.mutate({ problemId: activeProblem.id, sol: payload })
    }
  }

  // Handlers for GitHub References
  const handleOpenAddGithub = () => {
    setGhRepoUrl('')
    setGhFileUrl(activeProblem?.sourceUrl ? '' : '')
    setGhBranch('main')
    setGhNotes('')
    setIsGithubModalOpen(true)
  }

  const handleSaveGithubRef = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeProblem) return
    if (!ghRepoUrl.trim() && !ghFileUrl.trim()) {
      toast.error('Please enter a repository URL or file URL')
      return
    }

    const newRef: GitHubReference = {
      id: 'gh-' + Date.now(),
      repositoryUrl: ghRepoUrl.trim() || undefined,
      fileUrl: ghFileUrl.trim() || undefined,
      branch: ghBranch.trim() || 'main',
      notes: ghNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    const updated = [...(activeProblem.githubReferences || []), newRef]
    updateProblemMutation.mutate({
      id: activeProblem.id,
      p: { githubReferences: updated },
    })
  }

  const handleDeleteGithubRef = (refId: string) => {
    if (!activeProblem) return
    const updated = (activeProblem.githubReferences || []).filter((r) => r.id !== refId)
    updateProblemMutation.mutate({
      id: activeProblem.id,
      p: { githubReferences: updated },
    })
  }

  const copySolutionCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    toast.success('Java solution code copied to clipboard')
    setTimeout(() => setCopiedCode(false), 2200)
  }

  const activeSolution =
    activeProblem?.solutions?.[activeSolutionIdx] || activeProblem?.solutions?.[0]

  return (
    <div className="space-y-5 pb-8">
      {/* Top Header & View Controls */}
      <div className="border-b border-[#E9EAF0] dark:border-[#262838] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-normal text-[#20212A] dark:text-[#F1F2F6] tracking-tight">
            DSA Problems
          </h1>
          <p className="text-xs text-[#777B8A] dark:text-[#9497A8] mt-0.5">
            Structured algorithmic workspace with multi-approach solutions, Java syntax highlighting, complexity analysis, and GitHub links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-[#E9EAF0] dark:border-[#262838] rounded p-0.5 bg-[#F5F6FA] dark:bg-[#14151F]">
            <button
              onClick={() => setViewMode('workspace')}
              className={`p-1 px-2 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'workspace'
                  ? 'bg-white dark:bg-[#1E202E] text-[#20212A] dark:text-[#F1F2F6] font-medium shadow-2xs'
                  : 'text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
              }`}
              title="Split workspace view"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Workspace</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 px-2 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#1E202E] text-[#20212A] dark:text-[#F1F2F6] font-medium shadow-2xs'
                  : 'text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
              }`}
              title="Table browsing view"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Table</span>
            </button>
          </div>

          {isAdmin && (
            <button onClick={handleOpenCreateProblem} className="btn-primary text-xs cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Problem</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-2.5 flex-wrap text-xs">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#777B8A] dark:text-[#9497A8] absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by name or tag..."
            className="dev-input w-full pl-8 pr-7 py-1.5 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 p-0.5 rounded text-[#777B8A] hover:text-[#20212A] dark:hover:text-[#F1F2F6]"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="dev-input px-2.5 py-1.5 text-xs cursor-pointer"
        >
          <option value="ALL">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="dev-input px-2.5 py-1.5 text-xs cursor-pointer"
        >
          <option value="ALL">All Types</option>
          <option value="DSA">DSA</option>
          <option value="JAVA_PRACTICE">Java Practice</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="dev-input px-2.5 py-1.5 text-xs cursor-pointer"
        >
          <option value="ALL">All Status</option>
          <option value="SOLVED">Solved</option>
          <option value="ATTEMPTED">Attempted</option>
          <option value="NEEDS_REVISION">Needs Revision</option>
          <option value="NOT_STARTED">Pending</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#F0EDFF] dark:bg-[#1E202E] text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6] transition-colors cursor-pointer text-xs"
            title="Reset all filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}

        <span className="text-[11px] font-mono text-[#777B8A] dark:text-[#9497A8] ml-auto">
          {problems?.length || 0} problem(s)
        </span>
      </div>

      {/* Workspace Mode: Split Pane */}
      {viewMode === 'workspace' && (
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Left Problem Browser List */}
          <div className="w-full lg:w-76 shrink-0 dev-card p-3 space-y-1.5 h-[calc(100vh-12rem)] flex flex-col">
            <div className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8] px-1 pb-1 border-b border-[#E9EAF0] dark:border-[#262838] flex items-center justify-between">
              <span>Problem Catalog</span>
              <span className="text-[10px] text-[#777B8A] dark:text-[#9497A8]">{problems?.length || 0}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
              {isLoading ? (
                <div className="text-center py-8 text-xs text-[#777B8A] dark:text-[#9497A8] flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#6C5CE7]" />
                  <span>Loading problems...</span>
                </div>
              ) : problems && problems.length > 0 ? (
                problems.map((p) => {
                  const isSelected = activeProblem?.id === p.id
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setActiveProblem(p)
                        setActiveSolutionIdx(0)
                      }}
                      className={`group p-2.5 rounded border transition-colors cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-[#F0EDFF] dark:bg-[#1E202E] border-[#6C5CE7]/50 dark:border-[#8C7CFF]/50 text-[#20212A] dark:text-[#F1F2F6]'
                          : 'border-transparent hover:bg-[#F8F9FC] dark:hover:bg-[#1A1C28] text-[#20212A] dark:text-[#F1F2F6]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-medium truncate block flex-1">{p.title}</span>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm(`Delete problem "${p.title}"?`)) {
                                deleteProblemMutation.mutate(p.id)
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-rose-500 cursor-pointer transition-opacity shrink-0"
                            title="Delete problem"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <DifficultyBadge difficulty={p.difficulty} />
                        <StatusBadge status={p.status} />
                        <span className="text-[10px] font-mono text-[#777B8A] dark:text-[#9497A8] bg-[#F0EDFF] dark:bg-[#14151F] px-1 rounded">
                          {p.solutions?.length || 0} sol
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-12 text-xs text-[#777B8A] dark:text-[#9497A8]">
                  No matching problems found.
                </div>
              )}
            </div>
          </div>

          {/* Right Problem Detail & Coding Workspace */}
          <div className="flex-1 dev-card p-5 sm:p-6 min-h-[calc(100vh-12rem)] flex flex-col w-full">
            {activeProblem ? (
              <div className="space-y-5">
                {/* Header & Meta */}
                <div className="border-b border-[#E9EAF0] dark:border-[#262838] pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <DifficultyBadge difficulty={activeProblem.difficulty} />
                      <StatusBadge status={activeProblem.status} />
                      <Badge variant="purple">{activeProblem.type || 'DSA'}</Badge>
                      {activeProblem.tags?.map((t) => (
                        <span key={t} className="text-[11px] font-mono text-[#777B8A] dark:text-[#9497A8]">
                          #{t}
                        </span>
                      ))}
                      {activeProblem.sourceUrl && (
                        <a
                          href={activeProblem.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#6C5CE7] dark:text-[#8C7CFF] hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Source</span>
                        </a>
                      )}
                    </div>

                    <h2 className="font-serif text-xl sm:text-2xl text-[#20212A] dark:text-[#F1F2F6] font-normal tracking-tight">
                      {activeProblem.title}
                    </h2>
                  </div>

                  {/* Actions & Revision Trigger (Admin Only) */}
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => recordRevisionMutation.mutate({ id: activeProblem.id, outcome: 'REMEMBERED' })}
                        className="btn-secondary text-[11px] px-2 py-1 flex items-center gap-1 cursor-pointer"
                        title="Log SM-2 revision: Recalled"
                      >
                        <CheckCircle2 className="w-3 h-3 text-[#127C4B] dark:text-[#63E2A3]" />
                        <span>Recall Check</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditProblem(activeProblem)}
                        className="p-1.5 rounded text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6] hover:bg-[#F0EDFF] dark:hover:bg-[#1E202E] transition-colors cursor-pointer"
                        title="Edit Problem"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this problem and all solutions?')) {
                            deleteProblemMutation.mutate(activeProblem.id)
                          }
                        }}
                        className="p-1.5 rounded text-[#777B8A] hover:text-[#9E3939] dark:hover:text-[#E28383] hover:bg-[#F8EFEF] dark:hover:bg-[#2E1F1F] transition-colors cursor-pointer"
                        title="Delete Problem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Problem Statement */}
                {activeProblem.statement && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
                      Problem Statement
                    </div>
                    <div className="p-3.5 rounded bg-[#F8F9FC] dark:bg-[#14151F] border border-[#E9EAF0] dark:border-[#262838] text-xs">
                      <MarkdownViewer content={activeProblem.statement} />
                    </div>
                  </div>
                )}

                {/* Key Insight & Edge Cases (Two Column Callouts) */}
                {(activeProblem.keyInsight || activeProblem.edgeCases) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {activeProblem.keyInsight && (
                      <div className="p-3 rounded bg-[#F5F6FA] dark:bg-[#1A1C28] border border-[#E9EAF0] dark:border-[#262838] text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-medium text-[#777B8A] dark:text-[#9497A8] text-[11px] uppercase font-mono">
                          <Sparkles className="w-3 h-3 text-[#6C5CE7] dark:text-[#8C7CFF]" />
                          <span>Architectural Insight</span>
                        </div>
                        <p className="text-[#20212A] dark:text-[#F1F2F6] leading-relaxed">
                          {activeProblem.keyInsight}
                        </p>
                      </div>
                    )}

                    {activeProblem.edgeCases && (
                      <div className="p-3 rounded bg-[#F9F4EB] dark:bg-[#2B271E] border border-[#EFE3CF] dark:border-[#423927] text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-medium text-[#8C6422] dark:text-[#E5BE76] text-[11px] uppercase font-mono">
                          <AlertTriangle className="w-3 h-3 text-[#8C6422] dark:text-[#E5BE76]" />
                          <span>Edge Cases & Gotchas</span>
                        </div>
                        <p className="text-[#20212A] dark:text-[#F1F2F6] leading-relaxed">
                          {activeProblem.edgeCases}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Multi-Solution Implementation Workspace */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between border-b border-[#E9EAF0] dark:border-[#262838] pb-2">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5 text-[#6C5CE7] dark:text-[#8C7CFF]" />
                      <h3 className="font-serif text-sm font-medium text-[#20212A] dark:text-[#F1F2F6]">
                        Solution Approaches ({activeProblem.solutions?.length || 0})
                      </h3>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={handleOpenAddSolution}
                        className="btn-secondary text-[11px] px-2.5 py-1 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-[#6C5CE7] dark:text-[#8C7CFF]" />
                        <span>Add Approach</span>
                      </button>
                    )}
                  </div>

                  {activeProblem.solutions && activeProblem.solutions.length > 0 ? (
                    <div className="space-y-3.5">
                      {/* Solution Tabs */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {activeProblem.solutions.map((sol, idx) => {
                          const isSelected = activeSolutionIdx === idx
                          return (
                            <button
                              key={sol.id || idx}
                              onClick={() => setActiveSolutionIdx(idx)}
                              className={`px-3 py-1.5 rounded text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                                isSelected
                                  ? 'bg-[#6C5CE7] dark:bg-[#8C7CFF] text-white font-medium shadow-2xs'
                                  : 'bg-[#F0EDFF] dark:bg-[#1E202E] text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
                              }`}
                            >
                              <span>{sol.title || `Approach ${idx + 1}`}</span>
                              {sol.timeComplexity && (
                                <span className={`text-[10px] font-mono px-1 rounded ${
                                  isSelected ? 'bg-black/20 text-white' : 'bg-[#F0EDFF] dark:bg-[#262838] text-[#777B8A] dark:text-[#9497A8]'
                                }`}>
                                  {sol.timeComplexity}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>

                      {activeSolution && (
                        <div className="space-y-3">
                          {/* Workspace Bar: Title, Complexities & Solution Actions */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded bg-[#F8F9FC] dark:bg-[#14151F] border border-[#E9EAF0] dark:border-[#262838]">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-xs text-[#20212A] dark:text-[#F1F2F6]">
                                {activeSolution.title || 'Implementation Approach'}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#F0EDFF] dark:bg-[#1E202E] text-[#127C4B] dark:text-[#63E2A3] font-semibold border border-[#E9EAF0] dark:border-[#262838]">
                                Java 21
                              </span>
                              {activeSolution.timeComplexity && (
                                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white dark:bg-[#1E202E] text-[#20212A] dark:text-[#F1F2F6] border border-[#E9EAF0] dark:border-[#262838]">
                                  Time: <strong>{activeSolution.timeComplexity}</strong>
                                </span>
                              )}
                              {activeSolution.spaceComplexity && (
                                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white dark:bg-[#1E202E] text-[#20212A] dark:text-[#F1F2F6] border border-[#E9EAF0] dark:border-[#262838]">
                                  Space: <strong>{activeSolution.spaceComplexity}</strong>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => copySolutionCode(activeSolution.code || '')}
                                className="btn-secondary text-[11px] px-2 py-1 flex items-center gap-1 cursor-pointer"
                                title="Copy Java Solution Code"
                              >
                                {copiedCode ? (
                                  <>
                                    <Check className="w-3 h-3 text-[#6C5CE7] dark:text-[#8C7CFF]" />
                                    <span className="text-[#6C5CE7] dark:text-[#8C7CFF] font-semibold">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>

                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() => handleOpenEditSolution(activeSolution)}
                                    className="p-1 rounded text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6] hover:bg-[#F0EDFF] dark:hover:bg-[#1E202E] transition-colors cursor-pointer"
                                    title="Edit this approach"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      if (confirm(`Delete approach "${activeSolution.title}"?`)) {
                                        deleteSolutionMutation.mutate({
                                          problemId: activeProblem.id,
                                          solutionId: activeSolution.id,
                                        })
                                      }
                                    }}
                                    className="p-1 rounded text-[#777B8A] hover:text-[#9E3939] dark:hover:text-[#E28383] hover:bg-[#F8EFEF] dark:hover:bg-[#2E1F1F] transition-colors cursor-pointer"
                                    title="Delete this approach"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Code Editor */}
                          <CodeEditor
                            value={activeSolution.code || ''}
                            readOnly={true}
                            minHeight="280px"
                            language="java"
                          />

                          {/* Complexity Analysis & Approach Notes Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            {/* Time Complexity Card */}
                            <div className="p-3 rounded dev-subcard space-y-1">
                              <div className="text-[10px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
                                Time Complexity Analysis
                              </div>
                              <div className="text-xs font-mono font-semibold text-[#20212A] dark:text-[#F1F2F6]">
                                {activeSolution.timeComplexity || 'O(n)'}
                              </div>
                              <p className="text-[11px] text-[#777B8A] dark:text-[#9497A8] leading-relaxed">
                                {activeSolution.approach || 'Iterates over input elements with constant-time state updates per step.'}
                              </p>
                            </div>

                            {/* Space Complexity Card */}
                            <div className="p-3 rounded dev-subcard space-y-1">
                              <div className="text-[10px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
                                Auxiliary Space Complexity
                              </div>
                              <div className="text-xs font-mono font-semibold text-[#20212A] dark:text-[#F1F2F6]">
                                {activeSolution.spaceComplexity || 'O(1)'}
                              </div>
                              <p className="text-[11px] text-[#777B8A] dark:text-[#9497A8] leading-relaxed">
                                Constant additional pointers or structures allocated on heap.
                              </p>
                            </div>
                          </div>

                          {/* Pitfalls & Gotchas */}
                          {activeSolution.mistakes && (
                            <div className="p-3 rounded bg-[#F8EFEF] dark:bg-[#2E1F1F] border border-[#EED7D7] dark:border-[#4B2828] text-xs">
                              <span className="font-semibold text-[#9E3939] dark:text-[#E28383]">
                                Pitfalls & Mistakes:
                              </span>{' '}
                              <span className="text-[#20212A] dark:text-[#F1F2F6]">
                                {activeSolution.mistakes}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-[#777B8A] dark:text-[#9497A8] dev-subcard">
                      No code solutions recorded yet.{' '}
                      <button
                        onClick={handleOpenAddSolution}
                        className="text-[#6C5CE7] dark:text-[#8C7CFF] underline font-medium cursor-pointer"
                      >
                        Add your first Java implementation
                      </button>
                    </div>
                  )}
                </div>

                {/* GitHub References Section */}
                <div className="border-t border-[#E9EAF0] dark:border-[#262838] pt-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-serif font-medium text-[#20212A] dark:text-[#F1F2F6]">
                      <FolderGit2 className="w-3.5 h-3.5 text-[#6C5CE7] dark:text-[#8C7CFF]" />
                      <span>GitHub References & Source Commits</span>
                    </div>

                    <button
                      onClick={handleOpenAddGithub}
                      className="text-xs text-[#6C5CE7] dark:text-[#8C7CFF] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Attach GitHub Link</span>
                    </button>
                  </div>

                  {activeProblem.githubReferences && activeProblem.githubReferences.length > 0 ? (
                    <div className="space-y-1.5">
                      {activeProblem.githubReferences.map((ref) => (
                        <div
                          key={ref.id}
                          className="p-2.5 rounded dev-subcard flex items-center justify-between text-xs gap-3"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FolderGit2 className="w-3.5 h-3.5 text-[#777B8A] dark:text-[#9497A8] shrink-0" />
                            <div className="truncate">
                              {ref.fileUrl ? (
                                <a
                                  href={ref.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#6C5CE7] dark:text-[#8C7CFF] font-mono hover:underline flex items-center gap-1 truncate"
                                >
                                  <span>{ref.fileUrl.replace(/^https?:\/\/github\.com\//, '')}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                              ) : ref.repositoryUrl ? (
                                <a
                                  href={ref.repositoryUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#6C5CE7] dark:text-[#8C7CFF] font-mono hover:underline flex items-center gap-1 truncate"
                                >
                                  <span>{ref.repositoryUrl.replace(/^https?:\/\/github\.com\//, '')}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                              ) : (
                                <span className="font-mono text-[#777B8A] dark:text-[#9497A8]">GitHub Reference</span>
                              )}
                              {ref.notes && (
                                <span className="text-[11px] text-[#777B8A] dark:text-[#9497A8] block truncate">
                                  {ref.notes}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {ref.branch && (
                              <span className="text-[10px] font-mono text-[#777B8A] dark:text-[#9497A8] bg-[#F0EDFF] dark:bg-[#1E202E] px-1.5 py-0.5 rounded flex items-center gap-1">
                                <GitBranch className="w-2.5 h-2.5" />
                                {ref.branch}
                              </span>
                            )}
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteGithubRef(ref.id)}
                                className="p-1 rounded text-[#777B8A] hover:text-[#9E3939] dark:hover:text-[#E28383] transition-colors cursor-pointer"
                                title="Delete GitHub reference"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-xs text-[#777B8A] dark:text-[#9497A8] dev-subcard">
                      No GitHub repositories or commit files attached yet.{' '}
                      {isAdmin && (
                        <button
                          onClick={handleOpenAddGithub}
                          className="text-[#6C5CE7] dark:text-[#8C7CFF] underline font-medium cursor-pointer"
                        >
                          Link your repository
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-[#777B8A] dark:text-[#9497A8]">
                <Code2 className="w-10 h-10 text-[#B0B4C3] mb-3 opacity-60" />
                <h3 className="font-serif text-base text-[#20212A] dark:text-[#F1F2F6]">Select a Problem</h3>
                <p className="text-xs text-[#777B8A] dark:text-[#9497A8] max-w-sm mt-1">
                  Choose a problem from the catalog or click "Add Problem" to log a new DSA challenge.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table Mode: Dense, Clean Table */}
      {viewMode === 'table' && (
        <div className="dev-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E9EAF0] dark:border-[#262838] bg-[#F8F9FC] dark:bg-[#14151F] text-[#777B8A] dark:text-[#9497A8] font-mono uppercase text-[11px]">
                <th className="py-2.5 px-4 font-medium">Problem</th>
                <th className="py-2.5 px-4 font-medium">Topic</th>
                <th className="py-2.5 px-4 font-medium">Difficulty</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium">Solutions</th>
                <th className="py-2.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EAF0] dark:divide-[#262838]">
              {problems && problems.length > 0 ? (
                problems.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => {
                      setActiveProblem(p)
                      setViewMode('workspace')
                    }}
                    className="hover:bg-[#F8F9FC] dark:hover:bg-[#1E202E] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-medium text-[#20212A] dark:text-[#F1F2F6]">
                      {p.title}
                    </td>
                    <td className="py-3 px-4 text-[#777B8A] dark:text-[#9497A8]">
                      {p.tags?.[0] || 'Algorithm'}
                    </td>
                    <td className="py-3 px-4">
                      <DifficultyBadge difficulty={p.difficulty} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#777B8A] dark:text-[#9497A8]">
                      {p.solutions?.length || 0}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveProblem(p)
                            setViewMode('workspace')
                          }}
                          className="text-[#6C5CE7] dark:text-[#8C7CFF] hover:underline font-medium cursor-pointer"
                        >
                          Open Workspace →
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm(`Delete problem "${p.title}"?`)) {
                                deleteProblemMutation.mutate(p.id)
                              }
                            }}
                            className="p-1 rounded text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors"
                            title="Delete problem"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#777B8A] dark:text-[#9497A8]">
                    No problems matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Add/Edit Problem */}
      <Modal
        isOpen={isProblemModalOpen}
        onClose={() => setIsProblemModalOpen(false)}
        title={isEditingProblem ? 'Edit Problem' : 'Add New Problem'}
        subtitle="Log LeetCode, Codeforces, or Java concurrency challenge"
        maxWidth="4xl"
      >
        <form onSubmit={handleSaveProblem} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
                Problem Title
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. LRU Cache Implementation"
                className="dev-input w-full px-3 py-1.5 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
                Difficulty
              </label>
              <select
                value={formDifficulty}
                onChange={(e) => setFormDifficulty(e.target.value as Difficulty)}
                className="dev-input w-full px-2.5 py-1.5 text-xs cursor-pointer"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
                Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as ProblemStatus)}
                className="dev-input w-full px-2.5 py-1.5 text-xs cursor-pointer"
              >
                <option value="NOT_STARTED">Pending</option>
                <option value="ATTEMPTED">Attempted</option>
                <option value="SOLVED">Solved</option>
                <option value="NEEDS_REVISION">Needs Revision</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
                Source URL
              </label>
              <input
                type="text"
                value={formSourceUrl}
                onChange={(e) => setFormSourceUrl(e.target.value)}
                placeholder="https://leetcode.com/problems/lru-cache/"
                className="dev-input w-full px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formTags}
              onChange={(e) => setFormTags(e.target.value)}
              placeholder="hashmap, doubly-linked-list, lru"
              className="dev-input w-full px-3 py-1.5 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
              Problem Statement (Markdown)
            </label>
            <textarea
              value={formStatement}
              onChange={(e) => setFormStatement(e.target.value)}
              rows={4}
              className="dev-input w-full p-2.5 font-mono text-xs custom-scrollbar"
              placeholder="Design a data structure that follows the constraints of a Least Recently Used (LRU) cache..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
                Key Architectural Insight
              </label>
              <textarea
                value={formKeyInsight}
                onChange={(e) => setFormKeyInsight(e.target.value)}
                rows={2}
                className="dev-input w-full p-2.5 text-xs"
                placeholder="Combine HashMap for O(1) key lookup with Doubly Linked List for O(1) removal..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
                Edge Cases & Gotchas
              </label>
              <textarea
                value={formEdgeCases}
                onChange={(e) => setFormEdgeCases(e.target.value)}
                rows={2}
                className="dev-input w-full p-2.5 text-xs"
                placeholder="Capacity equals 0; updating existing key without evicting..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E9EAF0] dark:border-[#262838]">
            <button
              type="button"
              onClick={() => setIsProblemModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProblemMutation.isPending || updateProblemMutation.isPending}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              {(createProblemMutation.isPending || updateProblemMutation.isPending) && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              <span>
                {createProblemMutation.isPending || updateProblemMutation.isPending
                  ? 'Saving Problem...'
                  : isEditingProblem
                  ? 'Update Problem'
                  : 'Save Problem'}
              </span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add/Edit Solution Approach */}
      <Modal
        isOpen={isSolutionModalOpen}
        onClose={() => setIsSolutionModalOpen(false)}
        title={editingSolutionId ? 'Edit Solution Approach' : 'Add Implementation Approach'}
        subtitle={`Problem: ${activeProblem?.title || ''}`}
        maxWidth="4xl"
      >
        <form onSubmit={handleSaveSolution} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
                Approach Title
              </label>
              <input
                type="text"
                value={solTitle}
                onChange={(e) => setSolTitle(e.target.value)}
                placeholder="e.g. Optimal: Doubly-Linked List"
                className="dev-input w-full px-3 py-1.5 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
                Time Complexity
              </label>
              <input
                type="text"
                value={solTimeComp}
                onChange={(e) => setSolTimeComp(e.target.value)}
                placeholder="O(1)"
                className="dev-input w-full px-3 py-1.5 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
                Space Complexity
              </label>
              <input
                type="text"
                value={solSpaceComp}
                onChange={(e) => setSolSpaceComp(e.target.value)}
                placeholder="O(capacity)"
                className="dev-input w-full px-3 py-1.5 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
              Algorithmic Approach & Invariant
            </label>
            <input
              type="text"
              value={solApproach}
              onChange={(e) => setSolApproach(e.target.value)}
              placeholder="Detailed algorithmic explanation and invariant description..."
              className="dev-input w-full px-3 py-1.5 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
              Java Solution Code
            </label>
            <textarea
              value={solCode}
              onChange={(e) => setSolCode(e.target.value)}
              rows={12}
              className="dev-input w-full p-3 font-mono text-xs custom-scrollbar leading-relaxed"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
                Mistakes / Tricky Edge Cases
              </label>
              <input
                type="text"
                value={solMistakes}
                onChange={(e) => setSolMistakes(e.target.value)}
                placeholder="e.g. Forgot to update tail reference when removing LRU node"
                className="dev-input w-full px-3 py-1.5 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
                GitHub Solution File URL (Optional)
              </label>
              <input
                type="text"
                value={solGithubUrl}
                onChange={(e) => setSolGithubUrl(e.target.value)}
                placeholder="https://github.com/myrepo/src/Solution.java"
                className="dev-input w-full px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E9EAF0] dark:border-[#262838]">
            <button
              type="button"
              onClick={() => setIsSolutionModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addSolutionMutation.isPending || updateSolutionMutation.isPending}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              {(addSolutionMutation.isPending || updateSolutionMutation.isPending) && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              <span>
                {addSolutionMutation.isPending || updateSolutionMutation.isPending
                  ? 'Saving Approach...'
                  : editingSolutionId
                  ? 'Update Approach'
                  : 'Save Approach'}
              </span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Attach GitHub Reference */}
      <Modal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
        title="Attach GitHub Reference"
        subtitle={`Link source repository or code file for "${activeProblem?.title || ''}"`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveGithubRef} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
              Repository URL
            </label>
            <input
              type="text"
              value={ghRepoUrl}
              onChange={(e) => setGhRepoUrl(e.target.value)}
              placeholder="https://github.com/username/leetcode-java-solutions"
              className="dev-input w-full px-3 py-1.5 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
              File or Commit URL (Optional)
            </label>
            <input
              type="text"
              value={ghFileUrl}
              onChange={(e) => setGhFileUrl(e.target.value)}
              placeholder="https://github.com/username/leetcode-java-solutions/blob/main/LRUCache.java"
              className="dev-input w-full px-3 py-1.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
                Branch
              </label>
              <input
                type="text"
                value={ghBranch}
                onChange={(e) => setGhBranch(e.target.value)}
                placeholder="main"
                className="dev-input w-full px-3 py-1.5 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
                Notes / Label
              </label>
              <input
                type="text"
                value={ghNotes}
                onChange={(e) => setGhNotes(e.target.value)}
                placeholder="Optimal Java 21 test harness"
                className="dev-input w-full px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E9EAF0] dark:border-[#262838]">
            <button
              type="button"
              onClick={() => setIsGithubModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProblemMutation.isPending}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              {updateProblemMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{updateProblemMutation.isPending ? 'Linking...' : 'Attach Reference'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
