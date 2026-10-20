import React, { useState, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Star,
  Pin,
  Trash2,
  Edit3,
  BookOpen,
  Plus,
  Clock,
  ExternalLink,
  Maximize2,
  Minimize2,
  ArrowUpDown,
  X,
  Loader2,
  Code,
  List,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Heading2,
  Heading3,
  Quote,
  CheckSquare,
  Link as LinkIcon,
  Video,
  FolderPlus,
  Sparkles,
  ArrowLeft,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { notesApi } from '../services/api'
import type { Note } from '../types'
import { Modal } from '../components/common/Modal'
import { MarkdownViewer } from '../components/common/MarkdownViewer'
import { useAccess } from '../context/AccessContext'

const CUSTOM_FOLDERS_KEY = 'devvault_custom_note_folders'
const DELETED_FOLDERS_KEY = 'devvault_deleted_note_folders'

export const NotesPage: React.FC = () => {
  const { isAdmin } = useAccess()
  const queryClient = useQueryClient()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Filter & Navigation State
  const [selectedFolder, setSelectedFolder] = useState<string>('ALL')
  const [selectedTag, setSelectedTag] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterFavourites, setFilterFavourites] = useState(false)
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [sortBy, setSortBy] = useState<'updated' | 'title'>('updated')
  const [isDistractionFree, setIsDistractionFree] = useState(false)

  // Drag and Drop & Folder Creation State
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null)
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null)
  const [isAddingFolder, setIsAddingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [customFolders, setCustomFolders] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_FOLDERS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [deletedFolders, setDeletedFolders] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(DELETED_FOLDERS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [mobileNoteDetailOpen, setMobileNoteDetailOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formFolder, setFormFolder] = useState('Core Java')
  const [isCreatingFolderInModal, setIsCreatingFolderInModal] = useState(false)
  const [customModalFolder, setCustomModalFolder] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formTags, setFormTags] = useState('')
  const [formSourceUrls, setFormSourceUrls] = useState<string[]>([])
  const [newRefInput, setNewRefInput] = useState('')
  const [previewTab, setPreviewTab] = useState<'write' | 'preview'>('write')

  // Quick Add Ref in reader view
  const [isAddingRefToActive, setIsAddingRefToActive] = useState(false)
  const [activeRefInput, setActiveRefInput] = useState('')

  // Queries
  const { data: rawNotes, isLoading } = useQuery({
    queryKey: ['notes', selectedFolder, searchQuery, filterFavourites],
    queryFn: () =>
      notesApi.list({
        folder: selectedFolder === 'ALL' ? undefined : selectedFolder,
        q: searchQuery || undefined,
        favourites: filterFavourites ? true : undefined,
      }),
  })

  const { data: folders } = useQuery({
    queryKey: ['notes-folders'],
    queryFn: notesApi.folders,
  })

  // Save custom folders to localStorage
  const saveCustomFolders = (newList: string[]) => {
    setCustomFolders(newList)
    try {
      localStorage.setItem(CUSTOM_FOLDERS_KEY, JSON.stringify(newList))
    } catch {
      // ignore
    }
  }

  // Save deleted folders to localStorage
  const saveDeletedFolders = (newList: string[]) => {
    setDeletedFolders(newList)
    try {
      localStorage.setItem(DELETED_FOLDERS_KEY, JSON.stringify(newList))
    } catch {
      // ignore
    }
  }

  // Combined Unique Folders (excluding deleted ones)
  const allFolders = useMemo(() => {
    const set = new Set<string>(['Core Java', 'JVM Internals', 'Spring Boot', 'System Design', 'Concurrency'])
    ;(folders || []).forEach((f) => set.add(f))
    customFolders.forEach((f) => set.add(f))
    ;(rawNotes || []).forEach((n) => {
      if (n.folder) set.add(n.folder)
    })
    const deletedSet = new Set(deletedFolders)
    return Array.from(set).filter((f) => !deletedSet.has(f)).sort()
  }, [folders, customFolders, rawNotes, deletedFolders])

  // Extract all unique tags
  const allTags = useMemo(() => {
    if (!rawNotes) return []
    const tagSet = new Set<string>()
    rawNotes.forEach((n) => {
      n.tags?.forEach((t) => tagSet.add(t))
    })
    return Array.from(tagSet).sort()
  }, [rawNotes])

  // Filter and sort notes
  const notes = useMemo(() => {
    if (!rawNotes) return []
    let list = [...rawNotes]
    if (selectedTag !== 'ALL') {
      list = list.filter((n) => n.tags?.includes(selectedTag))
    }
    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime()
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime()
      return timeB - timeA
    })
    return list
  }, [rawNotes, selectedTag, sortBy])

  // Select first note automatically if none selected
  React.useEffect(() => {
    if (notes.length > 0 && !activeNote) {
      setActiveNote(notes[0])
    } else if (activeNote && !notes.some((n) => n.id === activeNote.id)) {
      setActiveNote(notes[0] || null)
    }
  }, [notes, activeNote])

  // Mutations
  const createMutation = useMutation({
    mutationFn: (note: Partial<Note>) => notesApi.create(note),
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['notes-folders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Note saved successfully!')
      setActiveNote(newNote)
      setMobileNoteDetailOpen(true)
      setIsModalOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: Partial<Note> }) => notesApi.update(id, note),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['notes-folders'] })
      toast.success('Note updated!')
      setActiveNote(updated)
      setIsModalOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Note deleted')
      setActiveNote(null)
    },
  })

  const toggleFavMutation = useMutation({
    mutationFn: (id: string) => notesApi.toggleFavourite(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      if (activeNote?.id === updated.id) setActiveNote(updated)
    },
  })

  const togglePinMutation = useMutation({
    mutationFn: (id: string) => notesApi.togglePin(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      if (activeNote?.id === updated.id) setActiveNote(updated)
    },
  })

  // Move note to folder (via drag and drop or dropdown)
  const handleMoveNote = (noteId: string, targetFolder: string) => {
    const note = rawNotes?.find((n) => n.id === noteId)
    if (!note || note.folder === targetFolder) return
    updateMutation.mutate({
      id: noteId,
      note: { ...note, folder: targetFolder },
    })
    toast.success(`Moved "${note.title}" to "${targetFolder}"! 📁`)
  }

  // Create new folder in sidebar
  const handleCreateNewFolder = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newFolderName.trim()
    if (!trimmed) {
      toast.error('Folder name cannot be empty')
      return
    }
    if (allFolders.includes(trimmed)) {
      toast.error('Folder already exists')
      return
    }
    // If it was previously deleted, remove from deletedFolders
    if (deletedFolders.includes(trimmed)) {
      saveDeletedFolders(deletedFolders.filter((f) => f !== trimmed))
    }
    saveCustomFolders([...customFolders, trimmed])
    setSelectedFolder(trimmed)
    setNewFolderName('')
    setIsAddingFolder(false)
    toast.success(`Folder "${trimmed}" created!`)
  }

  // Delete a folder
  const handleDeleteFolder = async (folderToDelete: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const affectedNotes = (rawNotes || []).filter((n) => n.folder === folderToDelete)
    const count = affectedNotes.length
    const confirmMsg =
      count > 0
        ? `Are you sure you want to delete folder "${folderToDelete}"?\n\n${count} note(s) in this folder will be moved to 'All Notes'.`
        : `Are you sure you want to delete folder "${folderToDelete}"?`

    if (!window.confirm(confirmMsg)) return

    try {
      // Reassign affected notes to 'General' so they aren't orphaned
      for (const note of affectedNotes) {
        await notesApi.update(note.id, { ...note, folder: 'General' })
      }
    } catch {
      // continue
    }

    // Remove from custom folders
    if (customFolders.includes(folderToDelete)) {
      saveCustomFolders(customFolders.filter((f) => f !== folderToDelete))
    }
    // Track in deleted folders so hardcoded defaults stay deleted
    if (!deletedFolders.includes(folderToDelete)) {
      saveDeletedFolders([...deletedFolders, folderToDelete])
    }

    // Reset selection if viewing that folder
    if (selectedFolder === folderToDelete) {
      setSelectedFolder('ALL')
    }

    queryClient.invalidateQueries({ queryKey: ['notes'] })
    queryClient.invalidateQueries({ queryKey: ['notes-folders'] })
    toast.success(`Folder "${folderToDelete}" deleted`)
  }

  // Remove a reference link from active note
  const handleRemoveReferenceFromActive = async (urlToRemove: string) => {
    if (!activeNote) return
    const updatedUrls = (activeNote.sourceUrls || []).filter((u) => u !== urlToRemove)
    try {
      const updated = await notesApi.update(activeNote.id, {
        ...activeNote,
        sourceUrls: updatedUrls,
      })
      setActiveNote(updated)
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success('Reference link removed')
    } catch {
      toast.error('Failed to remove reference link')
    }
  }

  // Open Create Note modal
  const handleOpenCreate = () => {
    setFormTitle('')
    setFormFolder(selectedFolder !== 'ALL' ? selectedFolder : 'Core Java')
    setIsCreatingFolderInModal(false)
    setCustomModalFolder('')
    setFormContent(
      '## Overview\n\nExplain key architectural or language concept here.\n\n### JVM Internals / Memory Details\n\n```java\n// Code snippet\npublic class Solution {\n    // Implementation details\n}\n```\n\n### Key Takeaways\n- Point 1\n- Point 2'
    )
    setFormTags('java, jvm')
    setFormSourceUrls([])
    setNewRefInput('')
    setIsEditing(false)
    setIsModalOpen(true)
  }

  // Open Edit Note modal
  const handleOpenEdit = (note: Note) => {
    setFormTitle(note.title)
    setFormFolder(note.folder || 'Core Java')
    setIsCreatingFolderInModal(false)
    setCustomModalFolder('')
    setFormContent(note.content || '')
    setFormTags((note.tags || []).join(', '))
    setFormSourceUrls(note.sourceUrls || [])
    setNewRefInput('')
    setIsEditing(true)
    setIsModalOpen(true)
  }

  // Save note submit
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      toast.error('Title is required')
      return
    }

    const folderName = isCreatingFolderInModal
      ? customModalFolder.trim() || 'Core Java'
      : formFolder.trim() || 'Core Java'

    if (isCreatingFolderInModal && customModalFolder.trim()) {
      const trimmedModalFolder = customModalFolder.trim()
      if (deletedFolders.includes(trimmedModalFolder)) {
        saveDeletedFolders(deletedFolders.filter((f) => f !== trimmedModalFolder))
      }
      if (!allFolders.includes(trimmedModalFolder)) {
        saveCustomFolders([...customFolders, trimmedModalFolder])
      }
    }

    const payload: Partial<Note> = {
      title: formTitle.trim(),
      folder: folderName,
      content: formContent,
      tags: formTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      sourceUrls: formSourceUrls.filter(Boolean),
    }

    if (isEditing && activeNote) {
      updateMutation.mutate({ id: activeNote.id, note: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  // Helper to insert formatting into textarea
  const insertFormatting = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = formContent.substring(start, end)
    const replacement = selected ? `${before}${selected}${after}` : `${before}${placeholder}${after}`
    const newContent = formContent.substring(0, start) + replacement + formContent.substring(end)
    setFormContent(newContent)
    setTimeout(() => {
      textarea.focus()
      const newPos = start + before.length + (selected ? selected.length : placeholder.length)
      textarea.setSelectionRange(newPos, newPos)
    }, 10)
  }

  // Keyboard shortcut listener for textarea
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+B: Bold
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault()
      insertFormatting('**', '**', 'bold text')
      return
    }
    // Ctrl+K: Code snippet
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      insertFormatting('```java\n', '\n```', '// Code snippet\n')
      return
    }
    // Ctrl+L or Ctrl+Shift+8: Bullet list
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'l' || (e.shiftKey && e.key === '8'))) {
      e.preventDefault()
      insertFormatting('- ', '', 'bullet point')
      return
    }
    // Auto-continue bullet on Enter
    if (e.key === 'Enter') {
      const textarea = textareaRef.current
      if (!textarea) return
      const cursorPos = textarea.selectionStart
      const lineStart = formContent.lastIndexOf('\n', cursorPos - 1) + 1
      const currentLine = formContent.substring(lineStart, cursorPos)

      if (currentLine.startsWith('- ')) {
        if (currentLine.trim() === '-') {
          // Empty bullet: remove it and exit list
          e.preventDefault()
          const newContent = formContent.substring(0, lineStart) + formContent.substring(cursorPos)
          setFormContent(newContent)
          setTimeout(() => {
            textarea.setSelectionRange(lineStart, lineStart)
          }, 10)
          return
        }
        // Auto-continue bullet
        e.preventDefault()
        const newContent = formContent.substring(0, cursorPos) + '\n- ' + formContent.substring(cursorPos)
        setFormContent(newContent)
        setTimeout(() => {
          textarea.setSelectionRange(cursorPos + 3, cursorPos + 3)
        }, 10)
        return
      }
    }
    // Tab indent
    if (e.key === 'Tab') {
      e.preventDefault()
      insertFormatting('  ', '', '')
    }
  }

  // Reference management inside form
  const handleAddRefToForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = newRefInput.trim()
    if (!trimmed) return
    if (!formSourceUrls.includes(trimmed)) {
      setFormSourceUrls([...formSourceUrls, trimmed])
      setNewRefInput('')
    }
  }

  const handleRemoveRefFromForm = (url: string) => {
    setFormSourceUrls(formSourceUrls.filter((u) => u !== url))
  }

  // Quick add reference in reader view
  const handleQuickAddRef = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeNote || !activeRefInput.trim()) return
    const updatedUrls = [...(activeNote.sourceUrls || []), activeRefInput.trim()]
    updateMutation.mutate({
      id: activeNote.id,
      note: { ...activeNote, sourceUrls: updatedUrls },
    })
    setActiveRefInput('')
    setIsAddingRefToActive(false)
  }

  // YouTube URL parser with strict ID validation
  const getYouTubeId = (url: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
      const match = url.match(regExp)
      if (match && /^[a-zA-Z0-9_-]{11}$/.test(match[2])) {
        return match[2]
      }
    } catch {
      // ignore
    }
    return null
  }

  const isSafeUrl = (url?: string): boolean => {
    if (!url) return false
    return /^https?:\/\//i.test(url.trim())
  }

  // Estimated read time
  const readingTime = useMemo(() => {
    if (!activeNote?.content) return '1 min read'
    const words = activeNote.content.split(/\s+/).length
    const mins = Math.max(1, Math.round(words / 200))
    return `${mins} min read`
  }, [activeNote])

  return (
    <div className="space-y-5 pb-8">
      {/* Top Header */}
      <div className="border-b border-[#E9EAF0] dark:border-[#262838] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#20212A] dark:text-[#F1F2F6] tracking-tight">
            My Library & Technical Notes
          </h1>
          <p className="text-xs text-[#777B8A] dark:text-[#9497A8] mt-0.5 font-medium">
            Personal repository of JVM internals, architecture blueprints, system designs, and reference tutorials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDistractionFree(!isDistractionFree)}
            className="btn-secondary text-xs px-2.5 py-1.5 cursor-pointer font-medium"
            title={isDistractionFree ? 'Show navigation rails' : 'Distraction-free reading'}
          >
            {isDistractionFree ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Show Rails</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Focus Mode</span>
              </>
            )}
          </button>
          {isAdmin && (
            <button onClick={handleOpenCreate} className="btn-primary text-xs cursor-pointer font-bold shadow-xs">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Write Note</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex gap-5 items-start">
        {/* Left Column: Folder & Filter Rail (Hidden in Distraction-Free Mode) */}
        {!isDistractionFree && (
          <div className="w-56 shrink-0 space-y-4 hidden md:block">
            {/* Folders List with Create Folder & Drag-Drop */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 mb-1.5">
                <span className="text-[11px] font-mono font-bold text-[#777B8A] dark:text-[#9497A8] uppercase tracking-wider">
                  Folders
                </span>
                {isAdmin && (
                  <button
                    onClick={() => setIsAddingFolder(true)}
                    className="text-[11px] text-[#6C5CE7] dark:text-[#8C7CFF] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                    title="Create new folder"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>+ Folder</span>
                  </button>
                )}
              </div>

              {/* Inline Create Folder Form */}
              {isAddingFolder && (
                <form onSubmit={handleCreateNewFolder} className="p-2 bg-[#F8F9FC] dark:bg-[#1A1C28] rounded-lg border border-[#6C5CE7]/30 space-y-1.5 animate-fade-in">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name..."
                    className="dev-input w-full px-2 py-1 text-xs font-semibold"
                    autoFocus
                  />
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingFolder(false)}
                      className="text-[10px] px-2 py-0.5 rounded text-[#777B8A] hover:text-[#20212A] dark:hover:text-[#F1F2F6] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="text-[10px] px-2.5 py-0.5 rounded bg-[#6C5CE7] text-white font-bold cursor-pointer shadow-2xs"
                    >
                      Add
                    </button>
                  </div>
                </form>
              )}

              {/* All Notes Button */}
              <button
                onClick={() => setSelectedFolder('ALL')}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                  selectedFolder === 'ALL'
                    ? 'bg-[#F0EDFF] dark:bg-[#6C5CE7]/20 text-[#6C5CE7] dark:text-[#8C7CFF]'
                    : 'text-[#4A4E5E] dark:text-[#B5B9CC] hover:text-[#20212A] dark:hover:text-[#F1F2F6] hover:bg-[#F5F6FA] dark:hover:bg-[#1C1E2A]'
                }`}
              >
                <span>All Notes</span>
                <span className="text-[10px] font-mono text-[#777B8A] dark:text-[#9497A8]">{rawNotes?.length || 0}</span>
              </button>

              {/* Folders List with Drag-Drop and Delete Support */}
              {allFolders.map((folder) => {
                const count = rawNotes?.filter((n) => n.folder === folder).length || 0
                const isDragTarget = dragOverFolder === folder
                const isSelected = selectedFolder === folder

                return (
                  <div
                    key={folder}
                    onClick={() => setSelectedFolder(folder)}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragOverFolder(folder)
                    }}
                    onDragLeave={() => setDragOverFolder(null)}
                    onDrop={(e) => {
                      e.preventDefault()
                      const droppedId = e.dataTransfer.getData('text/plain') || draggingNoteId
                      if (droppedId) {
                        handleMoveNote(droppedId, folder)
                      }
                      setDragOverFolder(null)
                    }}
                    className={`group w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      isDragTarget
                        ? 'ring-2 ring-[#6C5CE7] bg-[#F0EDFF] dark:bg-[#6C5CE7]/30 scale-[1.02] shadow-sm'
                        : isSelected
                        ? 'bg-[#F0EDFF] dark:bg-[#6C5CE7]/20 text-[#6C5CE7] dark:text-[#8C7CFF]'
                        : 'text-[#4A4E5E] dark:text-[#B5B9CC] hover:text-[#20212A] dark:hover:text-[#F1F2F6] hover:bg-[#F5F6FA] dark:hover:bg-[#1C1E2A]'
                    }`}
                    title={`Click to view, or drop note here to move into ${folder}`}
                  >
                    <span className="truncate flex-1 mr-1">{folder}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {count > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#E9EAF0] dark:bg-[#262838] text-[#777B8A] dark:text-[#9497A8]">
                          {count}
                        </span>
                      )}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteFolder(folder, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/15 text-gray-400 hover:text-rose-500 transition-all cursor-pointer"
                          title={`Delete folder "${folder}"`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Quick Starred Filter */}
            <div className="pt-2 border-t border-[#E9EAF0] dark:border-[#262838]">
              <button
                onClick={() => setFilterFavourites(!filterFavourites)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  filterFavourites
                    ? 'bg-[#F9F4EB] dark:bg-[#2B271E] text-[#8C6422] dark:text-[#D9B575]'
                    : 'text-[#4A4E5E] dark:text-[#B5B9CC] hover:text-[#20212A] dark:hover:text-[#F1F2F6] hover:bg-[#F5F6FA] dark:hover:bg-[#1C1E2A]'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${filterFavourites ? 'fill-[#8C6422] text-[#8C6422]' : ''}`} />
                <span>Starred Notes</span>
              </button>
            </div>

            {/* Tags Navigation */}
            {allTags.length > 0 && (
              <div className="pt-2 border-t border-[#E9EAF0] dark:border-[#262838] space-y-1">
                <div className="text-[11px] font-mono font-bold text-[#777B8A] dark:text-[#9497A8] uppercase tracking-wider px-2 mb-1">
                  Tags
                </div>
                <div className="flex flex-wrap gap-1 px-1">
                  <button
                    onClick={() => setSelectedTag('ALL')}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold cursor-pointer transition-colors ${
                      selectedTag === 'ALL'
                        ? 'bg-[#6C5CE7] text-white shadow-2xs'
                        : 'bg-[#F0EDFF] dark:bg-[#1E202E] text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A]'
                    }`}
                  >
                    all
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? 'ALL' : tag)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold cursor-pointer transition-colors ${
                        selectedTag === tag
                          ? 'bg-[#6C5CE7] text-white shadow-2xs'
                          : 'bg-[#F0EDFF] dark:bg-[#1E202E] text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A]'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Center: Note Cards List with Drag Support */}
        {!isDistractionFree && (
          <div className={`${mobileNoteDetailOpen ? 'hidden md:flex' : 'flex'} w-full md:w-76 shrink-0 dev-card p-3 flex-col space-y-2 h-[calc(100vh-14rem)]`}>
            {/* Search & Sort */}
            <div className="space-y-1.5 pb-2 border-b border-[#E9EAF0] dark:border-[#262838]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#777B8A] dark:text-[#9497A8] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter notes..."
                  className="dev-input w-full pl-8 pr-7 py-1.5 text-xs font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 p-0.5 rounded text-[#777B8A] hover:text-[#20212A] dark:hover:text-[#F1F2F6] cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#777B8A] dark:text-[#9497A8] px-1 font-medium">
                <span>{notes.length} note(s)</span>
                <button
                  onClick={() => setSortBy(sortBy === 'updated' ? 'title' : 'updated')}
                  className="flex items-center gap-1 hover:text-[#20212A] dark:hover:text-[#F1F2F6] cursor-pointer font-semibold"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span>{sortBy === 'updated' ? 'Recent' : 'Title'}</span>
                </button>
              </div>
            </div>

            {/* Note Rows (Draggable to Folders) */}
            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
              {isLoading ? (
                <div className="py-8 text-center text-xs text-[#777B8A] dark:text-[#9497A8]">Loading notes...</div>
              ) : notes.length > 0 ? (
                notes.map((note) => {
                  const isSelected = activeNote?.id === note.id
                  const isDragging = draggingNoteId === note.id

                  return (
                    <div
                      key={note.id}
                      draggable={isAdmin}
                      onDragStart={(e) => {
                        if (!isAdmin) return
                        e.dataTransfer.setData('text/plain', note.id)
                        setDraggingNoteId(note.id)
                      }}
                      onDragEnd={() => setDraggingNoteId(null)}
                      onClick={() => {
                        setActiveNote(note)
                        setMobileNoteDetailOpen(true)
                      }}
                      className={`group p-3 rounded-xl border transition-all ${isAdmin ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} text-xs ${
                        isDragging ? 'opacity-40 scale-95 border-dashed border-[#6C5CE7]' : ''
                      } ${
                        isSelected
                          ? 'bg-[#F0EDFF] dark:bg-[#6C5CE7]/20 border-[#6C5CE7]/40 dark:border-[#8C7CFF]/40 text-[#20212A] dark:text-[#F1F2F6] shadow-2xs'
                          : 'border-transparent hover:bg-[#F8F9FC] dark:hover:bg-[#1A1C28] text-[#20212A] dark:text-[#F1F2F6]'
                      }`}
                      title={isAdmin ? "Click to view or drag to drop on any folder on the left" : "Click to view note"}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold truncate block text-sm flex-1">
                          {note.pinned && <Pin className="w-3 h-3 text-[#6C5CE7] dark:text-[#8C7CFF] inline mr-1 rotate-45" />}
                          {note.title}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {note.favourite && (
                            <Star className="w-3.5 h-3.5 fill-[#8C6422] text-[#8C6422] dark:fill-[#E5BE76] dark:text-[#E5BE76]" />
                          )}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm(`Delete technical note "${note.title}"?`)) {
                                  deleteMutation.mutate(note.id)
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/15 text-gray-400 hover:text-rose-500 transition-all cursor-pointer"
                              title="Delete note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-[#777B8A] dark:text-[#9497A8] mt-1 line-clamp-2 leading-relaxed">
                        {note.content?.replace(/^[#\s]+/, '').slice(0, 90) || 'Empty note'}
                      </p>

                      <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono font-semibold">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                          {note.folder || 'Core'}
                        </span>
                        {note.sourceUrls && note.sourceUrls.length > 0 && (
                          <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400">
                            <Video className="w-3 h-3" />
                            <span>{note.sourceUrls.length} ref</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="py-12 text-center text-xs text-[#777B8A] dark:text-[#9497A8]">
                  No matching notes.
                  {isAdmin && (
                    <button onClick={handleOpenCreate} className="text-[#6C5CE7] dark:text-[#8C7CFF] underline block mt-1 mx-auto cursor-pointer font-bold">
                      Create one
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Pane: Editorial Document Reader */}
        <div className={`${!mobileNoteDetailOpen ? 'hidden md:flex' : 'flex'} flex-1 dev-card p-4 sm:p-6 md:p-8 min-h-[calc(100vh-14rem)] flex-col shadow-sm w-full min-w-0`}>
          {/* Mobile Back Button */}
          <div className="md:hidden pb-3 border-b border-[#E9EAF0] dark:border-[#262838]">
            <button
              type="button"
              onClick={() => setMobileNoteDetailOpen(false)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#6C5CE7] dark:text-[#8C7CFF] hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Notes List</span>
            </button>
          </div>
          {activeNote ? (
            <div className="max-w-3xl mx-auto w-full space-y-6">
              {/* Document Header & Metadata */}
              <div className="border-b border-[#E9EAF0] dark:border-[#262838] pb-4 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  {/* Folder selector & tags */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Quick Move Folder Dropdown (Admin) or Folder Pill (Viewer) */}
                    <div className="flex items-center gap-1.5 bg-[#F0EDFF] dark:bg-[#1E202E] px-2.5 py-1 rounded-lg border border-[#6C5CE7]/30">
                      <span className="text-[11px] font-mono uppercase text-[#777B8A] font-bold">Folder:</span>
                      {isAdmin ? (
                        <select
                          value={activeNote.folder || 'Core Java'}
                          onChange={(e) => handleMoveNote(activeNote.id, e.target.value)}
                          className="dev-input text-[11px] font-bold px-1.5 py-0.5 rounded cursor-pointer text-[#6C5CE7] dark:text-[#8C7CFF]"
                          title="Move to another folder"
                        >
                          {allFolders.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[11px] font-bold text-[#6C5CE7] dark:text-[#8C7CFF]">
                          {activeNote.folder || 'Core Java'}
                        </span>
                      )}
                    </div>

                    {activeNote.tags?.map((t) => (
                      <span key={t} className="text-[11px] font-mono font-semibold text-[#777B8A] bg-[#F5F6FA] dark:bg-[#1E202E] px-2 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFavMutation.mutate(activeNote.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        activeNote.favourite
                          ? 'bg-[#F9F4EB] text-[#8C6422] dark:bg-[#2B271E] dark:text-[#D9B575]'
                          : 'text-[#B0B4C3] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
                      }`}
                      title="Star note"
                    >
                      <Star className={`w-4 h-4 ${activeNote.favourite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => togglePinMutation.mutate(activeNote.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        activeNote.pinned
                          ? 'bg-[#EDF3EF] text-[#127C4B] dark:bg-[#1E2922] dark:text-[#63E2A3]'
                          : 'text-[#B0B4C3] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
                      }`}
                      title="Pin note"
                    >
                      <Pin className="w-4 h-4 rotate-45" />
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(activeNote)}
                          className="p-1.5 rounded-lg text-[#777B8A] hover:text-[#20212A] dark:hover:text-[#F1F2F6] hover:bg-[#F0EDFF] dark:hover:bg-[#1E202E] transition-colors cursor-pointer"
                          title="Edit note"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this technical note?')) {
                              deleteMutation.mutate(activeNote.id)
                            }
                          }}
                          className="p-1.5 rounded-lg text-[#B0B4C3] hover:text-[#9E3939] hover:bg-[#F8EFEF] dark:hover:bg-[#2E1F1F] transition-colors cursor-pointer"
                          title="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl text-[#20212A] dark:text-[#F1F2F6] font-bold tracking-tight leading-snug">
                  {activeNote.title}
                </h1>

                <div className="flex items-center gap-3 text-xs text-[#777B8A] dark:text-[#9497A8] font-medium">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#777B8A]" />
                    {readingTime}
                  </span>
                  <span className="text-[#B0B4C3]">•</span>
                  <span>
                    Last updated{' '}
                    {new Date(activeNote.updatedAt || activeNote.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Document Reading Body */}
              <div className="pt-2 text-[#20212A] dark:text-[#F1F2F6]">
                <MarkdownViewer content={activeNote.content || ''} />
              </div>

              {/* References & Learning Materials Feature */}
              <div className="pt-6 border-t border-[#E9EAF0] dark:border-[#262838] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#20212A] dark:text-[#F1F2F6]">
                      References & Learning Materials
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsAddingRefToActive(!isAddingRefToActive)}
                      className="text-xs text-[#6C5CE7] dark:text-[#8C7CFF] hover:underline font-bold cursor-pointer"
                    >
                      {isAddingRefToActive ? 'Cancel' : '+ Add Reference Link'}
                    </button>
                  )}
                </div>

                {/* Inline Quick Add Reference Link */}
                {isAddingRefToActive && (
                  <form onSubmit={handleQuickAddRef} className="flex gap-2 p-3 bg-[#F8F9FC] dark:bg-[#1A1C28] rounded-xl border border-[#E9EAF0] dark:border-[#262838] animate-fade-in">
                    <input
                      type="url"
                      value={activeRefInput}
                      onChange={(e) => setActiveRefInput(e.target.value)}
                      placeholder="Paste YouTube video or documentation URL..."
                      className="dev-input flex-1 px-3 py-1.5 text-xs font-medium"
                      autoFocus
                      required
                    />
                    <button type="submit" className="btn-primary text-xs px-3 py-1.5 font-bold cursor-pointer">
                      Attach
                    </button>
                  </form>
                )}

                {/* Render References (YouTube videos and Documentation) */}
                {activeNote.sourceUrls && activeNote.sourceUrls.length > 0 ? (
                  <div className="space-y-3">
                    {activeNote.sourceUrls.map((url, i) => {
                      const ytId = getYouTubeId(url)
                      return ytId ? (
                        <div key={i} className="dev-card overflow-hidden p-3 space-y-2 border-rose-500/20">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                              <Video className="w-4 h-4" /> YouTube Video Reference
                            </span>
                            <div className="flex items-center gap-2">
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-[#6C5CE7] hover:underline flex items-center gap-1 font-semibold"
                              >
                                <span>Watch on YouTube</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm('Remove this video reference?')) {
                                      handleRemoveReferenceFromActive(url)
                                    }
                                  }}
                                  className="p-1 rounded text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  title="Remove reference"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="aspect-video w-full rounded-lg overflow-hidden border border-[#E9EAF0] dark:border-[#262838]">
                            <iframe
                              src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                              title={`YouTube video reference ${i + 1}`}
                              className="w-full h-full"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      ) : (
                        <div key={i} className="dev-card p-3 flex items-center justify-between text-xs hover:border-[#6C5CE7]/40 transition-colors">
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <BookOpen className="w-4 h-4 text-[#6C5CE7] shrink-0" />
                            <a
                              href={isSafeUrl(url) ? url : '#'}
                              target={isSafeUrl(url) ? '_blank' : undefined}
                              rel="noopener noreferrer"
                              className="font-bold text-[#20212A] dark:text-[#F1F2F6] hover:text-[#6C5CE7] truncate"
                            >
                              {url}
                            </a>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {isSafeUrl(url) && (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#6C5CE7] dark:text-[#8C7CFF] p-1 hover:bg-[#F0EDFF] dark:hover:bg-[#1E202E] rounded"
                                title="Open link"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm('Remove this reference link?')) {
                                    handleRemoveReferenceFromActive(url)
                                  }
                                }}
                                className="p-1 rounded text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Remove reference"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#777B8A] dark:text-[#9497A8] italic">
                    No reference video or learning links attached yet. Click "+ Add Reference Link" above.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-[#777B8A] dark:text-[#9497A8]">
              <BookOpen className="w-10 h-10 text-[#B0B4C3] mb-3 opacity-60" />
              <h3 className="text-base font-bold text-[#20212A] dark:text-[#F1F2F6]">Select a note to read</h3>
              <p className="text-xs text-[#777B8A] dark:text-[#9497A8] max-w-sm mt-1">
                Choose a document from the middle list or click "Write Note" to document a new concept.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Note Edit / Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Technical Note' : 'Write New Technical Note'}
        subtitle="Document JVM architectures, concurrency primitives, or algorithmic patterns"
        maxWidth="4xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8] font-bold">Title *</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. JVM G1 Garbage Collector Internals"
                className="dev-input w-full px-3 py-1.5 text-xs font-semibold"
                required
              />
            </div>

            {/* Folder Dropdown Selector with New Folder option */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8] font-bold">Folder</label>
                <button
                  type="button"
                  onClick={() => setIsCreatingFolderInModal(!isCreatingFolderInModal)}
                  className="text-[10px] text-[#6C5CE7] dark:text-[#8C7CFF] hover:underline font-bold cursor-pointer"
                >
                  {isCreatingFolderInModal ? 'Pick Existing' : '+ New Folder'}
                </button>
              </div>

              {isCreatingFolderInModal ? (
                <input
                  type="text"
                  value={customModalFolder}
                  onChange={(e) => {
                    setCustomModalFolder(e.target.value)
                    setFormFolder(e.target.value)
                  }}
                  placeholder="Enter new folder name..."
                  className="dev-input w-full px-3 py-1.5 text-xs font-semibold"
                  autoFocus
                />
              ) : (
                <select
                  value={formFolder}
                  onChange={(e) => {
                    if (e.target.value === '__NEW__') {
                      setIsCreatingFolderInModal(true)
                    } else {
                      setFormFolder(e.target.value)
                    }
                  }}
                  className="dev-input w-full px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                >
                  {allFolders.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                  <option value="__NEW__">+ Create New Folder...</option>
                </select>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8] font-bold">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formTags}
              onChange={(e) => setFormTags(e.target.value)}
              placeholder="java, gc, memory-management"
              className="dev-input w-full px-3 py-1.5 text-xs font-medium"
            />
          </div>

          {/* Markdown Content Editor with Toolbar & Shortcuts */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8] font-bold">
                Note Content (Markdown)
              </label>

              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewTab('write')}
                  className={`px-2.5 py-0.5 rounded cursor-pointer font-bold ${
                    previewTab === 'write'
                      ? 'bg-[#6C5CE7] text-white shadow-2xs'
                      : 'text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('preview')}
                  className={`px-2.5 py-0.5 rounded cursor-pointer font-bold ${
                    previewTab === 'preview'
                      ? 'bg-[#6C5CE7] text-white shadow-2xs'
                      : 'text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>

            {/* Quick Formatting Toolbar (Buttons for Code Snippet, Bullets, Bold, etc.) */}
            {previewTab === 'write' && (
              <div className="flex items-center gap-1 p-1 bg-[#F8F9FC] dark:bg-[#1A1C28] border border-[#E9EAF0] dark:border-[#262838] rounded-lg flex-wrap">
                <button
                  type="button"
                  onClick={() => insertFormatting('**', '**', 'bold text')}
                  className="p-1.5 rounded hover:bg-[#E9EAF0] dark:hover:bg-[#262838] text-[#20212A] dark:text-[#F1F2F6] cursor-pointer"
                  title="Bold (Ctrl+B)"
                >
                  <BoldIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('*', '*', 'italic text')}
                  className="p-1.5 rounded hover:bg-[#E9EAF0] dark:hover:bg-[#262838] text-[#20212A] dark:text-[#F1F2F6] cursor-pointer"
                  title="Italic"
                >
                  <ItalicIcon className="w-3.5 h-3.5" />
                </button>

                <div className="w-[1px] h-4 bg-[#E9EAF0] dark:bg-[#262838] mx-1" />

                {/* Code Snippet Button */}
                <button
                  type="button"
                  onClick={() => insertFormatting('```java\n', '\n```', '// Code snippet\npublic class Example {\n    \n}')}
                  className="px-2 py-1 rounded bg-[#F0EDFF] dark:bg-[#6C5CE7]/20 text-[#6C5CE7] dark:text-[#8C7CFF] font-bold text-xs flex items-center gap-1 cursor-pointer hover:opacity-90"
                  title="Insert Code Snippet (Ctrl+K)"
                >
                  <Code className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Code Snippet</span>
                </button>

                {/* Bullet List Button */}
                <button
                  type="button"
                  onClick={() => insertFormatting('- ', '', 'Bullet item')}
                  className="px-2 py-1 rounded bg-[#F0EDFF] dark:bg-[#6C5CE7]/20 text-[#6C5CE7] dark:text-[#8C7CFF] font-bold text-xs flex items-center gap-1 cursor-pointer hover:opacity-90"
                  title="Insert Bullet Point (Ctrl+L)"
                >
                  <List className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Bullet List</span>
                </button>

                <div className="w-[1px] h-4 bg-[#E9EAF0] dark:bg-[#262838] mx-1" />

                <button
                  type="button"
                  onClick={() => insertFormatting('## ', '', 'Section Title')}
                  className="p-1.5 rounded hover:bg-[#E9EAF0] dark:hover:bg-[#262838] text-[#20212A] dark:text-[#F1F2F6] cursor-pointer"
                  title="Heading 2"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('### ', '', 'Sub-section')}
                  className="p-1.5 rounded hover:bg-[#E9EAF0] dark:hover:bg-[#262838] text-[#20212A] dark:text-[#F1F2F6] cursor-pointer"
                  title="Heading 3"
                >
                  <Heading3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('> ', '', 'Important note or quote')}
                  className="p-1.5 rounded hover:bg-[#E9EAF0] dark:hover:bg-[#262838] text-[#20212A] dark:text-[#F1F2F6] cursor-pointer"
                  title="Quote"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('- [ ] ', '', 'Checklist task')}
                  className="p-1.5 rounded hover:bg-[#E9EAF0] dark:hover:bg-[#262838] text-[#20212A] dark:text-[#F1F2F6] cursor-pointer"
                  title="Checklist item"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('[', '](https://...)', 'Link Title')}
                  className="p-1.5 rounded hover:bg-[#E9EAF0] dark:hover:bg-[#262838] text-[#20212A] dark:text-[#F1F2F6] cursor-pointer"
                  title="Link"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {previewTab === 'write' ? (
              <div className="space-y-1.5">
                <textarea
                  ref={textareaRef}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  onKeyDown={handleEditorKeyDown}
                  rows={13}
                  className="dev-input w-full p-3 font-mono text-xs custom-scrollbar leading-relaxed"
                  placeholder="Write in GitHub Flavored Markdown with ```java code blocks... (Use shortcuts: Ctrl+K for code, Ctrl+L for bullet list, Ctrl+B for bold)"
                />

                {/* Shortcuts Helper Row */}
                <div className="flex items-center gap-3 text-[11px] text-[#777B8A] dark:text-[#9497A8] flex-wrap bg-[#F8F9FC] dark:bg-[#1A1C28] p-2 rounded-lg border border-[#E9EAF0] dark:border-[#262838]">
                  <span className="font-bold text-[#6C5CE7] dark:text-[#8C7CFF] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Shortcuts:
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#232535] border border-gray-300 dark:border-gray-700 font-mono text-[10px]">Ctrl+K</kbd> Code Snippet
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#232535] border border-gray-300 dark:border-gray-700 font-mono text-[10px]">Ctrl+L</kbd> Bullet List
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#232535] border border-gray-300 dark:border-gray-700 font-mono text-[10px]">Ctrl+B</kbd> Bold
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#232535] border border-gray-300 dark:border-gray-700 font-mono text-[10px]">Enter</kbd> Auto-bullet
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-[#E9EAF0] dark:border-[#262838] rounded-xl min-h-[300px] max-h-[400px] overflow-y-auto custom-scrollbar">
                <MarkdownViewer content={formContent} />
              </div>
            )}
          </div>

          {/* Reference Feature (YouTube Links & Learning Materials) */}
          <div className="space-y-2 p-3 rounded-xl bg-[#F8F9FC] dark:bg-[#1A1C28] border border-[#E9EAF0] dark:border-[#262838]">
            <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8] font-bold flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-rose-500" />
              <span>References & Learning Materials (YouTube Video / Docs / GitHub)</span>
            </label>

            <div className="flex gap-2">
              <input
                type="url"
                value={newRefInput}
                onChange={(e) => setNewRefInput(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://docs.oracle.com/..."
                className="dev-input flex-1 px-3 py-1.5 text-xs font-mono"
              />
              <button
                type="button"
                onClick={handleAddRefToForm}
                className="btn-secondary text-xs px-3 py-1.5 font-bold cursor-pointer shrink-0"
              >
                + Add Reference
              </button>
            </div>

            {/* Added references chips */}
            {formSourceUrls.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {formSourceUrls.map((url, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-[#232535] border border-[#E9EAF0] dark:border-[#34374C] text-[11px] font-mono text-[#20212A] dark:text-[#F1F2F6]"
                  >
                    <span className="truncate max-w-[280px]">{url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRefFromForm(url)}
                      className="text-gray-400 hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E9EAF0] dark:border-[#262838]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer font-bold shadow-xs"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              <span>
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving Note...'
                  : isEditing
                  ? 'Save Changes'
                  : 'Create Note'}
              </span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
