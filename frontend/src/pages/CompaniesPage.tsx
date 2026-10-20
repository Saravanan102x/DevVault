import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  Plus,
  Folder,
  Trash2,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { companiesApi, questionsApi } from '../services/api'
import type { Company, CompanyFolder, InterviewQuestion, QuestionCategory, PreparationStatus } from '../types'
import { Modal } from '../components/common/Modal'
import { Badge } from '../components/common/Badge'
import { MarkdownViewer } from '../components/common/MarkdownViewer'
import { useAccess } from '../context/AccessContext'

export const CompaniesPage: React.FC = () => {
  const { isAdmin } = useAccess()
  const queryClient = useQueryClient()
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  // Modals
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)

  // Forms
  const [compName, setCompName] = useState('')
  const [compWebsite, setCompWebsite] = useState('')
  const [compPriority, setCompPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH')
  const [compRoles, setCompRoles] = useState('Senior Java Engineer, SDE 2')

  const [folderName, setFolderName] = useState('')
  const [folderDesc, setFolderDesc] = useState('')

  const [qQuestion, setQQuestion] = useState('')
  const [qAnswer, setQAnswer] = useState('')
  const [qCategory, setQCategory] = useState<QuestionCategory>('TECHNICAL')
  const [qRound, setQRound] = useState('Round 1: Java & Concurrency')
  const [qStatus, setQStatus] = useState<PreparationStatus>('READY')
  const [qDataSource] = useState<'PERSONAL' | 'VERIFIED' | 'UNSOURCED'>('PERSONAL')

  // Data fetching
  const { data: companies, isLoading: compLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companiesApi.list(),
  })

  // Select first company by default
  React.useEffect(() => {
    if (companies && companies.length > 0 && !selectedCompany) {
      setSelectedCompany(companies[0])
    }
  }, [companies, selectedCompany])

  const { data: questions } = useQuery({
    queryKey: ['questions', selectedCompany?.id, selectedCategory],
    queryFn: () =>
      questionsApi.list({
        companyId: selectedCompany?.id,
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
      }),
    enabled: !!selectedCompany,
  })

  const { data: folders } = useQuery({
    queryKey: ['company-folders', selectedCompany?.id],
    queryFn: () => (selectedCompany ? companiesApi.getFolders(selectedCompany.id) : Promise.resolve([] as CompanyFolder[])),
    enabled: !!selectedCompany,
  })

  // Mutations
  const createCompanyMutation = useMutation({
    mutationFn: (c: Partial<Company>) => companiesApi.create(c),
    onSuccess: (newComp) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Company added')
      setSelectedCompany(newComp)
      setIsCompanyModalOpen(false)
    },
  })

  const createFolderMutation = useMutation({
    mutationFn: ({ companyId, f }: { companyId: string; f: Partial<CompanyFolder> }) =>
      companiesApi.createFolder(companyId, f),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-folders', selectedCompany?.id] })
      toast.success('Interview round created')
      setIsFolderModalOpen(false)
    },
  })

  const createQuestionMutation = useMutation({
    mutationFn: (q: Partial<InterviewQuestion>) => questionsApi.create(q),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', selectedCompany?.id] })
      toast.success('Question added')
      setIsQuestionModalOpen(false)
    },
  })

  const deleteQuestionMutation = useMutation({
    mutationFn: (id: string) => questionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', selectedCompany?.id] })
      toast.success('Question removed')
    },
    onError: () => toast.error('Failed to remove question'),
  })

  const deleteCompanyMutation = useMutation({
    mutationFn: (id: string) => companiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Company workspace deleted')
      setSelectedCompany(null)
    },
    onError: () => toast.error('Failed to delete company'),
  })

  const deleteFolderMutation = useMutation({
    mutationFn: ({ companyId, folderId }: { companyId: string; folderId: string }) =>
      companiesApi.deleteFolder(companyId, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-folders', selectedCompany?.id] })
      toast.success('Interview round deleted')
    },
    onError: () => toast.error('Failed to delete interview round'),
  })

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault()
    if (!compName.trim()) return
    const rolesArray = compRoles.split(',').map((r) => r.trim()).filter(Boolean)
    createCompanyMutation.mutate({
      name: compName.trim(),
      website: compWebsite.trim(),
      priority: compPriority,
      targetRoles: rolesArray,
    })
  }

  const handleSaveFolder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCompany || !folderName.trim()) return
    createFolderMutation.mutate({
      companyId: selectedCompany.id,
      f: { name: folderName.trim(), description: folderDesc.trim() },
    })
  }

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCompany || !qQuestion.trim()) return
    createQuestionMutation.mutate({
      question: qQuestion.trim(),
      answer: qAnswer.trim(),
      category: qCategory,
      round: qRound.trim(),
      companyIds: [selectedCompany.id],
      preparationStatus: qStatus,
      dataSource: qDataSource,
      tags: [selectedCompany.slug || selectedCompany.name.toLowerCase()],
    })
  }

  const categories = [
    { id: 'ALL', label: 'All Topics' },
    { id: 'TECHNICAL', label: 'Java & Backend' },
    { id: 'SYSTEM_DESIGN', label: 'System Design (LLD/HLD)' },
    { id: 'DSA', label: 'DSA Questions' },
    { id: 'HR', label: 'HR & Behavioral' },
    { id: 'SELF_INTRODUCTION', label: 'Experience & Intro' },
  ]

  return (
    <div className="space-y-5 pb-8">
      {/* Top Header */}
      <div className="border-b border-[#E9EAF0] dark:border-[#262838] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-normal text-[#20212A] dark:text-[#F1F2F6] tracking-tight">
            Company Interview Preparation
          </h1>
          <p className="text-xs text-[#777B8A] dark:text-[#9497A8] mt-0.5">
            Dedicated company workspaces, round structures, technical evaluations, and tailored question banks.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setCompName('')
              setCompWebsite('')
              setCompPriority('HIGH')
              setCompRoles('Senior Java Engineer, SDE 2')
              setIsCompanyModalOpen(true)
            }}
            className="btn-primary text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Company</span>
          </button>
        )}
      </div>

      {/* Main Workspace Layout */}
      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* Left Column: Company Directory Rail */}
        <div className="w-full md:w-64 shrink-0 dev-card p-3 space-y-2">
          <div className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8] px-1 pb-1 border-b border-[#E9EAF0] dark:border-[#262838] flex items-center justify-between">
            <span>Target Directory</span>
            <span className="text-[10px] text-[#777B8A] dark:text-[#9497A8]">{companies?.length || 0}</span>
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-16rem)] custom-scrollbar">
            {compLoading ? (
              <div className="py-8 text-center text-xs text-[#777B8A] dark:text-[#9497A8]">Loading companies...</div>
            ) : companies && companies.length > 0 ? (
              companies.map((comp) => {
                const isSelected = selectedCompany?.id === comp.id
                return (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedCompany(comp)}
                    className={`group p-2.5 rounded border transition-colors cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-[#F0EDFF] dark:bg-[#1E202E] border-[#6C5CE7]/40 dark:border-[#8C7CFF]/40 text-[#20212A] dark:text-[#F1F2F6]'
                        : 'border-transparent hover:bg-[#F8F9FC] dark:hover:bg-[#1A1C28] text-[#20212A] dark:text-[#F1F2F6]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-medium truncate block flex-1">{comp.name}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge variant={comp.priority === 'HIGH' ? 'easy' : 'default'} size="sm">
                          {comp.priority}
                        </Badge>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm(`Delete company workspace "${comp.name}" and all questions?`)) {
                                deleteCompanyMutation.mutate(comp.id)
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/15 text-gray-400 hover:text-rose-500 transition-all cursor-pointer"
                            title={`Delete ${comp.name}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {comp.targetRoles && comp.targetRoles.length > 0 && (
                      <p className="text-[11px] text-[#777B8A] dark:text-[#9497A8] mt-1 truncate">
                        {comp.targetRoles.join(', ')}
                      </p>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="py-8 text-center text-xs text-[#777B8A] dark:text-[#9497A8]">No companies found.</div>
            )}
          </div>
        </div>

        {/* Right Column: Company Workspace Detail */}
        <div className="flex-1 dev-card p-6 min-h-[calc(100vh-16rem)] flex flex-col w-full">
          {selectedCompany ? (
            <div className="space-y-6">
              {/* Company Header */}
              <div className="border-b border-[#E9EAF0] dark:border-[#262838] pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={selectedCompany.priority === 'HIGH' ? 'easy' : 'default'}>
                      {selectedCompany.priority} PRIORITY
                    </Badge>
                    {selectedCompany.website && (
                      <a
                        href={selectedCompany.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#6C5CE7] dark:text-[#8C7CFF] hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Company Site</span>
                      </a>
                    )}
                  </div>

                  <h2 className="font-serif text-2xl text-[#20212A] dark:text-[#F1F2F6] font-normal tracking-tight">
                    {selectedCompany.name}
                  </h2>

                  {selectedCompany.targetRoles && (
                    <p className="text-xs text-[#777B8A] dark:text-[#9497A8]">
                      Targeting: {selectedCompany.targetRoles.join(' • ')}
                    </p>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <button
                      onClick={() => {
                        setFolderName('')
                        setFolderDesc('')
                        setIsFolderModalOpen(true)
                      }}
                      className="btn-secondary text-xs px-2.5 py-1.5 cursor-pointer"
                    >
                      <Folder className="w-3.5 h-3.5 text-[#6C5CE7]" />
                      <span>+ Round Folder</span>
                    </button>

                    <button
                      onClick={() => {
                        setQQuestion('')
                        setQAnswer('')
                        setQCategory('TECHNICAL')
                        setQRound('Round 1: Java & Concurrency')
                        setQStatus('READY')
                        setIsQuestionModalOpen(true)
                      }}
                      className="btn-primary text-xs px-2.5 py-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Question</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete company workspace "${selectedCompany.name}" and all questions?`)) {
                          deleteCompanyMutation.mutate(selectedCompany.id)
                        }
                      }}
                      className="btn-secondary text-xs px-2.5 py-1.5 cursor-pointer text-[#777B8A] hover:text-rose-600 hover:border-rose-500/40"
                      title="Delete this company workspace"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Company</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Rounds / Folders if any */}
              {folders && folders.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono uppercase text-[#777B8A]">Interview Rounds</div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {folders.map((f: CompanyFolder) => (
                      <div
                        key={f.id}
                        className="group px-2.5 py-1 rounded bg-[#F8F9FC] dark:bg-[#14151F] border border-[#E9EAF0] dark:border-[#262838] text-xs flex items-center gap-1.5 shrink-0"
                      >
                        <Folder className="w-3 h-3 text-[#6C5CE7]" />
                        <span className="font-medium text-[#20212A] dark:text-[#F1F2F6]">{f.name}</span>
                        {f.description && (
                          <span className="text-[10px] text-[#777B8A]">({f.description})</span>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete round "${f.name}"?`)) {
                                deleteFolderMutation.mutate({ companyId: selectedCompany.id, folderId: f.id })
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-rose-500 cursor-pointer transition-opacity"
                            title="Delete round"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#E9EAF0] dark:border-[#262838]">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-[#6C5CE7] text-white font-medium'
                        : 'text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6] hover:bg-[#F8F9FC] dark:hover:bg-[#1E202E]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                <div className="text-[11px] font-mono uppercase text-[#777B8A] flex items-center justify-between">
                  <span>Questions Repository ({questions?.length || 0})</span>
                </div>

                {questions && questions.length > 0 ? (
                  <div className="space-y-3">
                    {questions.map((q) => (
                      <div
                        key={q.id}
                        className="p-4 rounded bg-[#F8F9FC] dark:bg-[#14151F] border border-[#E9EAF0] dark:border-[#262838] space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="purple">{q.category || 'TECHNICAL'}</Badge>
                              {q.round && (
                                <span className="text-[11px] font-mono text-[#777B8A] bg-[#F0EDFF] dark:bg-[#1E202E] px-1.5 py-0.5 rounded">
                                  {q.round}
                                </span>
                              )}
                              <span className="text-[10px] font-mono uppercase text-[#6C5CE7] dark:text-[#8C7CFF]">
                                {q.dataSource || 'PERSONAL'}
                              </span>
                            </div>

                            <h3 className="font-serif text-sm sm:text-base font-medium text-[#20212A] dark:text-[#F1F2F6]">
                              {q.question}
                            </h3>
                          </div>

                          {isAdmin && (
                            <button
                              onClick={() => {
                                if (confirm('Delete this question?')) {
                                  deleteQuestionMutation.mutate(q.id)
                                }
                              }}
                              className="p-1 rounded text-[#B0B4C3] hover:text-[#9E3939] transition-colors cursor-pointer"
                              title="Delete question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {q.answer && (
                          <div className="pt-2 border-t border-[#E9EAF0] dark:border-[#262838]">
                            <MarkdownViewer content={q.answer} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-[#777B8A] dev-subcard rounded">
                    <p>No interview questions logged yet for {selectedCompany.name}.</p>
                    <button
                      onClick={() => setIsQuestionModalOpen(true)}
                      className="text-[#6C5CE7] underline mt-1.5 block mx-auto font-medium cursor-pointer"
                    >
                      + Add first question
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-[#777B8A]">
              <Building2 className="w-10 h-10 text-[#B0B4C3] mb-3 opacity-60" />
              <h3 className="font-serif text-base text-[#20212A] dark:text-[#F1F2F6]">Select a Company</h3>
              <p className="text-xs text-[#777B8A] max-w-sm mt-1">
                Choose a company workspace from the directory or add a new target organization.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Company */}
      <Modal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        title="Add Target Company"
        subtitle="Create dedicated research track for technical interviews"
      >
        <form onSubmit={handleSaveCompany} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A]">Company Name</label>
            <input
              type="text"
              value={compName}
              onChange={(e) => setCompName(e.target.value)}
              placeholder="e.g. PayPal, Walmart Global Tech, Freshworks"
              className="dev-input w-full px-3 py-1.5 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A]">Priority</label>
              <select
                value={compPriority}
                onChange={(e) => setCompPriority(e.target.value as any)}
                className="dev-input w-full px-2.5 py-1.5 text-xs cursor-pointer"
              >
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A]">Company Website</label>
              <input
                type="text"
                value={compWebsite}
                onChange={(e) => setCompWebsite(e.target.value)}
                placeholder="https://paypal.com/careers"
                className="dev-input w-full px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A]">Target Roles (comma separated)</label>
            <input
              type="text"
              value={compRoles}
              onChange={(e) => setCompRoles(e.target.value)}
              placeholder="Senior Java Engineer, SDE 2, Distributed Systems"
              className="dev-input w-full px-3 py-1.5 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E9EAF0] dark:border-[#262838]">
            <button
              type="button"
              onClick={() => setIsCompanyModalOpen(false)}
              className="btn-secondary text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCompanyMutation.isPending}
              className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer"
            >
              {createCompanyMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{createCompanyMutation.isPending ? 'Adding Company...' : 'Add Company'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Round Folder */}
      <Modal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        title="Add Interview Round / Folder"
        subtitle={`Company: ${selectedCompany?.name || ''}`}
      >
        <form onSubmit={handleSaveFolder} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">Round Name</label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. Round 1: Java & Concurrency Deep Dive"
              className="dev-input w-full px-3 py-1.5 text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">Description (Optional)</label>
            <input
              type="text"
              value={folderDesc}
              onChange={(e) => setFolderDesc(e.target.value)}
              placeholder="e.g. 60 min technical screening on JVM and Multithreading"
              className="dev-input w-full px-3 py-1.5 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E9EAF0] dark:border-[#262838]">
            <button
              type="button"
              onClick={() => setIsFolderModalOpen(false)}
              className="btn-secondary text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createFolderMutation.isPending}
              className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer"
            >
              {createFolderMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{createFolderMutation.isPending ? 'Creating Round...' : 'Create Round'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Question */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        title="Add Interview Question"
        subtitle={`For: ${selectedCompany?.name || ''}`}
        maxWidth="4xl"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">Question</label>
            <input
              type="text"
              value={qQuestion}
              onChange={(e) => setQQuestion(e.target.value)}
              placeholder="e.g. How does Kafka guarantee exactly-once processing semantics?"
              className="dev-input w-full px-3 py-1.5 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">Topic / Category</label>
              <select
                value={qCategory}
                onChange={(e) => setQCategory(e.target.value as any)}
                className="dev-input w-full px-2.5 py-1.5 text-xs cursor-pointer"
              >
                <option value="TECHNICAL">Java & Backend</option>
                <option value="SYSTEM_DESIGN">System Design (LLD/HLD)</option>
                <option value="DSA">DSA</option>
                <option value="HR">HR & Behavioral</option>
                <option value="SELF_INTRODUCTION">Self Introduction</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">Round</label>
              <input
                type="text"
                value={qRound}
                onChange={(e) => setQRound(e.target.value)}
                placeholder="Round 1: Java & Concurrency"
                className="dev-input w-full px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">Detailed Solution / Response (Markdown)</label>
            <textarea
              value={qAnswer}
              onChange={(e) => setQAnswer(e.target.value)}
              rows={8}
              className="dev-input w-full p-2.5 font-mono text-xs custom-scrollbar"
              placeholder="Outline the optimal answer, JVM internals, architectural trade-offs..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E9EAF0] dark:border-[#262838]">
            <button
              type="button"
              onClick={() => setIsQuestionModalOpen(false)}
              className="btn-secondary text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createQuestionMutation.isPending}
              className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer"
            >
              {createQuestionMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{createQuestionMutation.isPending ? 'Saving Question...' : 'Save Question'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
