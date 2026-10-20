import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CalendarCheck,
  Save,
  Clock,
  Sparkles,
  CheckCircle,
  BookOpen,
  Calendar,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { journalApi } from '../services/api'
import type { JournalEntry } from '../types'
import { useAccess } from '../context/AccessContext'

export const JournalPage: React.FC = () => {
  const { isAdmin } = useAccess()
  const queryClient = useQueryClient()
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)

  // Form State
  const [whatIStudied, setWhatIStudied] = useState('')
  const [whatIImplemented, setWhatIImplemented] = useState('')
  const [challenges, setChallenges] = useState('')
  const [toRevise, setToRevise] = useState('')
  const [productivityScore, setProductivityScore] = useState<number>(8)

  // Fetch today's entry
  const { data: todayEntry } = useQuery({
    queryKey: ['journal-today'],
    queryFn: journalApi.today,
  })

  // Fetch past entries
  const { data: pastEntries } = useQuery({
    queryKey: ['journal-history'],
    queryFn: () => journalApi.list({ recent: 30 }),
  })

  // Sync state when today's entry is loaded or active entry changes
  useEffect(() => {
    const entryToLoad = selectedEntry || todayEntry
    if (entryToLoad) {
      setWhatIStudied(entryToLoad.whatIStudied || '')
      setWhatIImplemented(entryToLoad.whatIImplemented || '')
      setChallenges(entryToLoad.challenges || '')
      setToRevise(entryToLoad.toRevise || '')
      setProductivityScore(entryToLoad.productivityScore || 8)
    }
  }, [todayEntry, selectedEntry])

  const saveMutation = useMutation({
    mutationFn: (data: Partial<JournalEntry>) => {
      const entryId = selectedEntry?.id || todayEntry?.id
      if (entryId) {
        return journalApi.update(entryId, data)
      } else {
        return journalApi.create(data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-today'] })
      queryClient.invalidateQueries({ queryKey: ['journal-history'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Journal entry saved')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => journalApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-today'] })
      queryClient.invalidateQueries({ queryKey: ['journal-history'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Journal entry deleted')
      setSelectedEntry(null)
      setWhatIStudied('')
      setWhatIImplemented('')
      setChallenges('')
      setToRevise('')
      setProductivityScore(8)
    },
    onError: () => toast.error('Failed to delete journal entry'),
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate({
      whatIStudied,
      whatIImplemented,
      challenges,
      toRevise,
      productivityScore: Number(productivityScore) || 8,
    })
  }

  const activeDate = selectedEntry?.date || todayEntry?.date || 'Today'

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto pb-12">
      {/* Left Timeline Rail */}
      <div className="w-full md:w-64 shrink-0 dev-card p-3 space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-[#E9EAF0] dark:border-[#262838]">
          <div className="flex items-center gap-1.5 text-xs font-serif font-medium text-[#20212A] dark:text-[#F1F2F6]">
            <CalendarCheck className="w-3.5 h-3.5 text-[#6C5CE7] dark:text-[#8C7CFF]" />
            <span>Timeline</span>
          </div>
          <button
            onClick={() => setSelectedEntry(null)}
            className="text-[11px] text-[#6C5CE7] dark:text-[#8C7CFF] hover:underline font-medium cursor-pointer"
          >
            Go to Today
          </button>
        </div>

        <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-16rem)] custom-scrollbar">
          {/* Today button */}
          <div
            onClick={() => setSelectedEntry(null)}
            className={`p-2.5 rounded border transition-colors cursor-pointer text-xs ${
              selectedEntry === null
                ? 'bg-[#F0EDFF] dark:bg-[#1E202E] border-[#6C5CE7]/40 dark:border-[#8C7CFF]/40 text-[#20212A] dark:text-[#F1F2F6]'
                : 'border-transparent hover:bg-[#F8F9FC] dark:hover:bg-[#1A1C28] text-[#20212A] dark:text-[#F1F2F6]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">Today's Log</span>
              <span className="text-[10px] text-[#127C4B] dark:text-[#63E2A3] font-mono">Current</span>
            </div>
            <p className="text-[11px] text-[#777B8A] dark:text-[#9497A8] mt-1 line-clamp-1">
              {whatIStudied || 'Document today’s achievements...'}
            </p>
          </div>

          {/* Past logs */}
          {pastEntries?.map((entry) => {
            const isSelected = selectedEntry?.id === entry.id
            return (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className={`group p-2.5 rounded border transition-colors cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-[#F0EDFF] dark:bg-[#1E202E] border-[#6C5CE7]/40 dark:border-[#8C7CFF]/40 text-[#20212A] dark:text-[#F1F2F6]'
                    : 'border-transparent hover:bg-[#F8F9FC] dark:hover:bg-[#1A1C28] text-[#20212A] dark:text-[#F1F2F6]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{entry.date}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-[#777B8A] font-mono">
                      {entry.productivityScore || 8}/10
                    </span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm(`Delete journal entry for ${entry.date}?`)) {
                            deleteMutation.mutate(entry.id)
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-rose-500 cursor-pointer transition-opacity"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-[#777B8A] dark:text-[#9497A8] mt-1 line-clamp-1">
                  {entry.whatIStudied || 'No details logged'}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Journal Editor Pane */}
      <div className="flex-1 dev-card p-6 sm:p-7 flex flex-col">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E9EAF0] dark:border-[#262838] gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#777B8A]">
                <Calendar className="w-3 h-3 text-[#6C5CE7]" />
                <span>{activeDate}</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl text-[#20212A] dark:text-[#F1F2F6] font-normal mt-1">
                {selectedEntry ? `Engineering Log for ${activeDate}` : "Today's Engineering Log"}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isAdmin ? (
                <>
                  {(selectedEntry || todayEntry?.id) && (
                    <button
                      type="button"
                      onClick={() => {
                        const idToDelete = selectedEntry?.id || todayEntry?.id
                        if (idToDelete && confirm(`Delete journal entry for ${activeDate}?`)) {
                          deleteMutation.mutate(idToDelete)
                        }
                      }}
                      className="btn-secondary text-xs px-2.5 py-1.5 cursor-pointer text-[#777B8A] hover:text-rose-600 hover:border-rose-500/40"
                      title="Delete this journal entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="btn-primary text-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Entry</span>
                  </button>
                </>
              ) : (
                <span className="text-xs font-mono font-bold text-[#6C5CE7] dark:text-[#8C7CFF] bg-[#F0EDFF] dark:bg-[#1E202E] px-2.5 py-1 rounded-lg border border-[#6C5CE7]/20">
                  Read-Only View
                </span>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 text-xs">
            {/* Productivity Score */}
            <div className="p-3.5 rounded dev-subcard space-y-1">
              <label className="block text-[11px] font-mono uppercase text-[#777B8A]">
                Focus & Productivity Score (1 to 10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={productivityScore}
                readOnly={!isAdmin}
                disabled={!isAdmin}
                onChange={(e) => setProductivityScore(parseInt(e.target.value) || 8)}
                className="dev-input w-28 px-2.5 py-1 text-xs"
              />
            </div>

            {/* What I Learned Today */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#6C5CE7]" />
                <span>Concepts Studied (JVM, Concurrency, Architecture)</span>
              </label>
              <textarea
                value={whatIStudied}
                readOnly={!isAdmin}
                onChange={(e) => setWhatIStudied(e.target.value)}
                rows={3}
                placeholder={isAdmin ? "Explored Virtual Threads (Project Loom), pinned carrier threads, and ForkJoinPool mechanics..." : "No study notes recorded for this date."}
                className="dev-input w-full p-2.5 text-xs custom-scrollbar leading-relaxed"
              />
            </div>

            {/* What I Built / Implemented */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-[#6C5CE7]" />
                <span>What I Built or Coded Today</span>
              </label>
              <textarea
                value={whatIImplemented}
                readOnly={!isAdmin}
                onChange={(e) => setWhatIImplemented(e.target.value)}
                rows={3}
                placeholder={isAdmin ? "Implemented LRU Cache using DoublyLinkedList + HashMap in Java; solved LeetCode 146..." : "No implementations recorded."}
                className="dev-input w-full p-2.5 text-xs custom-scrollbar leading-relaxed"
              />
            </div>

            {/* Blockers & Challenges */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#9E3939]" />
                <span>Challenges & Gotchas Encountered</span>
              </label>
              <textarea
                value={challenges}
                readOnly={!isAdmin}
                onChange={(e) => setChallenges(e.target.value)}
                rows={2}
                placeholder={isAdmin ? "Encountered false sharing in multithreaded benchmark; investigated @Contended and cache line padding..." : "No challenges recorded."}
                className="dev-input w-full p-2.5 text-xs custom-scrollbar leading-relaxed"
              />
            </div>

            {/* Daily Reflection */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-[#6C5CE7]" />
                <span>To Revise / Tomorrow's Priorities</span>
              </label>
              <textarea
                value={toRevise}
                readOnly={!isAdmin}
                onChange={(e) => setToRevise(e.target.value)}
                rows={2}
                placeholder={isAdmin ? "Solid progress on concurrency. Tomorrow: review Kafka partition rebalancing and solve Tree DFS..." : "No reflections recorded."}
                className="dev-input w-full p-2.5 text-xs custom-scrollbar leading-relaxed"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
