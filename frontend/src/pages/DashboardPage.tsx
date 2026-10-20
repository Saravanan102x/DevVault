import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  BrainCircuit,
  Building2,
  ArrowRight,
  Plus,
  CalendarCheck,
  CheckSquare,
  Clock,
  Network,
} from 'lucide-react'
import { dashboardApi, notesApi, companiesApi } from '../services/api'
import { Badge } from '../components/common/Badge'
import { DailyTechTopicCard } from '../components/dashboard/DailyTechTopicCard'
import { CompanyLogo } from '../components/common/CompanyLogo'
import { useAccess } from '../context/AccessContext'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { isAdmin } = useAccess()

  // Real-time ticking clock with seconds
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedLiveDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const formattedLiveTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.stats,
  })

  const { data: notes } = useQuery({
    queryKey: ['notes-recent'],
    queryFn: () => notesApi.list(),
  })

  const { data: companies } = useQuery({
    queryKey: ['companies-list'],
    queryFn: () => companiesApi.list(),
  })

  const solvedCount = stats?.solvedProblems ?? 0
  const totalCount = stats?.totalProblems ?? 0
  const revisionDue = (stats?.revisionDueToday ?? 0) + (stats?.revisionOverdue ?? 0)

  // Target companies list with interview tracking
  const targetCompanies = companies && companies.length > 0 ? companies.slice(0, 5) : [
    { id: '1', name: 'PayPal', priority: 'HIGH', roles: 'Senior Java / Backend Engineer' },
    { id: '2', name: 'Walmart Global Tech', priority: 'HIGH', roles: 'Senior Software Engineer' },
    { id: '3', name: 'Freshworks', priority: 'MEDIUM', roles: 'Backend Platform Lead' },
    { id: '4', name: 'Chargebee', priority: 'MEDIUM', roles: 'Distributed Systems Engineer' },
    { id: '5', name: 'Comcast', priority: 'MEDIUM', roles: 'Java Cloud Microservices' },
  ]

  return (
    <div className="space-y-6 pb-10">
      {/* 1. Ultra-Attractive Executive Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-[#FAFBFD] to-[#F0EDFF] dark:from-[#151622] dark:via-[#181927] dark:to-[#1E1F33] border border-[#6C5CE7]/30 dark:border-[#8C7CFF]/30 p-5 sm:p-7 shadow-lg shadow-[#6C5CE7]/5 space-y-5">
        {/* Ambient background glow accents */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#6C5CE7]/15 dark:bg-[#8C7CFF]/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Top Meta Bar: Live Clock & Status */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#777B8A] dark:text-[#9497A8] flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white dark:bg-[#1C1E2D] border border-[#E9EAF0] dark:border-[#2D3044] text-[#20212A] dark:text-[#F1F2F6] font-mono shadow-2xs text-[11px] sm:text-xs">
              <Clock className="w-3.5 h-3.5 text-[#6C5CE7] dark:text-[#8C7CFF] shrink-0" />
              <span className="whitespace-nowrap">{formattedLiveDate}</span>
              <span className="text-[#6C5CE7] dark:text-[#8C7CFF] font-semibold whitespace-nowrap">• {formattedLiveTime}</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Workspace Active
            </span>
          </div>
        </div>

        {/* Main Greeting Heading */}
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#20212A] dark:text-[#F1F2F6]">
              Hi, Saravanan K
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 text-white shadow-sm flex items-center gap-1">
              <span>SDE-2</span>
              <span>🚀</span>
            </span>
          </div>
        </div>

        {/* Ultra-Attractive Motivational Banner */}
        <div className="relative z-10 p-4 sm:p-5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/12 to-indigo-500/15 dark:from-emerald-500/20 dark:via-teal-500/18 dark:to-indigo-500/20 border-2 border-emerald-500/35 dark:border-emerald-500/45 shadow-sm shadow-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-500/30 shrink-0">
              ⚡
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-300 font-extrabold block">
                Career Vision & Target
              </span>
              <p className="text-lg sm:text-xl font-black text-[#1A1C24] dark:text-white tracking-tight leading-snug">
                "Working in top tech product based company"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 sm:self-center shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Targeting Tier-1 Product Engineering</span>
          </div>
        </div>

        {/* Quick Actions & Learning Metrics Strip */}
        <div className="relative z-10 pt-1 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-[#E9EAF0]/80 dark:border-[#262838]/80">
          {/* Quick Action Buttons (Admin Only) */}
          {isAdmin && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => navigate('/notes')}
                className="btn-secondary text-xs px-3 py-1.5 cursor-pointer shadow-2xs font-bold"
                title="Create a new Technical Note"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-500" />
                <span>Note</span>
              </button>
              <button
                onClick={() => navigate('/problems')}
                className="btn-primary text-xs px-3.5 py-1.5 cursor-pointer font-bold shadow-xs"
                title="Log a Java or DSA Coding Problem"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Coding Problem</span>
              </button>
              <button
                onClick={() => navigate('/system-design')}
                className="btn-secondary text-xs px-3 py-1.5 cursor-pointer shadow-2xs font-bold hover:border-purple-500"
                title="Open System Design Vault"
              >
                <Network className="w-3.5 h-3.5 text-purple-500" />
                <span>System Design</span>
              </button>
              <button
                onClick={() => navigate('/checklist')}
                className="btn-secondary text-xs px-3 py-1.5 cursor-pointer shadow-2xs font-bold hover:border-green-500"
                title="Open Preparation Checklist"
              >
                <CheckSquare className="w-3.5 h-3.5 text-green-500" />
                <span>Checklist</span>
              </button>
              <button
                onClick={() => navigate('/companies')}
                className="btn-secondary text-xs px-3 py-1.5 cursor-pointer shadow-2xs font-bold"
                title="Add Company-Specific Interview Question"
              >
                <Plus className="w-3.5 h-3.5 text-orange-500" />
                <span>Interview Q</span>
              </button>
              <button
                onClick={() => navigate('/journal')}
                className="btn-secondary text-xs px-3 py-1.5 cursor-pointer shadow-2xs font-bold"
                title="Open Daily Engineering Journal"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-teal-500" />
                <span>Journal</span>
              </button>
            </div>
          )}

          {/* Quick Solved Metrics */}
          <div className="flex items-center gap-3 text-xs text-[#777B8A] dark:text-[#9497A8] font-medium flex-wrap">
            <div>
              <strong className="text-[#20212A] dark:text-[#F1F2F6] font-bold">
                {statsLoading ? '...' : solvedCount}
              </strong>
              <span className="ml-1">solved of {totalCount} logged</span>
            </div>
            <span className="text-[#D0D3DE] dark:text-[#414457]">•</span>
            <div>
              <strong className="text-[#20212A] dark:text-[#F1F2F6] font-bold">
                {stats?.totalNotes ?? 0}
              </strong>
              <span className="ml-1">notes</span>
            </div>
          </div>
        </div>
      </div>



      {/* 4. Two-Column Layout: Daily Technical Reading & Target Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Daily Tech Topic & Recent Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Random Tech Topic & What I Learnt */}
          <DailyTechTopicCard />

          {/* Recent Technical Notes Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#20212A] dark:text-[#F1F2F6]">
                Technical Notes & Architecture
              </h2>
              <Link to="/notes" className="text-xs text-[#6C5CE7] dark:text-[#8C7CFF] hover:underline font-medium">
                View library
              </Link>
            </div>

            {notes && notes.length > 0 ? (
              <div className="dev-card divide-y divide-[#E9EAF0] dark:divide-[#262838]">
                {notes.slice(0, 3).map((note) => (
                  <div
                    key={note.id}
                    onClick={() => navigate('/notes')}
                    className="p-3.5 hover:bg-[#F8F9FC] dark:hover:bg-[#1C1E2A] transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#6C5CE7] dark:text-[#8C7CFF] font-mono font-medium">
                          {note.folder || 'Core Java'}
                        </span>
                        {note.tags?.slice(0, 2).map((t) => (
                          <span key={t} className="text-[10px] text-[#777B8A] dark:text-[#9497A8] font-mono">
                            #{t}
                          </span>
                        ))}
                      </div>
                      <h4 className="text-xs sm:text-sm font-medium text-[#20212A] dark:text-[#F1F2F6] group-hover:text-[#6C5CE7] dark:group-hover:text-[#8C7CFF] transition-colors truncate">
                        {note.title}
                      </h4>
                      <p className="text-[11px] text-[#777B8A] dark:text-[#9497A8] line-clamp-1">
                        {note.content?.replace(/^[#\s]+/, '').slice(0, 100) || 'Note content'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#B0B4C3] shrink-0 group-hover:text-[#6C5CE7] dark:group-hover:text-[#8C7CFF] transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="dev-card p-6 text-center text-xs text-[#777B8A] dark:text-[#9497A8]">
                No technical notes written yet.{' '}
                <Link to="/notes" className="text-[#6C5CE7] dark:text-[#8C7CFF] underline font-medium">
                  Write your first note
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Target Companies & SM-2 Spaced Repetition */}
        <div className="space-y-6">
          {/* Target Company Workspaces */}
          <div className="dev-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E9EAF0] dark:border-[#262838]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#20212A] dark:text-[#F1F2F6]">
                <Building2 className="w-4 h-4 text-[#6C5CE7] dark:text-[#8C7CFF]" />
                <span>Target Companies</span>
              </div>
              <Link to="/companies" className="text-[11px] text-[#6C5CE7] dark:text-[#8C7CFF] hover:underline font-medium">
                Manage
              </Link>
            </div>

            <div className="space-y-2">
              {targetCompanies.map((c: any) => (
                <div
                  key={c.id || c.name}
                  onClick={() => navigate('/companies')}
                  className="p-2.5 rounded-xl hover:bg-[#F5F6FA] dark:hover:bg-[#1E202E] border border-transparent hover:border-[#E9EAF0] dark:hover:border-[#2A2C3E] transition-all cursor-pointer flex items-center justify-between text-xs group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="w-8 h-8 rounded-lg bg-[#F8F9FC] dark:bg-[#1A1C28] border border-[#E9EAF0] dark:border-[#2B2D3F] flex items-center justify-center shrink-0 p-1 group-hover:scale-105 transition-transform shadow-2xs">
                      <CompanyLogo name={c.name} size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-[#20212A] dark:text-[#F1F2F6] group-hover:text-[#6C5CE7] dark:group-hover:text-[#8C7CFF] transition-colors block truncate">
                        {c.name}
                      </span>
                      <span className="text-[11px] text-[#777B8A] dark:text-[#9497A8] block truncate font-medium">
                        {c.roles || 'Senior Java Engineer'}
                      </span>
                    </div>
                  </div>
                  <Badge variant={c.priority === 'HIGH' ? 'easy' : 'default'} size="sm">
                    {c.priority || 'ACTIVE'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Spaced Repetition Recall Status */}
          <div className="dev-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E9EAF0] dark:border-[#262838]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#20212A] dark:text-[#F1F2F6]">
                <BrainCircuit className="w-4 h-4 text-[#6C5CE7] dark:text-[#8C7CFF]" />
                <span>Revision Center (SM-2)</span>
              </div>
              <Link to="/revision" className="text-[11px] text-[#6C5CE7] dark:text-[#8C7CFF] hover:underline font-medium">
                Review
              </Link>
            </div>

            <div className="text-xs text-[#777B8A] dark:text-[#9497A8] leading-relaxed">
              {revisionDue > 0 ? (
                <p>
                  You have <strong className="text-[#20212A] dark:text-[#F1F2F6] font-semibold">{revisionDue}</strong> card(s) ready for spaced repetition review today to solidify algorithmic concepts.
                </p>
              ) : (
                <p>
                  All flashcards and practice problems are up to date. Next review intervals are scheduled automatically by the SM-2 algorithm.
                </p>
              )}
            </div>

            <div className="pt-1">
              <button
                onClick={() => navigate('/revision')}
                className="btn-secondary w-full text-xs justify-center cursor-pointer shadow-2xs"
              >
                Open Revision Center
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
