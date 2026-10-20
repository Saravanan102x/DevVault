import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BrainCircuit,
  CheckCircle2,
  Eye,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { revisionsApi } from '../services/api'
import type { RevisionRecord, RevisionOutcome } from '../types'
import { Badge } from '../components/common/Badge'
import { useAccess } from '../context/AccessContext'

export const RevisionPage: React.FC = () => {
  const { isAdmin } = useAccess()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'due' | 'overdue' | 'upcoming' | 'recent'>('due')
  const [currentReviewIdx, setCurrentReviewIdx] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)

  const { data: dueItems } = useQuery({
    queryKey: ['revisions-due-today'],
    queryFn: revisionsApi.dueToday,
  })

  const { data: overdueItems } = useQuery({
    queryKey: ['revisions-overdue'],
    queryFn: revisionsApi.overdue,
  })

  const { data: upcomingItems } = useQuery({
    queryKey: ['revisions-upcoming'],
    queryFn: () => revisionsApi.upcoming(7),
  })

  const { data: recentItems } = useQuery({
    queryKey: ['revisions-recent'],
    queryFn: () => revisionsApi.recent(15),
  })

  const recordMutation = useMutation({
    mutationFn: ({ entityId, outcome }: { entityId: string; outcome: RevisionOutcome }) =>
      revisionsApi.record({
        entityId,
        entityType: 'PROBLEM',
        outcome,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisions-due-today'] })
      queryClient.invalidateQueries({ queryKey: ['revisions-overdue'] })
      queryClient.invalidateQueries({ queryKey: ['revisions-upcoming'] })
      queryClient.invalidateQueries({ queryKey: ['revisions-recent'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Recall recorded: SM-2 interval updated')
      setIsRevealed(false)
      if (dueItems && currentReviewIdx < dueItems.length - 1) {
        setCurrentReviewIdx((prev) => prev + 1)
      } else {
        setCurrentReviewIdx(0)
      }
    },
  })

  const deleteRevisionMutation = useMutation({
    mutationFn: (id: string) => revisionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisions-due-today'] })
      queryClient.invalidateQueries({ queryKey: ['revisions-overdue'] })
      queryClient.invalidateQueries({ queryKey: ['revisions-upcoming'] })
      queryClient.invalidateQueries({ queryKey: ['revisions-recent'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Revision record deleted')
    },
    onError: () => toast.error('Failed to delete revision record'),
  })

  const activeList =
    activeTab === 'due'
      ? dueItems
      : activeTab === 'overdue'
      ? overdueItems
      : activeTab === 'upcoming'
      ? upcomingItems
      : recentItems

  const currentReviewItem: RevisionRecord | undefined =
    dueItems && dueItems.length > 0 ? dueItems[currentReviewIdx] : undefined

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-8">
      {/* Header Overview */}
      <div className="border-b border-[#E9EAF0] dark:border-[#262838] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#6C5CE7] dark:text-[#8C7CFF] uppercase tracking-wider mb-1 font-semibold">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>SM-2 Active Recall Engine</span>
          </div>
          <h1 className="font-serif text-2xl font-normal text-[#20212A] dark:text-[#F1F2F6] tracking-tight">
            Revision Center
          </h1>
          <p className="text-xs text-[#777B8A] dark:text-[#9497A8] mt-0.5 max-w-xl">
            Retain algorithms, data structures, and JVM concurrency models indefinitely using spaced interval repetition.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded dev-subcard text-center">
            <div className="text-sm font-semibold text-[#6C5CE7] dark:text-[#8C7CFF] font-mono">
              {dueItems?.length || 0}
            </div>
            <div className="text-[10px] text-[#777B8A] dark:text-[#9497A8] uppercase font-mono">Due Today</div>
          </div>
          <div className="px-3 py-1.5 rounded dev-subcard text-center">
            <div className="text-sm font-semibold text-[#9E3939] dark:text-[#E28383] font-mono">
              {overdueItems?.length || 0}
            </div>
            <div className="text-[10px] text-[#777B8A] dark:text-[#9497A8] uppercase font-mono">Overdue</div>
          </div>
        </div>
      </div>

      {/* Interactive Review Session Flashcard */}
      {currentReviewItem ? (
        <div className="dev-card p-5 sm:p-7 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#777B8A] dark:text-[#9497A8] bg-[#F0EDFF] dark:bg-[#1E202E] px-2 py-0.5 rounded border border-[#E9EAF0]/60 dark:border-[#262838]">
                Card {currentReviewIdx + 1} of {dueItems?.length || 1}
              </span>
              <Badge variant="purple">{currentReviewItem.entityType}</Badge>
            </div>
            <span className="text-[11px] font-mono text-[#777B8A] dark:text-[#9497A8]">
              Current Interval: {currentReviewItem.intervalDays}d
            </span>
          </div>

          <div className="py-5 border-y border-[#E9EAF0] dark:border-[#262838] text-center space-y-2.5">
            <span className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8]">
              Recall Challenge
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-medium text-[#20212A] dark:text-[#F1F2F6] max-w-xl mx-auto leading-relaxed">
              {currentReviewItem.notes || currentReviewItem.entityTitle || `Review Entity ID: ${currentReviewItem.entityId}`}
            </h3>
            <p className="text-xs text-[#777B8A] dark:text-[#9497A8]">
              Mentally trace or write the optimal algorithm, time/space trade-offs, and edge cases.
            </p>

            {!isRevealed ? (
              <button
                onClick={() => setIsRevealed(true)}
                className="btn-primary text-xs mt-2.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Reveal Solution Details</span>
              </button>
            ) : (
              <div className="pt-2 text-left max-w-xl mx-auto p-3.5 rounded dev-subcard text-xs space-y-1 animate-in fade-in duration-100">
                <span className="font-semibold text-[#6C5CE7] dark:text-[#8C7CFF] block text-[11px] uppercase font-mono">
                  Previous Recall History
                </span>
                <div className="text-[#20212A] dark:text-[#F1F2F6]">
                  Status: {currentReviewItem.outcome || 'FIRST_REVIEW'}
                </div>
                <div className="text-[#777B8A] dark:text-[#9497A8] text-[11px]">
                  Next scheduled interval: {currentReviewItem.intervalDays} day(s)
                </div>
              </div>
            )}
          </div>

          {/* Rating Feedback */}
          {isAdmin ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-[#777B8A]">Rate your recall precision:</span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() =>
                    recordMutation.mutate({
                      entityId: currentReviewItem.entityId,
                      outcome: 'NOT_REMEMBERED',
                    })
                  }
                  disabled={recordMutation.isPending}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded bg-[#F8EFEF] dark:bg-[#2E1F1F] text-[#9E3939] dark:text-[#E28383] border border-[#EED7D7] dark:border-[#4B2828] font-medium text-xs cursor-pointer hover:opacity-85"
                >
                  1. Forgot (1d)
                </button>
                <button
                  onClick={() =>
                    recordMutation.mutate({
                      entityId: currentReviewItem.entityId,
                      outcome: 'PARTIALLY_REMEMBERED',
                    })
                  }
                  disabled={recordMutation.isPending}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded bg-[#F9F4EB] dark:bg-[#2B271E] text-[#8C6422] dark:text-[#D9B575] border border-[#EFE3CF] dark:border-[#423927] font-medium text-xs cursor-pointer hover:opacity-85"
                >
                  2. Hard (3d)
                </button>
                <button
                  onClick={() =>
                    recordMutation.mutate({
                      entityId: currentReviewItem.entityId,
                      outcome: 'REMEMBERED',
                    })
                  }
                  disabled={recordMutation.isPending}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded bg-[#EDF3EF] dark:bg-[#1E2922] text-[#127C4B] dark:text-[#63E2A3] border border-[#C5F3DB] dark:border-[#184631] font-medium text-xs cursor-pointer hover:opacity-85"
                >
                  3. Recalled (7+d)
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs p-2.5 rounded bg-[#F0EDFF]/40 dark:bg-[#1E202E]/40 border border-[#6C5CE7]/20">
              <span className="text-[#777B8A]">Spaced repetition schedule:</span>
              <span className="font-mono font-semibold text-[#6C5CE7] dark:text-[#8C7CFF]">Read-Only Review</span>
            </div>
          )}
        </div>
      ) : (
        <div className="dev-card p-8 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-[#6C5CE7] dark:text-[#8C7CFF] mx-auto" />
          <h3 className="font-serif text-base text-[#20212A] dark:text-[#F1F2F6]">Daily Queue Cleared</h3>
          <p className="text-xs text-[#777B8A] max-w-sm mx-auto">
            You have no active recall cards due right now. Mark more problems or notes for spaced repetition to build your daily study deck.
          </p>
        </div>
      )}

      {/* Tabs list (Due / Overdue / Upcoming / History) */}
      <div className="space-y-3">
        <div className="flex items-center gap-1 border-b border-[#E9EAF0] dark:border-[#262838] pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('due')}
            className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
              activeTab === 'due'
                ? 'bg-[#6C5CE7] text-white font-medium'
                : 'text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
            }`}
          >
            Due Today ({dueItems?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
              activeTab === 'overdue'
                ? 'bg-[#6C5CE7] text-white font-medium'
                : 'text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
            }`}
          >
            Overdue ({overdueItems?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-[#6C5CE7] text-white font-medium'
                : 'text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
            }`}
          >
            Next 7 Days ({upcomingItems?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
              activeTab === 'recent'
                ? 'bg-[#6C5CE7] text-white font-medium'
                : 'text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6]'
            }`}
          >
            Recent History
          </button>
        </div>

        {/* Tab Items List */}
        <div className="dev-card divide-y divide-[#E9EAF0] dark:divide-[#262838] overflow-hidden text-xs">
          {activeList && activeList.length > 0 ? (
            activeList.map((rec) => (
              <div key={rec.id} className="p-3 flex items-center justify-between hover:bg-[#F8F9FC] dark:hover:bg-[#1E202E] transition-colors">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="purple">{rec.entityType}</Badge>
                    <span className="font-medium text-[#20212A] dark:text-[#F1F2F6]">
                      {rec.notes || rec.entityTitle || `Entity ${rec.entityId}`}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#777B8A] dark:text-[#9497A8] flex items-center gap-2">
                    <span>Interval: {rec.intervalDays}d</span>
                    {rec.nextRevisionDate && (
                      <span className="font-mono text-[#6C5CE7] dark:text-[#8C7CFF]">Due: {rec.nextRevisionDate}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={rec.outcome === 'REMEMBERED' ? 'easy' : rec.outcome === 'PARTIALLY_REMEMBERED' ? 'medium' : 'hard'}>
                    {rec.outcome || 'PENDING'}
                  </Badge>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Delete this revision schedule entry?')) {
                          deleteRevisionMutation.mutate(rec.id)
                        }
                      }}
                      className="p-1 rounded text-[#777B8A] hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors"
                      title="Delete revision record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-[#777B8A] dark:text-[#9497A8]">
              No revision records in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
