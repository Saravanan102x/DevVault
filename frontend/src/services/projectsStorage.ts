import type { Project } from '../types'

const STORAGE_KEY = 'devvault_showcase_projects'

export const projectsStorage = {
  getProjects: (): Project[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Filter out any previous placeholder demo items if present
        const clean = Array.isArray(parsed)
          ? parsed.filter((p: Project) => !['proj-1', 'proj-2', 'proj-3', 'proj-4'].includes(p.id))
          : []
        return clean
      }
      return []
    } catch {
      return []
    }
  },

  saveProjects: (projects: Project[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    } catch (e) {
      console.error('Failed to save projects to localStorage', e)
    }
  },

  create: (project: Omit<Project, 'id' | 'updatedAt'>): Project => {
    const projects = projectsStorage.getProjects()
    const newProject: Project = {
      ...project,
      id: 'proj-' + Date.now(),
      updatedAt: new Date().toISOString(),
    }
    const updated = [newProject, ...projects]
    projectsStorage.saveProjects(updated)
    return newProject
  },

  update: (id: string, updates: Partial<Project>): Project | null => {
    const projects = projectsStorage.getProjects()
    const idx = projects.findIndex((p) => p.id === id)
    if (idx === -1) return null
    projects[idx] = {
      ...projects[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    projectsStorage.saveProjects(projects)
    return projects[idx]
  },

  delete: (id: string): boolean => {
    const projects = projectsStorage.getProjects()
    const filtered = projects.filter((p) => p.id !== id)
    projectsStorage.saveProjects(filtered)
    return true
  },

  toggleFeatured: (id: string): Project | null => {
    const projects = projectsStorage.getProjects()
    const proj = projects.find((p) => p.id === id)
    if (!proj) return null
    return projectsStorage.update(id, { featured: !proj.featured })
  },
}
