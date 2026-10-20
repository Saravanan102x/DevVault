import type { ArchitectureDiagram } from '../types'

const STORAGE_KEY = 'devvault_architecture_diagrams'

export const diagramsStorage = {
  getDiagrams: (): ArchitectureDiagram[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) ? parsed : []
      }
      return []
    } catch {
      return []
    }
  },

  saveDiagrams: (diagrams: ArchitectureDiagram[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(diagrams))
    } catch (e) {
      console.error('Failed to save diagrams to localStorage', e)
    }
  },

  create: (diagram: Omit<ArchitectureDiagram, 'id' | 'updatedAt'>): ArchitectureDiagram => {
    const diagrams = diagramsStorage.getDiagrams()
    const newDiagram: ArchitectureDiagram = {
      ...diagram,
      id: 'diag-' + Date.now(),
      updatedAt: new Date().toISOString(),
    }
    const updated = [newDiagram, ...diagrams]
    diagramsStorage.saveDiagrams(updated)
    return newDiagram
  },

  delete: (id: string): boolean => {
    const diagrams = diagramsStorage.getDiagrams()
    const filtered = diagrams.filter((d) => d.id !== id)
    diagramsStorage.saveDiagrams(filtered)
    return true
  },
}
