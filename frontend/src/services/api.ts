import axios from 'axios'
import type {
  Note, Problem, Solution, Company, CompanyFolder,
  InterviewQuestion, Tag, RevisionRecord, JournalEntry,
  DashboardStats, SearchResult
} from '../types'
import { isFirebaseConfigured } from './firebase/config'
import {
  fbNotesApi,
  fbProblemsApi,
  fbCompaniesApi,
  fbQuestionsApi,
  fbTagsApi,
  fbRevisionsApi,
  fbJournalApi,
  fbSearchApi,
  fbDashboardApi,
  fbBackupApi,
} from './firebase/firestoreService'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach admin authorization token for server-side verification
api.interceptors.request.use((config) => {
  try {
    const adminToken = sessionStorage.getItem('devvault_admin_token')
    if (adminToken) {
      config.headers['Authorization'] = `Bearer ${adminToken}`
      config.headers['X-Admin-Key'] = adminToken
    }
  } catch {
    // ignore storage access issues
  }
  return config
})

function shouldUseFirestore(): boolean {
  const isEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'
  return isFirebaseConfigured || isEmulator
}

// ─── Notes ───────────────────────────────────────────────────────────────────
export const notesApi = {
  list: (params?: { folder?: string; tag?: string; q?: string; favourites?: boolean; pinned?: boolean }) =>
    shouldUseFirestore()
      ? fbNotesApi.list(params)
      : api.get<Note[]>('/notes', { params }).then(r => r.data),
  get: (id: string) =>
    shouldUseFirestore()
      ? fbNotesApi.get(id)
      : api.get<Note>(`/notes/${id}`).then(r => r.data),
  create: (note: Partial<Note>) =>
    shouldUseFirestore()
      ? fbNotesApi.create(note)
      : api.post<Note>('/notes', note).then(r => r.data),
  update: (id: string, note: Partial<Note>) =>
    shouldUseFirestore()
      ? fbNotesApi.update(id, note)
      : api.put<Note>(`/notes/${id}`, note).then(r => r.data),
  delete: (id: string) =>
    shouldUseFirestore()
      ? fbNotesApi.delete(id)
      : api.delete(`/notes/${id}`).then(() => {}),
  toggleFavourite: (id: string) =>
    shouldUseFirestore()
      ? fbNotesApi.toggleFavourite(id)
      : api.post<Note>(`/notes/${id}/favourite`).then(r => r.data),
  togglePin: (id: string) =>
    shouldUseFirestore()
      ? fbNotesApi.togglePin(id)
      : api.post<Note>(`/notes/${id}/pin`).then(r => r.data),
  folders: () =>
    shouldUseFirestore()
      ? fbNotesApi.folders()
      : api.get<string[]>('/notes/folders').then(r => r.data),
}

// ─── Problems ─────────────────────────────────────────────────────────────────
export const problemsApi = {
  list: (params?: { type?: string; difficulty?: string; status?: string; tag?: string; companyId?: string; q?: string }) =>
    shouldUseFirestore()
      ? fbProblemsApi.list(params)
      : api.get<Problem[]>('/problems', { params }).then(r => r.data),
  get: (id: string) =>
    shouldUseFirestore()
      ? fbProblemsApi.get(id)
      : api.get<Problem>(`/problems/${id}`).then(r => r.data),
  create: (problem: Partial<Problem>) =>
    shouldUseFirestore()
      ? fbProblemsApi.create(problem)
      : api.post<Problem>('/problems', problem).then(r => r.data),
  update: (id: string, problem: Partial<Problem>) =>
    shouldUseFirestore()
      ? fbProblemsApi.update(id, problem)
      : api.put<Problem>(`/problems/${id}`, problem).then(r => r.data),
  delete: (id: string) =>
    shouldUseFirestore()
      ? fbProblemsApi.delete(id)
      : api.delete(`/problems/${id}`).then(() => {}),
  addSolution: (problemId: string, solution: Partial<Solution>) =>
    shouldUseFirestore()
      ? fbProblemsApi.addSolution(problemId, solution)
      : api.post<Problem>(`/problems/${problemId}/solutions`, solution).then(r => r.data),
  updateSolution: (problemId: string, solutionId: string, solution: Partial<Solution>) =>
    shouldUseFirestore()
      ? fbProblemsApi.updateSolution(problemId, solutionId, solution)
      : api.put<Problem>(`/problems/${problemId}/solutions/${solutionId}`, solution).then(r => r.data),
  deleteSolution: (problemId: string, solutionId: string) =>
    shouldUseFirestore()
      ? fbProblemsApi.deleteSolution(problemId, solutionId)
      : api.delete<Problem>(`/problems/${problemId}/solutions/${solutionId}`).then(r => r.data),
  tags: () =>
    shouldUseFirestore()
      ? fbProblemsApi.tags()
      : api.get<string[]>('/problems/tags').then(r => r.data),
}

// ─── Companies ────────────────────────────────────────────────────────────────
export const companiesApi = {
  list: (includeArchived = false) =>
    shouldUseFirestore()
      ? fbCompaniesApi.list(includeArchived)
      : api.get<Company[]>('/companies', { params: { includeArchived } }).then(r => r.data),
  get: (id: string) =>
    shouldUseFirestore()
      ? fbCompaniesApi.get(id)
      : api.get<Company>(`/companies/${id}`).then(r => r.data),
  create: (company: Partial<Company>) =>
    shouldUseFirestore()
      ? fbCompaniesApi.create(company)
      : api.post<Company>('/companies', company).then(r => r.data),
  update: (id: string, company: Partial<Company>) =>
    shouldUseFirestore()
      ? fbCompaniesApi.update(id, company)
      : api.put<Company>(`/companies/${id}`, company).then(r => r.data),
  delete: (id: string) =>
    shouldUseFirestore()
      ? fbCompaniesApi.delete(id)
      : api.delete(`/companies/${id}`).then(() => {}),
  getFolders: (id: string) =>
    shouldUseFirestore()
      ? fbCompaniesApi.getFolders(id)
      : api.get<CompanyFolder[]>(`/companies/${id}/folders`).then(r => r.data),
  createFolder: (id: string, folder: Partial<CompanyFolder>) =>
    shouldUseFirestore()
      ? fbCompaniesApi.createFolder(id, folder)
      : api.post<CompanyFolder>(`/companies/${id}/folders`, folder).then(r => r.data),
  updateFolder: (companyId: string, folderId: string, folder: Partial<CompanyFolder>) =>
    shouldUseFirestore()
      ? fbCompaniesApi.updateFolder(companyId, folderId, folder)
      : api.put<CompanyFolder>(`/companies/${companyId}/folders/${folderId}`, folder).then(r => r.data),
  deleteFolder: (companyId: string, folderId: string) =>
    shouldUseFirestore()
      ? fbCompaniesApi.deleteFolder(companyId, folderId)
      : api.delete(`/companies/${companyId}/folders/${folderId}`).then(() => {}),
}

// ─── Interview Questions ──────────────────────────────────────────────────────
export const questionsApi = {
  list: (params?: { category?: string; folder?: string; companyId?: string; q?: string }) =>
    shouldUseFirestore()
      ? fbQuestionsApi.list(params)
      : api.get<InterviewQuestion[]>('/interview-questions', { params }).then(r => r.data),
  get: (id: string) =>
    shouldUseFirestore()
      ? fbQuestionsApi.get(id)
      : api.get<InterviewQuestion>(`/interview-questions/${id}`).then(r => r.data),
  create: (q: Partial<InterviewQuestion>) =>
    shouldUseFirestore()
      ? fbQuestionsApi.create(q)
      : api.post<InterviewQuestion>('/interview-questions', q).then(r => r.data),
  update: (id: string, q: Partial<InterviewQuestion>) =>
    shouldUseFirestore()
      ? fbQuestionsApi.update(id, q)
      : api.put<InterviewQuestion>(`/interview-questions/${id}`, q).then(r => r.data),
  delete: (id: string) =>
    shouldUseFirestore()
      ? fbQuestionsApi.delete(id)
      : api.delete(`/interview-questions/${id}`).then(() => {}),
  folders: () =>
    shouldUseFirestore()
      ? fbQuestionsApi.folders()
      : api.get<string[]>('/interview-questions/folders').then(r => r.data),
}

// ─── Tags ─────────────────────────────────────────────────────────────────────
export const tagsApi = {
  list: () =>
    shouldUseFirestore()
      ? fbTagsApi.list()
      : api.get<Tag[]>('/tags').then(r => r.data),
  findOrCreate: (name: string) =>
    shouldUseFirestore()
      ? fbTagsApi.findOrCreate(name)
      : api.post<Tag>('/tags', { name }).then(r => r.data),
  delete: (id: string) =>
    shouldUseFirestore()
      ? fbTagsApi.delete(id)
      : api.delete(`/tags/${id}`).then(() => {}),
}

// ─── Revisions ────────────────────────────────────────────────────────────────
export const revisionsApi = {
  record: (revision: Partial<RevisionRecord>) =>
    shouldUseFirestore()
      ? fbRevisionsApi.record(revision)
      : api.post<RevisionRecord>('/revisions', revision).then(r => r.data),
  byEntity: (entityId: string) =>
    shouldUseFirestore()
      ? fbRevisionsApi.byEntity(entityId)
      : api.get<RevisionRecord[]>(`/revisions/entity/${entityId}`).then(r => r.data),
  dueToday: () =>
    shouldUseFirestore()
      ? fbRevisionsApi.dueToday()
      : api.get<RevisionRecord[]>('/revisions/due-today').then(r => r.data),
  overdue: () =>
    shouldUseFirestore()
      ? fbRevisionsApi.overdue()
      : api.get<RevisionRecord[]>('/revisions/overdue').then(r => r.data),
  upcoming: (days = 7) =>
    shouldUseFirestore()
      ? fbRevisionsApi.upcoming(days)
      : api.get<RevisionRecord[]>('/revisions/upcoming', { params: { days } }).then(r => r.data),
  recent: (limit = 10) =>
    shouldUseFirestore()
      ? fbRevisionsApi.recent(limit)
      : api.get<RevisionRecord[]>('/revisions/recent', { params: { limit } }).then(r => r.data),
  delete: (id: string) =>
    shouldUseFirestore()
      ? fbRevisionsApi.delete(id)
      : api.delete(`/revisions/${id}`).then(() => {}),
}

// ─── Journal ──────────────────────────────────────────────────────────────────
export const journalApi = {
  list: (params?: { from?: string; to?: string; recent?: number }) =>
    shouldUseFirestore()
      ? fbJournalApi.list(params)
      : api.get<JournalEntry[]>('/journal', { params }).then(r => r.data),
  today: () =>
    shouldUseFirestore()
      ? fbJournalApi.today()
      : api.get<JournalEntry>('/journal/today').then(r => r.data),
  get: (id: string) =>
    shouldUseFirestore()
      ? fbJournalApi.get(id)
      : api.get<JournalEntry>(`/journal/${id}`).then(r => r.data),
  create: (entry: Partial<JournalEntry>) =>
    shouldUseFirestore()
      ? fbJournalApi.create(entry)
      : api.post<JournalEntry>('/journal', entry).then(r => r.data),
  update: (id: string, entry: Partial<JournalEntry>) =>
    shouldUseFirestore()
      ? fbJournalApi.update(id, entry)
      : api.put<JournalEntry>(`/journal/${id}`, entry).then(r => r.data),
  delete: (id: string) =>
    shouldUseFirestore()
      ? fbJournalApi.delete(id)
      : api.delete(`/journal/${id}`).then(() => {}),
}

// ─── Search ───────────────────────────────────────────────────────────────────
export const searchApi = {
  search: (q: string, types?: string[]) =>
    shouldUseFirestore()
      ? fbSearchApi.search(q, types)
      : api.get<SearchResult>('/search', { params: { q, types } }).then(r => r.data),
}

// ─── Dashboard & Backup ───────────────────────────────────────────────────────
export const dashboardApi = {
  stats: () =>
    shouldUseFirestore()
      ? fbDashboardApi.stats()
      : api.get<DashboardStats>('/dashboard/stats').then(r => r.data),
}

export const backupApi = {
  export: () =>
    shouldUseFirestore()
      ? fbBackupApi.export()
      : api.post('/backup/export', null, { responseType: 'blob' }).then(r => r.data),
  import: (file: File) => {
    if (shouldUseFirestore()) {
      return fbBackupApi.import(file)
    }
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/backup/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data)
  },
}
