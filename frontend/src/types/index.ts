// Domain types mirroring Java backend models

export type NoteStatus = 'ACTIVE' | 'ARCHIVED'
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'
export type ProblemType = 'DSA' | 'JAVA_PRACTICE'
export type ProblemStatus = 'NOT_STARTED' | 'ATTEMPTED' | 'SOLVED' | 'NEEDS_REVISION'
export type SolutionStatus = 'DRAFT' | 'SAVED' | 'NEEDS_REVISION'
export type QuestionCategory = 'TECHNICAL' | 'HR' | 'SELF_INTRODUCTION' | 'DSA' | 'SYSTEM_DESIGN'
export type PreparationStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'READY' | 'NEEDS_REVISION'
export type RevisionOutcome = 'REMEMBERED' | 'PARTIALLY_REMEMBERED' | 'NOT_REMEMBERED'
export type CompanyPriority = 'HIGH' | 'MEDIUM' | 'LOW'
export type DataSource = 'VERIFIED' | 'PERSONAL' | 'UNSOURCED'

export interface GitHubReference {
  id: string
  repositoryUrl?: string
  fileUrl?: string
  commitUrl?: string
  branch?: string
  notes?: string
  relatedEntityId?: string
  relatedEntityType?: string
  createdAt: string
}

export interface Note {
  id: string
  title: string
  content?: string
  category?: string
  folder?: string
  tags: string[]
  relatedProblemIds: string[]
  relatedCompanyIds: string[]
  sourceUrls: string[]
  favourite: boolean
  pinned: boolean
  revisionDate?: string
  status: NoteStatus
  createdAt: string
  updatedAt: string
}

export interface Solution {
  id: string
  problemId: string
  title?: string
  approach?: string
  code?: string
  language: string
  explanation?: string
  timeComplexity?: string
  spaceComplexity?: string
  inputExample?: string
  outputExample?: string
  mistakes?: string
  alternativeApproaches?: string
  timeTakenMinutes?: number
  tags: string[]
  githubReferences: GitHubReference[]
  status: SolutionStatus
  practiceDate?: string
  createdAt: string
  updatedAt: string
}

export interface Problem {
  id: string
  title: string
  statement?: string
  sourceUrl?: string
  difficulty?: Difficulty
  type?: ProblemType
  status: ProblemStatus
  tags: string[]
  companyIds: string[]
  solutions: Solution[]
  keyInsight?: string
  edgeCases?: string
  personalExplanation?: string
  attemptCount: number
  needsRevision: boolean
  revisionDate?: string
  githubReferences: GitHubReference[]
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: string
  name: string
  slug: string
  website?: string
  overview?: string
  logoUrl?: string
  priority: CompanyPriority
  targetRoles: string[]
  tags: string[]
  archived: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CompanyFolder {
  id: string
  companyId: string
  parentId?: string
  name: string
  description?: string
  sortOrder: number
  archived: boolean
  createdAt: string
  updatedAt: string
}

export interface InterviewQuestion {
  id: string
  question: string
  answer?: string
  category?: QuestionCategory
  folder?: string
  companyIds: string[]
  tags: string[]
  sourceUrl?: string
  round?: string
  difficulty?: Difficulty
  preparationStatus: PreparationStatus
  needsRevision: boolean
  revisionDate?: string
  relatedNoteIds: string[]
  relatedProblemIds: string[]
  dataSource: DataSource
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: string
  name: string
  displayName: string
  color?: string
  category?: string
  createdAt: string
}

export interface RevisionRecord {
  id: string
  entityId: string
  entityType: string
  entityTitle?: string
  outcome?: RevisionOutcome
  notes?: string
  nextRevisionDate?: string
  intervalDays: number
  revisedAt: string
}

export interface JournalEntry {
  id: string
  date: string
  title?: string
  whatIStudied?: string
  whatIImplemented?: string
  challenges?: string
  toRevise?: string
  mood?: string
  tags: string[]
  relatedProblemIds: string[]
  relatedNoteIds: string[]
  productivityScore: number
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalProblems: number
  solvedProblems: number
  solvedToday: number
  solvedThisWeek: number
  totalNotes: number
  revisionDueToday: number
  revisionOverdue: number
  practiceStreak: number
  problemsByDifficulty: Record<string, number>
  problemsByTopic: Record<string, number>
}

export interface SearchResult {
  notes: Note[]
  problems: Problem[]
  questions: InterviewQuestion[]
  totalCount: number
}

export type ProjectStatus = 'COMPLETED' | 'IN_PROGRESS' | 'MAINTENANCE' | 'PROTOTYPE'

export interface Project {
  id: string
  title: string
  description: string
  tags: string[]
  githubUrl?: string
  liveUrl?: string
  status: ProjectStatus
  featured: boolean
  starsCount?: number
  updatedAt: string
}

export interface ArchitectureDiagram {
  id: string
  title: string
  topic: string
  description?: string
  fileType: 'drawio' | 'xml' | 'png' | 'svg'
  fileData: string // Base64 data URL for image or XML string
  fileName: string
  tags: string[]
  updatedAt: string
}

export type ChecklistPriority = 'HIGH' | 'MEDIUM' | 'LOW'

export interface ChecklistItem {
  id: string
  title: string
  description?: string
  dueDate?: string // YYYY-MM-DD
  priority: ChecklistPriority
  category: string
  completed: boolean
  completedAt?: string
  referenceUrl?: string
  createdAt: string
}

export interface DailyTechTopicLog {
  id: string
  date: string
  topic: string
  category: string
  prompt: string
  whatILearnt: string
  referenceUrl?: string
  createdAt: string
}

