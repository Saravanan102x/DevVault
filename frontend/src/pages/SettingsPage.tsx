import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  HardDrive,
  Download,
  Upload,
  Tag as TagIcon,
  ShieldCheck,
  Sun,
  Moon,
  Palette,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { tagsApi, backupApi } from '../services/api'
import { useTheme } from '../context/ThemeContext'
import { useAccess } from '../context/AccessContext'
import { Navigate } from 'react-router-dom'

export const SettingsPage: React.FC = () => {
  const { isAdmin } = useAccess()
  const queryClient = useQueryClient()
  const { theme, setTheme } = useTheme()
  const [newTagName, setNewTagName] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.list,
    enabled: isAdmin,
  })

  const createTagMutation = useMutation({
    mutationFn: (name: string) => tagsApi.findOrCreate(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast.success('Tag created')
      setNewTagName('')
    },
  })

  const deleteTagMutation = useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast.success('Tag deleted')
    },
  })

  const handleExportBackup = async () => {
    try {
      setIsExporting(true)
      const blob = await backupApi.export()
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/zip' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `devvault-backup-${new Date().toISOString().slice(0, 10)}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Backup archive downloaded')
    } catch (err) {
      toast.error('Failed to export backup.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!confirm('Importing a backup will replace your current data (a safety snapshot will be created automatically). Continue?')) {
      e.target.value = ''
      return
    }

    try {
      setIsImporting(true)
      await backupApi.import(file)
      queryClient.invalidateQueries()
      toast.success('Backup restored successfully')
    } catch (err) {
      toast.error('Failed to restore backup.')
    } finally {
      setIsImporting(false)
      e.target.value = ''
    }
  }

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagName.trim()) return
    createTagMutation.mutate(newTagName.trim())
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-12">
      {/* Header */}
      <div className="border-b border-[#E9EAF0] dark:border-[#262838] pb-4">
        <h1 className="font-serif text-2xl font-normal text-[#20212A] dark:text-[#F1F2F6] tracking-tight">
          Vault Settings & Local Data
        </h1>
        <p className="text-xs text-[#777B8A] dark:text-[#9497A8] mt-0.5">
          Configure visual themes, inspect local JSON persistence, manage backups, and maintain tag taxonomy.
        </p>
      </div>

      {/* Appearance & Theme Selector */}
      <div className="dev-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#6C5CE7] dark:text-[#8C7CFF]" />
          <h2 className="font-serif text-base font-medium text-[#20212A] dark:text-[#F1F2F6]">
            Appearance & Workspace Theme
          </h2>
        </div>

        <p className="text-xs text-[#777B8A] dark:text-[#9497A8] leading-relaxed">
          DevVault features a warm, editorial visual identity inspired by fine technical journals and distraction-free developer workspaces.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Light Theme */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded border text-left flex items-start gap-3 transition-colors cursor-pointer ${
              theme === 'light'
                ? 'border-[#6C5CE7] bg-[#F8F9FC] dark:bg-[#1E202E]'
                : 'border-[#E9EAF0] dark:border-[#262838] hover:bg-[#F8F9FC] dark:hover:bg-[#1A1C28]'
            }`}
          >
            <div className="p-2 rounded bg-[#F0EDFF] text-[#6C5CE7] shrink-0 mt-0.5">
              <Sun className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#20212A] dark:text-[#F1F2F6] flex items-center gap-2">
                <span>Warm Editorial Light (Default)</span>
                {theme === 'light' && (
                  <span className="text-[10px] font-mono bg-[#6C5CE7] text-white px-1.5 py-0.2 rounded font-normal">Active</span>
                )}
              </div>
              <p className="text-[11px] text-[#777B8A] dark:text-[#9497A8] leading-relaxed">
                Linen off-white canvas (#F8F9FC), crisp document surfaces (#FFFFFF), deep graphite text (#242522), and calming forest-green accents.
              </p>
            </div>
          </button>

          {/* Dark Theme */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded border text-left flex items-start gap-3 transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'border-[#8C7CFF] bg-[#1E202E]'
                : 'border-[#E9EAF0] dark:border-[#262838] hover:bg-[#F8F9FC] dark:hover:bg-[#1A1C28]'
            }`}
          >
            <div className="p-2 rounded bg-[#14151F] text-[#8C7CFF] shrink-0 mt-0.5 border border-[#262838]">
              <Moon className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#20212A] dark:text-[#F1F2F6] flex items-center gap-2">
                <span>Warm Charcoal Dark</span>
                {theme === 'dark' && (
                  <span className="text-[10px] font-mono bg-[#8C7CFF] text-[#101118] px-1.5 py-0.2 rounded font-semibold">Active</span>
                )}
              </div>
              <p className="text-[11px] text-[#777B8A] dark:text-[#9497A8] leading-relaxed">
                Warm dark stone surfaces (#101118), muted olive undertones, soft linen headings, and refined sage accents. No cold blue dashboard glare.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Storage Architecture Info */}
      <div className="dev-card p-5 sm:p-6 space-y-3.5">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-[#6C5CE7] dark:text-[#8C7CFF]" />
          <h2 className="font-serif text-base font-medium text-[#20212A] dark:text-[#F1F2F6]">
            Zero-Database Local Storage Engine
          </h2>
        </div>

        <p className="text-xs text-[#777B8A] dark:text-[#9497A8] leading-relaxed">
          DevVault stores 100% of your notes, LeetCode problems, interview questions, and spaced repetition curves in a high-speed local JSON flat-file repository. Zero database setup is required, with zero latency and complete privacy.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="p-3 rounded dev-subcard">
            <span className="text-[10px] font-mono uppercase text-[#777B8A] block mb-1">Local Storage Directory</span>
            <span className="font-mono text-xs text-[#6C5CE7] dark:text-[#8C7CFF] break-all font-medium">
              C:\Users\Saravanan\tech-diary-data
            </span>
          </div>

          <div className="p-3 rounded dev-subcard">
            <span className="text-[10px] font-mono uppercase text-[#777B8A] block mb-1">Data Safety Guarantee</span>
            <span className="text-xs text-[#20212A] dark:text-[#F1F2F6]">
              All writes perform atomic file swapping. Reboots and restarts preserve 100% of user data intact.
            </span>
          </div>
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="dev-card p-5 sm:p-6 space-y-3.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#6C5CE7] dark:text-[#8C7CFF]" />
          <h2 className="font-serif text-base font-medium text-[#20212A] dark:text-[#F1F2F6]">
            Data Portability & Full ZIP Backup
          </h2>
        </div>

        <p className="text-xs text-[#777B8A] dark:text-[#9497A8]">
          Download a complete ZIP snapshot of all your JSON files, architecture diagrams, and review histories, or restore from a previous archive.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExportBackup}
            disabled={isExporting}
            className="btn-primary text-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generating ZIP...' : 'Export Vault (ZIP)'}</span>
          </button>

          <label className="btn-secondary text-xs cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-[#6C5CE7]" />
            <span>{isImporting ? 'Restoring...' : 'Restore Backup (ZIP)'}</span>
            <input
              type="file"
              accept=".zip"
              onChange={handleImportBackup}
              disabled={isImporting}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Tag Management */}
      <div className="dev-card p-5 sm:p-6 space-y-3.5">
        <div className="flex items-center gap-2">
          <TagIcon className="w-4 h-4 text-[#6C5CE7] dark:text-[#8C7CFF]" />
          <h2 className="font-serif text-base font-medium text-[#20212A] dark:text-[#F1F2F6]">
            Taxonomy & Tags
          </h2>
        </div>

        <form onSubmit={handleAddTag} className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Add new topic tag (e.g. redis, dynamic-programming, jvm-memory)..."
            className="dev-input flex-1 px-3 py-1.5 text-xs"
          />
          <button type="submit" className="btn-primary text-xs cursor-pointer">
            Add Tag
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags && tags.length > 0 ? (
            tags.map((tag) => (
              <div
                key={tag.id}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded dev-subcard text-xs text-[#20212A] dark:text-[#F1F2F6]"
              >
                <span className="font-mono text-[11px]">#{tag.name}</span>
                <button
                  onClick={() => deleteTagMutation.mutate(tag.id)}
                  className="text-[#B0B4C3] hover:text-[#9E3939] text-xs cursor-pointer ml-0.5"
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <span className="text-xs text-[#777B8A]">No custom tags created yet.</span>
          )}
        </div>
      </div>
    </div>
  )
}
