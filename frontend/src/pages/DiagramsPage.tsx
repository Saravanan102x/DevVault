import React, { useState } from 'react'
import {
  FileCode2,
  Upload,
  Trash2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { diagramsStorage } from '../services/diagramsStorage'
import type { ArchitectureDiagram } from '../types'
import { Modal } from '../components/common/Modal'
import { Badge } from '../components/common/Badge'
import { useAccess } from '../context/AccessContext'

export const DiagramsPage: React.FC = () => {
  const { isAdmin } = useAccess()
  const [diagrams, setDiagrams] = useState<ArchitectureDiagram[]>(() => diagramsStorage.getDiagrams())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('ALL')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [viewingDiagram, setViewingDiagram] = useState<ArchitectureDiagram | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  // Upload Form State
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('System Architecture')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string>('')
  const [fileType, setFileType] = useState<'drawio' | 'xml' | 'png' | 'svg'>('png')

  const reloadDiagrams = () => {
    setDiagrams(diagramsStorage.getDiagrams())
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
    let resolvedType: 'drawio' | 'xml' | 'png' | 'svg' = 'png'
    if (ext === 'drawio') resolvedType = 'drawio'
    else if (ext === 'xml') resolvedType = 'xml'
    else if (ext === 'svg') resolvedType = 'svg'
    setFileType(resolvedType)

    if (file.type.startsWith('image/') || ext === 'png' || ext === 'svg') {
      const reader = new FileReader()
      reader.onload = (loadEvent) => {
        setFilePreview(loadEvent.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      const reader = new FileReader()
      reader.onload = (loadEvent) => {
        setFilePreview(loadEvent.target?.result as string)
      }
      reader.readAsText(file)
    }
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) {
      toast.error('Only the owner can upload architecture diagrams.')
      return
    }
    if (!title.trim()) {
      toast.error('Diagram title is required')
      return
    }
    if (!selectedFile && !filePreview) {
      toast.error('Please select a draw.io diagram file (.drawio, .png, .svg, .xml)')
      return
    }

    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean)

    diagramsStorage.create({
      title: title.trim(),
      topic,
      description: description.trim(),
      fileType,
      fileName: selectedFile?.name || 'diagram.drawio',
      fileData: filePreview,
      tags: tagList,
    })

    toast.success('Architecture diagram attached')
    setIsUploadModalOpen(false)
    setTitle('')
    setDescription('')
    setTags('')
    setSelectedFile(null)
    setFilePreview('')
    reloadDiagrams()
  }

  const handleDelete = (id: string, diagTitle: string) => {
    if (!isAdmin) {
      toast.error('Only the owner can delete architecture diagrams.')
      return
    }
    if (confirm(`Remove architecture diagram "${diagTitle}"?`)) {
      diagramsStorage.delete(id)
      toast.success('Diagram deleted')
      reloadDiagrams()
    }
  }

  const topicsList = [
    'ALL',
    'System Architecture',
    'Microservices & APIs',
    'Database & Sharding',
    'JVM & Concurrency',
    'Event Streaming & Kafka',
  ]

  const filteredDiagrams = diagrams.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTopic = selectedTopic === 'ALL' || d.topic === selectedTopic

    return matchesSearch && matchesTopic
  })

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-12">
      {/* Top Header */}
      <div className="border-b border-[#E9EAF0] dark:border-[#262838] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-normal text-[#20212A] dark:text-[#F1F2F6] tracking-tight">
            Architecture Diagrams
          </h1>
          <p className="text-xs text-[#777B8A] dark:text-[#9497A8] mt-0.5">
            Inspect Draw.io diagrams (.drawio, .png, .svg, .xml) categorized by architectural system topic.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-primary text-xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Diagram</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#B0B4C3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search diagrams by title, topic, or tag..."
            className="dev-input w-full pl-8 pr-3 py-1.5 text-xs"
          />
        </div>

        {/* Topics Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {topicsList.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer whitespace-nowrap ${
                selectedTopic === t
                  ? 'bg-[#6C5CE7] text-white font-medium'
                  : 'text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] hover:bg-[#F0EDFF] dark:hover:bg-[#1E202E]'
              }`}
            >
              {t === 'ALL' ? 'All Topics' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Diagrams Grid */}
      {filteredDiagrams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDiagrams.map((d) => (
            <div
              key={d.id}
              className="dev-card p-4 flex flex-col justify-between overflow-hidden group space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2 text-xs">
                  <Badge variant="purple">{d.topic}</Badge>
                  <span className="font-mono text-[10px] text-[#777B8A] uppercase">
                    .{d.fileType}
                  </span>
                </div>

                {/* Preview Thumbnail Container */}
                <div
                  onClick={() => { setViewingDiagram(d); setZoomLevel(1) }}
                  className="h-36 w-full rounded bg-[#F8F9FC] dark:bg-[#14151F] border border-[#E9EAF0] dark:border-[#262838] flex items-center justify-center overflow-hidden cursor-pointer relative group/preview mb-3"
                >
                  {d.fileData && (d.fileType === 'png' || d.fileType === 'svg' || d.fileData.startsWith('data:image')) ? (
                    <img
                      src={d.fileData}
                      alt={d.title}
                      className="max-h-full max-w-full object-contain p-2 group-hover/preview:scale-102 transition-transform duration-150"
                    />
                  ) : (
                    <div className="p-3 text-center space-y-1">
                      <FileCode2 className="w-8 h-8 text-[#6C5CE7] mx-auto opacity-70" />
                      <p className="font-mono text-[11px] text-[#777B8A] truncate max-w-[180px]">{d.fileName}</p>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-[#242522]/30 opacity-0 group-hover/preview:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="px-2.5 py-1 rounded bg-[#6C5CE7] text-white font-medium text-xs flex items-center gap-1 shadow">
                      <Maximize2 className="w-3 h-3" /> Inspect
                    </span>
                  </div>
                </div>

                <h3 className="font-serif text-sm font-medium text-[#20212A] dark:text-[#F1F2F6] group-hover:text-[#6C5CE7] dark:group-hover:text-[#8C7CFF] transition-colors">
                  {d.title}
                </h3>

                {d.description && (
                  <p className="text-[11px] text-[#777B8A] dark:text-[#9497A8] mt-1 line-clamp-2 leading-relaxed">
                    {d.description}
                  </p>
                )}

                {/* Tags */}
                {d.tags && d.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mt-2">
                    {d.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono text-[#777B8A] bg-[#F0EDFF] dark:bg-[#1E202E] px-1.5 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E9EAF0] dark:border-[#262838] text-xs">
                <button
                  onClick={() => { setViewingDiagram(d); setZoomLevel(1) }}
                  className="font-medium text-[#6C5CE7] dark:text-[#8C7CFF] hover:underline flex items-center gap-1 cursor-pointer text-[11px]"
                >
                  <Maximize2 className="w-3 h-3" /> Fullscreen
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(d.id, d.title)}
                    className="p-1 rounded text-[#B0B4C3] hover:text-[#9E3939] transition-colors cursor-pointer"
                    title="Delete diagram"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="dev-card p-10 text-center space-y-2">
          <FileCode2 className="w-8 h-8 text-[#B0B4C3] mx-auto opacity-60" />
          <h3 className="font-serif text-base text-[#20212A] dark:text-[#F1F2F6]">No architecture diagrams attached</h3>
          <p className="text-xs text-[#777B8A] max-w-sm mx-auto">
            Upload Draw.io diagram files (.drawio, .png, .svg, .xml) to neatly document system designs and data pipelines.
          </p>
          {isAdmin && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="btn-primary mt-2 text-xs cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              <span>Upload Diagram</span>
            </button>
          )}
        </div>
      )}

      {/* Upload Diagram Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Architecture Diagram"
        subtitle="Attach .drawio, .png, .svg, or .xml files to specific engineering categories"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A]">Diagram Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Order Checkout Flow & Outbox"
              required
              className="dev-input w-full px-3 py-1.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A]">Topic / Category</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="dev-input w-full px-2.5 py-1.5 text-xs cursor-pointer"
              >
                <option value="System Architecture">System Architecture</option>
                <option value="Microservices & APIs">Microservices & APIs</option>
                <option value="Database & Sharding">Database & Sharding</option>
                <option value="JVM & Concurrency">JVM & Concurrency</option>
                <option value="Event Streaming & Kafka">Event Streaming & Kafka</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A]">Tags (Comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="kafka, postgres, outbox, redis"
                className="dev-input w-full px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A]">Description / Architectural Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="High-level notes on the components, trade-offs, and communication protocols..."
              rows={2}
              className="dev-input w-full p-2.5 text-xs"
            />
          </div>

          {/* File Picker */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A]">Diagram File (.drawio, .png, .svg, .xml) *</label>
            <div className="p-4 border border-dashed border-[#E9EAF0] dark:border-[#262838] rounded text-center bg-[#F8F9FC] dark:bg-[#14151F]">
              <input
                type="file"
                accept=".drawio,.xml,.png,.svg"
                onChange={handleFileChange}
                required
                className="w-full text-xs text-[#777B8A] file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-[#6C5CE7] file:text-white cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E9EAF0] dark:border-[#262838]">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs"
            >
              Save Diagram
            </button>
          </div>
        </form>
      </Modal>

      {/* Fullscreen Interactive Diagram Inspector Modal */}
      {viewingDiagram && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#101118]/95 backdrop-blur-md animate-in fade-in duration-150">
          <div className="h-14 px-5 border-b border-[#262838] flex items-center justify-between shrink-0 bg-[#14151F]">
            <div>
              <span className="text-[10px] font-mono text-[#8C7CFF] uppercase">
                {viewingDiagram.topic}
              </span>
              <h2 className="text-sm font-medium text-[#F1F2F6] truncate">
                {viewingDiagram.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#1E202E] p-0.5 rounded border border-[#262838]">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.2))}
                  className="p-1 rounded text-[#9497A8] hover:text-[#F1F2F6] cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 font-mono text-[11px] text-[#F1F2F6]">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.2))}
                  className="p-1 rounded text-[#9497A8] hover:text-[#F1F2F6] cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1 rounded text-[#9497A8] hover:text-[#F1F2F6] cursor-pointer"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setViewingDiagram(null)}
                className="p-1.5 rounded bg-[#1E202E] hover:bg-[#262838] text-[#9497A8] hover:text-[#F1F2F6] cursor-pointer ml-1"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6 flex items-center justify-center custom-scrollbar">
            {viewingDiagram.fileData && (viewingDiagram.fileType === 'png' || viewingDiagram.fileType === 'svg' || viewingDiagram.fileData.startsWith('data:image')) ? (
              <img
                src={viewingDiagram.fileData}
                alt={viewingDiagram.title}
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                className="max-w-none transition-transform duration-120 rounded border border-[#262838] shadow-2xl"
              />
            ) : (
              <div className="max-w-2xl w-full p-4 rounded bg-[#14151F] border border-[#262838] text-left font-mono text-xs text-[#F1F2F6] overflow-auto max-h-[70vh]">
                <div className="text-[#8C7CFF] font-semibold mb-2">Draw.io XML:</div>
                <pre className="whitespace-pre-wrap">{viewingDiagram.fileData}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
