import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Upload,
  BookOpen,
  Trash2,
  ExternalLink,
  Video,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAccess } from '../../context/AccessContext'

export interface UserDailyTechTopic {
  id: string
  date: string // YYYY-MM-DD
  topic: string
  whatILearnt: string
  referenceUrl?: string
  createdAt: string
}

const STORAGE_KEY = 'devvault_user_daily_tech_topics'

export const DailyTechTopicCard: React.FC = () => {
  const { isAdmin } = useAccess()
  const todayStr = new Date().toISOString().split('T')[0]

  // Form State
  const [topicDate, setTopicDate] = useState(todayStr)
  const [topicTitle, setTopicTitle] = useState('')
  const [whatILearnt, setWhatILearnt] = useState('')
  const [referenceUrl, setReferenceUrl] = useState('')
  const [showHistory, setShowHistory] = useState(true)

  // Uploaded Topics State (Stored in localStorage)
  const [uploadedTopics, setUploadedTopics] = useState<UserDailyTechTopic[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch {
      // fallback
    }
    return []
  })

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(uploadedTopics))
    } catch {
      // ignore
    }
  }, [uploadedTopics])

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topicTitle.trim()) {
      toast.error('Please enter the Tech Topic name')
      return
    }
    if (!whatILearnt.trim()) {
      toast.error('Please write what you learned')
      return
    }

    const newTopic: UserDailyTechTopic = {
      id: `topic-${Date.now()}`,
      date: topicDate || todayStr,
      topic: topicTitle.trim(),
      whatILearnt: whatILearnt.trim(),
      referenceUrl: referenceUrl.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    setUploadedTopics((prev) => [newTopic, ...prev])
    setTopicTitle('')
    setWhatILearnt('')
    setReferenceUrl('')
    toast.success('Your Daily Tech Topic uploaded successfully! 🔥')
  }

  const handleDelete = (id: string, topicName?: string) => {
    if (window.confirm(`Delete topic log "${topicName || 'this item'}"?`)) {
      setUploadedTopics((prev) => prev.filter((t) => t.id !== id))
      toast.success('Topic removed')
    }
  }

  // YouTube parser with strict ID validation
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

  return (
    <div className="dev-card p-4 sm:p-5 space-y-4 border-[#6C5CE7]/30 dark:border-[#8C7CFF]/30 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E9EAF0] dark:border-[#262838]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-2xs">
            <BookOpen className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#20212A] dark:text-[#F1F2F6] flex items-center gap-2">
              Daily One Tech Topic
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold uppercase">
                Personal Log
              </span>
            </h3>
            <p className="text-[11px] text-[#777B8A] dark:text-[#9497A8] font-medium">
              Upload what you learned today with date and reference links.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-[#6C5CE7] dark:text-[#8C7CFF] bg-[#F0EDFF] dark:bg-[#1E202E] px-2.5 py-1 rounded-lg border border-[#6C5CE7]/20">
          {uploadedTopics.length} Logged
        </span>
      </div>

      {/* Upload Form (Admin Only) */}
      {isAdmin ? (
        <form onSubmit={handleUpload} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Date Picker */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8] font-bold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#6C5CE7]" />
                <span>Date *</span>
              </label>
              <input
                type="date"
                value={topicDate}
                onChange={(e) => setTopicDate(e.target.value)}
                className="dev-input w-full px-3 py-1.5 text-xs font-bold cursor-pointer"
                required
              />
            </div>

            {/* Tech Topic Name */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8] font-bold">
                Tech Topic Name *
              </label>
              <input
                type="text"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                placeholder="e.g. Java 21 Virtual Threads, Kafka Consumer Lag, Redis Caching, etc."
                className="dev-input w-full px-3 py-1.5 text-xs font-bold"
                required
              />
            </div>
          </div>

          {/* What I Learnt */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A] dark:text-[#9497A8] font-bold flex items-center justify-between">
              <span>What I Learnt Today (My Takeaway & Summary) *</span>
              <span className="text-[10px] lowercase text-[#777B8A]">markdown supported</span>
            </label>
            <textarea
              value={whatILearnt}
              onChange={(e) => setWhatILearnt(e.target.value)}
              placeholder="Type your notes, architectural takeaways, code examples, or trade-offs that you mastered today..."
              rows={4}
              className="dev-input w-full p-3 text-xs leading-relaxed font-medium"
              required
            />
          </div>

          {/* Reference URL & Submit Button */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="sm:col-span-3">
              <input
                type="url"
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
                placeholder="Reference link (YouTube video tutorial, official documentation, deep-dive article)"
                className="dev-input w-full px-3 py-1.5 text-xs font-mono"
              />
            </div>
            <button
              type="submit"
              className="btn-primary text-xs w-full py-1.5 flex items-center justify-center gap-1.5 cursor-pointer font-bold shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Topic</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="px-3.5 py-2.5 rounded-xl bg-[#F0EDFF]/50 dark:bg-[#1E202E]/60 border border-[#6C5CE7]/20 flex items-center justify-between">
          <p className="text-xs text-[#5D5F74] dark:text-[#A6A9BC]">
            Viewing uploaded tech topics in <span className="font-bold text-[#6C5CE7] dark:text-[#8C7CFF]">Read-Only Mode</span>.
          </p>
          <span className="text-[11px] font-mono text-[#777B8A]">Admin restricted</span>
        </div>
      )}

      {/* Uploaded Daily Tech Topics List */}
      <div className="pt-2 border-t border-[#E9EAF0] dark:border-[#262838] space-y-2">
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center justify-between w-full text-xs font-bold text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6] cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>My Uploaded Daily Tech Topics ({uploadedTopics.length})</span>
          </span>
          {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showHistory && (
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-1 animate-fade-in">
            {uploadedTopics.length > 0 ? (
              uploadedTopics.map((item) => {
                const ytId = item.referenceUrl ? getYouTubeId(item.referenceUrl) : null

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#F8F9FC] dark:bg-[#1A1C28] border border-[#E9EAF0] dark:border-[#2A2C3E] text-xs space-y-2 group hover:border-[#6C5CE7]/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {item.date}
                          </span>
                          <h4 className="text-sm font-bold text-[#20212A] dark:text-[#F1F2F6]">
                            {item.topic}
                          </h4>
                        </div>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(item.id, item.topic)}
                          className="text-gray-400 hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                          title="Delete topic"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-[#3A3D4D] dark:text-[#C4C7D8] leading-relaxed whitespace-pre-wrap font-medium pl-1 border-l-2 border-[#6C5CE7]/40">
                      {item.whatILearnt}
                    </p>

                    {/* Reference Link / YouTube Video Embed */}
                    {item.referenceUrl && isSafeUrl(item.referenceUrl) && (
                      <div className="pt-1">
                        {ytId ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold flex items-center gap-1 text-rose-600 dark:text-rose-400">
                                <Video className="w-3 h-3" /> YouTube Video Reference
                              </span>
                              <a
                                href={item.referenceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#6C5CE7] hover:underline flex items-center gap-1 font-semibold"
                              >
                                <span>Watch on YouTube</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div className="aspect-video max-w-md rounded-lg overflow-hidden border border-[#E9EAF0] dark:border-[#262838]">
                              <iframe
                                src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                                title={`YouTube reference for ${item.topic}`}
                                className="w-full h-full"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        ) : (
                          <a
                            href={item.referenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#6C5CE7] dark:text-[#8C7CFF] hover:underline font-bold bg-[#F0EDFF] dark:bg-[#1E202E] px-2 py-0.5 rounded"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Reference: {item.referenceUrl.replace(/^https?:\/\/(www\.)?/, '').slice(0, 45)}...</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="py-6 text-center text-xs text-[#777B8A] dark:text-[#9497A8] italic">
                No topics uploaded yet. Enter what you learned today above and click "Upload Topic"!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
