import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  type DocumentData,
} from 'firebase/firestore'
import { db, auth } from './config'
import { projectsStorage } from '../projectsStorage'
import { diagramsStorage } from '../diagramsStorage'
import type {
  Note, Problem, Solution, Company, CompanyFolder,
  InterviewQuestion, Tag, RevisionRecord, JournalEntry,
  DashboardStats, SearchResult, ChecklistItem, DailyTechTopicLog
} from '../../types'

const OWNER_UID = (import.meta.env.VITE_DEVVAULT_OWNER_UID || 'I6t3RBPifeP6wNh1fOGdkRgangB2').trim()

export function getUserUid(): string {
  return auth.currentUser?.uid || OWNER_UID
}

export function assertOwner(): string {
  const user = auth.currentUser
  if (!user) {
    throw new Error('Authentication required: You must be signed in as the owner to modify DevVault data.')
  }
  return user.uid
}

function userCol(collectionName: string) {
  const uid = getUserUid()
  return collection(db, 'users', uid, collectionName)
}

function userDoc(collectionName: string, id: string) {
  const uid = getUserUid()
  return doc(db, 'users', uid, collectionName, id)
}

// ─── Notes ───────────────────────────────────────────────────────────────────
export const fbNotesApi = {
  list: async (params?: { folder?: string; tag?: string; q?: string; favourites?: boolean; pinned?: boolean }): Promise<Note[]> => {
    const colRef = userCol('notes')
    const snap = await getDocs(colRef)
    let list: Note[] = snap.docs.map(d => ({ ...d.data(), id: d.id } as Note))

    if (params?.folder) {
      list = list.filter(n => n.folder?.toLowerCase() === params.folder?.toLowerCase())
    }
    if (params?.tag) {
      const tNorm = params.tag.toLowerCase().trim()
      list = list.filter(n => n.tags?.some(t => t.toLowerCase().trim() === tNorm))
    }
    if (params?.favourites !== undefined) {
      list = list.filter(n => n.favourite === params.favourites)
    }
    if (params?.pinned !== undefined) {
      list = list.filter(n => n.pinned === params.pinned)
    }
    if (params?.q) {
      const qNorm = params.q.toLowerCase().trim()
      list = list.filter(n =>
        n.title?.toLowerCase().includes(qNorm) ||
        n.content?.toLowerCase().includes(qNorm) ||
        n.tags?.some(t => t.toLowerCase().includes(qNorm))
      )
    }
    return list
  },

  get: async (id: string): Promise<Note> => {
    const snap = await getDoc(userDoc('notes', id))
    if (!snap.exists()) throw new Error(`Note not found: ${id}`)
    return { ...snap.data(), id: snap.id } as Note
  },

  create: async (note: Partial<Note>): Promise<Note> => {
    const id = note.id || 'note-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)
    const now = new Date().toISOString()
    const newNote: Note = {
      id,
      title: note.title || '',
      content: note.content || '',
      category: note.category || '',
      folder: note.folder || '',
      tags: note.tags || [],
      relatedProblemIds: note.relatedProblemIds || [],
      relatedCompanyIds: note.relatedCompanyIds || [],
      sourceUrls: note.sourceUrls || [],
      favourite: Boolean(note.favourite),
      pinned: Boolean(note.pinned),
      revisionDate: note.revisionDate,
      status: note.status || 'ACTIVE',
      createdAt: note.createdAt || now,
      updatedAt: now,
    }
    await setDoc(userDoc('notes', id), newNote)
    return newNote
  },

  update: async (id: string, note: Partial<Note>): Promise<Note> => {
    const ref = userDoc('notes', id)
    const existing = await fbNotesApi.get(id)
    const updated: Note = {
      ...existing,
      ...note,
      id,
      updatedAt: new Date().toISOString(),
    }
    await updateDoc(ref, updated as unknown as DocumentData)
    return updated
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(userDoc('notes', id))
  },

  toggleFavourite: async (id: string): Promise<Note> => {
    const existing = await fbNotesApi.get(id)
    return fbNotesApi.update(id, { favourite: !existing.favourite })
  },

  togglePin: async (id: string): Promise<Note> => {
    const existing = await fbNotesApi.get(id)
    return fbNotesApi.update(id, { pinned: !existing.pinned })
  },

  folders: async (): Promise<string[]> => {
    const list = await fbNotesApi.list()
    const folders = new Set<string>()
    list.forEach(n => {
      if (n.folder && n.folder.trim()) folders.add(n.folder.trim())
    })
    return Array.from(folders).sort()
  },
}

// ─── Problems ─────────────────────────────────────────────────────────────────
export const fbProblemsApi = {
  list: async (params?: { type?: string; difficulty?: string; status?: string; tag?: string; companyId?: string; q?: string }): Promise<Problem[]> => {
    const snap = await getDocs(userCol('problems'))
    let list: Problem[] = snap.docs.map(d => ({ ...d.data(), id: d.id } as Problem))

    if (params?.type) list = list.filter(p => p.type === params.type)
    if (params?.difficulty) list = list.filter(p => p.difficulty === params.difficulty)
    if (params?.status) list = list.filter(p => p.status === params.status)
    if (params?.companyId) list = list.filter(p => p.companyIds?.includes(params.companyId!))
    if (params?.tag) {
      const tNorm = params.tag.toLowerCase().trim()
      list = list.filter(p => p.tags?.some(t => t.toLowerCase().trim() === tNorm))
    }
    if (params?.q) {
      const qNorm = params.q.toLowerCase().trim()
      list = list.filter(p =>
        p.title?.toLowerCase().includes(qNorm) ||
        p.statement?.toLowerCase().includes(qNorm) ||
        p.keyInsight?.toLowerCase().includes(qNorm) ||
        p.tags?.some(t => t.toLowerCase().includes(qNorm))
      )
    }
    return list
  },

  get: async (id: string): Promise<Problem> => {
    const snap = await getDoc(userDoc('problems', id))
    if (!snap.exists()) throw new Error(`Problem not found: ${id}`)
    return { ...snap.data(), id: snap.id } as Problem
  },

  create: async (problem: Partial<Problem>): Promise<Problem> => {
    const id = problem.id || 'prob-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)
    const now = new Date().toISOString()
    const newProb: Problem = {
      id,
      title: problem.title || '',
      statement: problem.statement || '',
      sourceUrl: problem.sourceUrl || '',
      difficulty: problem.difficulty || 'MEDIUM',
      type: problem.type || 'DSA',
      status: problem.status || 'NOT_STARTED',
      tags: problem.tags || [],
      companyIds: problem.companyIds || [],
      solutions: problem.solutions || [],
      keyInsight: problem.keyInsight || '',
      edgeCases: problem.edgeCases || '',
      personalExplanation: problem.personalExplanation || '',
      attemptCount: problem.attemptCount || 0,
      needsRevision: Boolean(problem.needsRevision),
      revisionDate: problem.revisionDate,
      githubReferences: problem.githubReferences || [],
      createdAt: problem.createdAt || now,
      updatedAt: now,
    }
    await setDoc(userDoc('problems', id), newProb)
    return newProb
  },

  update: async (id: string, problem: Partial<Problem>): Promise<Problem> => {
    const ref = userDoc('problems', id)
    const existing = await fbProblemsApi.get(id)
    const updated: Problem = {
      ...existing,
      ...problem,
      id,
      updatedAt: new Date().toISOString(),
    }
    await updateDoc(ref, updated as unknown as DocumentData)
    return updated
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(userDoc('problems', id))
  },

  addSolution: async (problemId: string, solution: Partial<Solution>): Promise<Problem> => {
    const problem = await fbProblemsApi.get(problemId)
    const now = new Date().toISOString()
    const newSolution: Solution = {
      id: solution.id || 'sol-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      problemId,
      title: solution.title || '',
      approach: solution.approach || '',
      code: solution.code || '',
      language: solution.language || 'Java',
      explanation: solution.explanation || '',
      timeComplexity: solution.timeComplexity || '',
      spaceComplexity: solution.spaceComplexity || '',
      inputExample: solution.inputExample || '',
      outputExample: solution.outputExample || '',
      mistakes: solution.mistakes || '',
      alternativeApproaches: solution.alternativeApproaches || '',
      timeTakenMinutes: solution.timeTakenMinutes || 0,
      tags: solution.tags || [],
      githubReferences: solution.githubReferences || [],
      status: solution.status || 'SAVED',
      practiceDate: solution.practiceDate || now.split('T')[0],
      createdAt: solution.createdAt || now,
      updatedAt: now,
    }
    const solutions = [...(problem.solutions || []), newSolution]
    return fbProblemsApi.update(problemId, { solutions })
  },

  updateSolution: async (problemId: string, solutionId: string, solution: Partial<Solution>): Promise<Problem> => {
    const problem = await fbProblemsApi.get(problemId)
    const solutions = (problem.solutions || []).map(s =>
      s.id === solutionId ? { ...s, ...solution, updatedAt: new Date().toISOString() } : s
    )
    return fbProblemsApi.update(problemId, { solutions })
  },

  deleteSolution: async (problemId: string, solutionId: string): Promise<Problem> => {
    const problem = await fbProblemsApi.get(problemId)
    const solutions = (problem.solutions || []).filter(s => s.id !== solutionId)
    return fbProblemsApi.update(problemId, { solutions })
  },

  tags: async (): Promise<string[]> => {
    const problems = await fbProblemsApi.list()
    const tags = new Set<string>()
    problems.forEach(p => p.tags?.forEach(t => tags.add(t.trim())))
    return Array.from(tags).sort()
  },
}

// ─── Companies ────────────────────────────────────────────────────────────────
export const fbCompaniesApi = {
  list: async (includeArchived = false): Promise<Company[]> => {
    const snap = await getDocs(userCol('companies'))
    let list = snap.docs.map(d => ({ ...d.data(), id: d.id } as Company))
    if (!includeArchived) list = list.filter(c => !c.archived)
    return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  },

  get: async (id: string): Promise<Company> => {
    const snap = await getDoc(userDoc('companies', id))
    if (!snap.exists()) throw new Error(`Company not found: ${id}`)
    return { ...snap.data(), id: snap.id } as Company
  },

  create: async (company: Partial<Company>): Promise<Company> => {
    const id = company.id || 'comp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)
    const now = new Date().toISOString()
    const newComp: Company = {
      id,
      name: company.name || '',
      slug: company.slug || (company.name || '').toLowerCase().replace(/\s+/g, '-'),
      website: company.website || '',
      overview: company.overview || '',
      logoUrl: company.logoUrl || '',
      priority: company.priority || 'MEDIUM',
      targetRoles: company.targetRoles || [],
      tags: company.tags || [],
      archived: Boolean(company.archived),
      sortOrder: company.sortOrder ?? 0,
      createdAt: company.createdAt || now,
      updatedAt: now,
    }
    await setDoc(userDoc('companies', id), newComp)
    return newComp
  },

  update: async (id: string, company: Partial<Company>): Promise<Company> => {
    const ref = userDoc('companies', id)
    const existing = await fbCompaniesApi.get(id)
    const updated: Company = {
      ...existing,
      ...company,
      id,
      updatedAt: new Date().toISOString(),
    }
    await updateDoc(ref, updated as unknown as DocumentData)
    return updated
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(userDoc('companies', id))
  },

  getFolders: async (companyId: string): Promise<CompanyFolder[]> => {
    const uid = getUserUid()
    const folderCol = collection(db, 'users', uid, 'companies', companyId, 'folders')
    const snap = await getDocs(folderCol)
    return snap.docs
      .map(d => ({ ...d.data(), id: d.id } as CompanyFolder))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  },

  createFolder: async (companyId: string, folder: Partial<CompanyFolder>): Promise<CompanyFolder> => {
    const uid = getUserUid()
    const id = folder.id || 'fold-' + Date.now()
    const now = new Date().toISOString()
    const newFolder: CompanyFolder = {
      id,
      companyId,
      parentId: folder.parentId,
      name: folder.name || 'New Folder',
      description: folder.description || '',
      sortOrder: folder.sortOrder ?? 0,
      archived: Boolean(folder.archived),
      createdAt: folder.createdAt || now,
      updatedAt: now,
    }
    const folderRef = doc(db, 'users', uid, 'companies', companyId, 'folders', id)
    await setDoc(folderRef, newFolder)
    return newFolder
  },

  updateFolder: async (companyId: string, folderId: string, folder: Partial<CompanyFolder>): Promise<CompanyFolder> => {
    const uid = getUserUid()
    const folderRef = doc(db, 'users', uid, 'companies', companyId, 'folders', folderId)
    const snap = await getDoc(folderRef)
    if (!snap.exists()) throw new Error(`Folder not found: ${folderId}`)
    const updated: CompanyFolder = {
      ...snap.data() as CompanyFolder,
      ...folder,
      updatedAt: new Date().toISOString(),
    }
    await updateDoc(folderRef, updated as unknown as DocumentData)
    return updated
  },

  deleteFolder: async (companyId: string, folderId: string): Promise<void> => {
    const uid = getUserUid()
    const folderRef = doc(db, 'users', uid, 'companies', companyId, 'folders', folderId)
    await deleteDoc(folderRef)
  },
}

// ─── Interview Questions ──────────────────────────────────────────────────────
export const fbQuestionsApi = {
  list: async (params?: { category?: string; folder?: string; companyId?: string; q?: string }): Promise<InterviewQuestion[]> => {
    const snap = await getDocs(userCol('interviewQuestions'))
    let list: InterviewQuestion[] = snap.docs.map(d => ({ ...d.data(), id: d.id } as InterviewQuestion))

    if (params?.category) list = list.filter(q => q.category === params.category)
    if (params?.folder) list = list.filter(q => q.folder === params.folder)
    if (params?.companyId) list = list.filter(q => q.companyIds?.includes(params.companyId!))
    if (params?.q) {
      const qNorm = params.q.toLowerCase().trim()
      list = list.filter(q =>
        q.question?.toLowerCase().includes(qNorm) ||
        q.answer?.toLowerCase().includes(qNorm) ||
        q.tags?.some(t => t.toLowerCase().includes(qNorm))
      )
    }
    return list
  },

  get: async (id: string): Promise<InterviewQuestion> => {
    const snap = await getDoc(userDoc('interviewQuestions', id))
    if (!snap.exists()) throw new Error(`Question not found: ${id}`)
    return { ...snap.data(), id: snap.id } as InterviewQuestion
  },

  create: async (q: Partial<InterviewQuestion>): Promise<InterviewQuestion> => {
    const id = q.id || 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)
    const now = new Date().toISOString()
    const newQ: InterviewQuestion = {
      id,
      question: q.question || '',
      answer: q.answer || '',
      category: q.category || 'TECHNICAL',
      folder: q.folder || '',
      companyIds: q.companyIds || [],
      tags: q.tags || [],
      sourceUrl: q.sourceUrl || '',
      round: q.round || '',
      difficulty: q.difficulty || 'MEDIUM',
      preparationStatus: q.preparationStatus || 'NOT_STARTED',
      needsRevision: Boolean(q.needsRevision),
      revisionDate: q.revisionDate,
      relatedNoteIds: q.relatedNoteIds || [],
      relatedProblemIds: q.relatedProblemIds || [],
      dataSource: q.dataSource || 'PERSONAL',
      createdAt: q.createdAt || now,
      updatedAt: now,
    }
    await setDoc(userDoc('interviewQuestions', id), newQ)
    return newQ
  },

  update: async (id: string, q: Partial<InterviewQuestion>): Promise<InterviewQuestion> => {
    const ref = userDoc('interviewQuestions', id)
    const existing = await fbQuestionsApi.get(id)
    const updated: InterviewQuestion = {
      ...existing,
      ...q,
      id,
      updatedAt: new Date().toISOString(),
    }
    await updateDoc(ref, updated as unknown as DocumentData)
    return updated
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(userDoc('interviewQuestions', id))
  },

  folders: async (): Promise<string[]> => {
    const list = await fbQuestionsApi.list()
    const folders = new Set<string>()
    list.forEach(q => {
      if (q.folder && q.folder.trim()) folders.add(q.folder.trim())
    })
    return Array.from(folders).sort()
  },
}

// ─── Tags ─────────────────────────────────────────────────────────────────────
export const fbTagsApi = {
  list: async (): Promise<Tag[]> => {
    const snap = await getDocs(userCol('tags'))
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as Tag))
  },

  findOrCreate: async (name: string): Promise<Tag> => {
    const tags = await fbTagsApi.list()
    const norm = name.trim().toLowerCase()
    const existing = tags.find(t => t.name.toLowerCase() === norm)
    if (existing) return existing

    const id = 'tag-' + Date.now()
    const newTag: Tag = {
      id,
      name: norm,
      displayName: name.trim(),
      createdAt: new Date().toISOString(),
    }
    await setDoc(userDoc('tags', id), newTag)
    return newTag
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(userDoc('tags', id))
  },
}

// ─── Revisions ────────────────────────────────────────────────────────────────
export const fbRevisionsApi = {
  record: async (revision: Partial<RevisionRecord>): Promise<RevisionRecord> => {
    const id = revision.id || 'rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)
    const now = new Date().toISOString()
    const newRev: RevisionRecord = {
      id,
      entityId: revision.entityId || '',
      entityType: revision.entityType || 'PROBLEM',
      entityTitle: revision.entityTitle || '',
      outcome: revision.outcome || 'REMEMBERED',
      notes: revision.notes || '',
      nextRevisionDate: revision.nextRevisionDate || now.split('T')[0],
      intervalDays: revision.intervalDays || 1,
      revisedAt: revision.revisedAt || now,
    }
    await setDoc(userDoc('revisions', id), newRev)
    return newRev
  },

  byEntity: async (entityId: string): Promise<RevisionRecord[]> => {
    const snap = await getDocs(query(userCol('revisions'), where('entityId', '==', entityId)))
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as RevisionRecord))
  },

  dueToday: async (): Promise<RevisionRecord[]> => {
    const today = new Date().toISOString().split('T')[0]
    const snap = await getDocs(userCol('revisions'))
    return snap.docs
      .map(d => ({ ...d.data(), id: d.id } as RevisionRecord))
      .filter(r => r.nextRevisionDate === today)
  },

  overdue: async (): Promise<RevisionRecord[]> => {
    const today = new Date().toISOString().split('T')[0]
    const snap = await getDocs(userCol('revisions'))
    return snap.docs
      .map(d => ({ ...d.data(), id: d.id } as RevisionRecord))
      .filter(r => Boolean(r.nextRevisionDate && r.nextRevisionDate < today))
  },

  upcoming: async (days = 7): Promise<RevisionRecord[]> => {
    const today = new Date().toISOString().split('T')[0]
    const future = new Date(Date.now() + days * 86400000).toISOString().split('T')[0]
    const snap = await getDocs(userCol('revisions'))
    return snap.docs
      .map(d => ({ ...d.data(), id: d.id } as RevisionRecord))
      .filter(r => Boolean(r.nextRevisionDate && r.nextRevisionDate >= today && r.nextRevisionDate <= future))
  },

  recent: async (limitCount = 10): Promise<RevisionRecord[]> => {
    const snap = await getDocs(userCol('revisions'))
    const list = snap.docs.map(d => ({ ...d.data(), id: d.id } as RevisionRecord))
    return list.sort((a, b) => b.revisedAt.localeCompare(a.revisedAt)).slice(0, limitCount)
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(userDoc('revisions', id))
  },
}

// ─── Journal ──────────────────────────────────────────────────────────────────
export const fbJournalApi = {
  list: async (params?: { from?: string; to?: string; recent?: number }): Promise<JournalEntry[]> => {
    const snap = await getDocs(userCol('journal'))
    let list: JournalEntry[] = snap.docs.map(d => ({ ...d.data(), id: d.id } as JournalEntry))
    if (params?.from) list = list.filter(j => j.date >= params.from!)
    if (params?.to) list = list.filter(j => j.date <= params.to!)
    list.sort((a, b) => b.date.localeCompare(a.date))
    if (params?.recent) list = list.slice(0, params.recent)
    return list
  },

  today: async (): Promise<JournalEntry | null> => {
    const today = new Date().toISOString().split('T')[0]
    const snap = await getDocs(query(userCol('journal'), where('date', '==', today)))
    if (snap.empty) return null
    const first = snap.docs[0]
    return { ...first.data(), id: first.id } as JournalEntry
  },

  get: async (id: string): Promise<JournalEntry> => {
    const snap = await getDoc(userDoc('journal', id))
    if (!snap.exists()) throw new Error(`Journal entry not found: ${id}`)
    return { ...snap.data(), id: snap.id } as JournalEntry
  },

  create: async (entry: Partial<JournalEntry>): Promise<JournalEntry> => {
    const id = entry.id || 'j-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)
    const now = new Date().toISOString()
    const newEntry: JournalEntry = {
      id,
      date: entry.date || now.split('T')[0],
      title: entry.title || '',
      whatIStudied: entry.whatIStudied || '',
      whatIImplemented: entry.whatIImplemented || '',
      challenges: entry.challenges || '',
      toRevise: entry.toRevise || '',
      mood: entry.mood || 'FOCUS',
      tags: entry.tags || [],
      relatedProblemIds: entry.relatedProblemIds || [],
      relatedNoteIds: entry.relatedNoteIds || [],
      productivityScore: entry.productivityScore ?? 8,
      createdAt: entry.createdAt || now,
      updatedAt: now,
    }
    await setDoc(userDoc('journal', id), newEntry)
    return newEntry
  },

  update: async (id: string, entry: Partial<JournalEntry>): Promise<JournalEntry> => {
    const ref = userDoc('journal', id)
    const existing = await fbJournalApi.get(id)
    const updated: JournalEntry = {
      ...existing,
      ...entry,
      id,
      updatedAt: new Date().toISOString(),
    }
    await updateDoc(ref, updated as unknown as DocumentData)
    return updated
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(userDoc('journal', id))
  },
}

// ─── Search ───────────────────────────────────────────────────────────────────
export const fbSearchApi = {
  search: async (q: string, types?: string[]): Promise<SearchResult> => {
    const searchAll = !types || types.length === 0
    let notes: Note[] = []
    let problems: Problem[] = []
    let questions: InterviewQuestion[] = []

    if (searchAll || types.includes('NOTE')) {
      notes = await fbNotesApi.list({ q })
    }
    if (searchAll || types.includes('PROBLEM')) {
      problems = await fbProblemsApi.list({ q })
    }
    if (searchAll || types.includes('INTERVIEW_QUESTION')) {
      questions = await fbQuestionsApi.list({ q })
    }

    return {
      notes,
      problems,
      questions,
      totalCount: notes.length + problems.length + questions.length,
    }
  },
}

// ─── Dashboard Stats (Client-side rollup from local IndexedDB cache) ───────────
export const fbDashboardApi = {
  stats: async (): Promise<DashboardStats> => {
    const problems = await fbProblemsApi.list()
    const notes = await fbNotesApi.list()
    const revisionsDue = await fbRevisionsApi.dueToday()
    const revisionsOverdue = await fbRevisionsApi.overdue()
    const journals = await fbJournalApi.list()

    const solvedProblems = problems.filter(p => p.status === 'SOLVED').length

    const byDifficulty: Record<string, number> = {}
    problems.forEach(p => {
      if (p.difficulty) {
        byDifficulty[p.difficulty] = (byDifficulty[p.difficulty] || 0) + 1
      }
    })

    const byTopic: Record<string, number> = {}
    problems.forEach(p => {
      p.tags?.forEach(t => {
        const norm = t.toLowerCase().trim()
        byTopic[norm] = (byTopic[norm] || 0) + 1
      })
    })

    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0]

    const solvedToday = problems.filter(
      p => p.status === 'SOLVED' && p.updatedAt?.startsWith(today)
    ).length

    const solvedThisWeek = problems.filter(
      p => p.status === 'SOLVED' && p.updatedAt && p.updatedAt.split('T')[0] >= weekAgo
    ).length

    // Practice Streak
    const journalDates = Array.from(new Set(journals.map(j => j.date).filter(Boolean)))
      .sort()
      .reverse()

    let streak = 0
    let checkDate = new Date()
    for (const d of journalDates) {
      const dStr = checkDate.toISOString().split('T')[0]
      if (d === dStr) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return {
      totalProblems: problems.length,
      solvedProblems,
      solvedToday,
      solvedThisWeek,
      totalNotes: notes.length,
      revisionDueToday: revisionsDue.length,
      revisionOverdue: revisionsOverdue.length,
      practiceStreak: streak,
      problemsByDifficulty: byDifficulty,
      problemsByTopic: byTopic,
    }
  },
}

// ─── Browser Backup & Restore (Direct JSON Export/Import without backend) ───────
export const fbBackupApi = {
  export: async (): Promise<Blob> => {
    const [notes, problems, companies, questions, tags, revisions, journal] = await Promise.all([
      fbNotesApi.list(),
      fbProblemsApi.list(),
      fbCompaniesApi.list(true),
      fbQuestionsApi.list(),
      fbTagsApi.list(),
      fbRevisionsApi.recent(1000),
      fbJournalApi.list(),
    ])

    const projects = projectsStorage.getProjects()
    const diagrams = diagramsStorage.getDiagrams()
    let checklists: ChecklistItem[] = []
    let dailyTopics: DailyTechTopicLog[] = []
    try {
      const c = localStorage.getItem('devvault_checklist_items')
      if (c) checklists = JSON.parse(c)
    } catch {
      // ignore
    }
    try {
      const d = localStorage.getItem('devvault_user_daily_tech_topics')
      if (d) dailyTopics = JSON.parse(d)
    } catch {
      // ignore
    }

    const backupPayload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      vaultData: {
        'notes.json': notes,
        'problems.json': problems,
        'companies.json': companies,
        'interview-questions.json': questions,
        'tags.json': tags,
        'revision-records.json': revisions,
        'journal-entries.json': journal,
        'projects.json': projects,
        'diagrams.json': diagrams,
        'checklists.json': checklists,
        'daily-tech-topics.json': dailyTopics,
      },
    }

    return new Blob([JSON.stringify(backupPayload, null, 2)], {
      type: 'application/json',
    })
  },

  import: async (file: File): Promise<string> => {
    const text = await file.text()
    const parsed = JSON.parse(text)
    const vault = parsed.vaultData || parsed

    let restoredCount = 0

    if (Array.isArray(vault['notes.json'])) {
      for (const item of vault['notes.json']) {
        await fbNotesApi.create(item)
        restoredCount++
      }
    }
    if (Array.isArray(vault['problems.json'])) {
      for (const item of vault['problems.json']) {
        await fbProblemsApi.create(item)
        restoredCount++
      }
    }
    if (Array.isArray(vault['companies.json'])) {
      for (const item of vault['companies.json']) {
        await fbCompaniesApi.create(item)
        restoredCount++
      }
    }
    if (Array.isArray(vault['interview-questions.json'])) {
      for (const item of vault['interview-questions.json']) {
        await fbQuestionsApi.create(item)
        restoredCount++
      }
    }
    if (Array.isArray(vault['revision-records.json'])) {
      for (const item of vault['revision-records.json']) {
        await fbRevisionsApi.record(item)
        restoredCount++
      }
    }
    if (Array.isArray(vault['journal-entries.json'])) {
      for (const item of vault['journal-entries.json']) {
        await fbJournalApi.create(item)
        restoredCount++
      }
    }
    if (Array.isArray(vault['projects.json'])) {
      projectsStorage.saveProjects(vault['projects.json'])
      restoredCount += vault['projects.json'].length
    }
    if (Array.isArray(vault['diagrams.json'])) {
      diagramsStorage.saveDiagrams(vault['diagrams.json'])
      restoredCount += vault['diagrams.json'].length
    }
    if (Array.isArray(vault['checklists.json'])) {
      try {
        localStorage.setItem('devvault_checklist_items', JSON.stringify(vault['checklists.json']))
        restoredCount += vault['checklists.json'].length
      } catch {
        // ignore
      }
    }
    if (Array.isArray(vault['daily-tech-topics.json'])) {
      try {
        localStorage.setItem('devvault_user_daily_tech_topics', JSON.stringify(vault['daily-tech-topics.json']))
        restoredCount += vault['daily-tech-topics.json'].length
      } catch {
        // ignore
      }
    }

    return `Restore completed successfully! ${restoredCount} items imported into your private vault.`
  },
}
