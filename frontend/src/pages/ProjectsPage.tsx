import React, { useState } from 'react'
import {
  FolderGit2,
  ExternalLink,
  Plus,
  Star,
  Trash2,
  Edit3,
  Search,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { projectsStorage } from '../services/projectsStorage'
import type { Project, ProjectStatus } from '../types'
import { Modal } from '../components/common/Modal'
import { Badge } from '../components/common/Badge'
import { useAccess } from '../context/AccessContext'

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
)

export const ProjectsPage: React.FC = () => {
  const { isAdmin } = useAccess()
  const [projects, setProjects] = useState<Project[]>(() => projectsStorage.getProjects())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  // Form State
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formTags, setFormTags] = useState('')
  const [formGithubUrl, setFormGithubUrl] = useState('')
  const [formLiveUrl, setFormLiveUrl] = useState('')
  const [formStatus, setFormStatus] = useState<ProjectStatus>('IN_PROGRESS')
  const [formFeatured, setFormFeatured] = useState(false)

  const reloadProjects = () => {
    setProjects(projectsStorage.getProjects())
  }

  const handleOpenCreateModal = () => {
    if (!isAdmin) {
      toast.error('Only the owner can add projects.')
      return
    }
    setEditingProject(null)
    setFormTitle('')
    setFormDescription('')
    setFormTags('')
    setFormGithubUrl('')
    setFormLiveUrl('')
    setFormStatus('IN_PROGRESS')
    setFormFeatured(false)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (proj: Project) => {
    if (!isAdmin) {
      toast.error('Only the owner can edit projects.')
      return
    }
    setEditingProject(proj)
    setFormTitle(proj.title)
    setFormDescription(proj.description)
    setFormTags(proj.tags.join(', '))
    setFormGithubUrl(proj.githubUrl || '')
    setFormLiveUrl(proj.liveUrl || '')
    setFormStatus(proj.status)
    setFormFeatured(proj.featured)
    setIsModalOpen(true)
  }

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) {
      toast.error('Only the owner can add or modify projects.')
      return
    }
    if (!formTitle.trim()) {
      toast.error('Project title is required')
      return
    }

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    if (editingProject) {
      projectsStorage.update(editingProject.id, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        tags: tagsArray,
        githubUrl: formGithubUrl.trim(),
        liveUrl: formLiveUrl.trim(),
        status: formStatus,
        featured: formFeatured,
      })
      toast.success('Project updated')
    } else {
      projectsStorage.create({
        title: formTitle.trim(),
        description: formDescription.trim(),
        tags: tagsArray,
        githubUrl: formGithubUrl.trim(),
        liveUrl: formLiveUrl.trim(),
        status: formStatus,
        featured: formFeatured,
      })
      toast.success('Project added')
    }

    setIsModalOpen(false)
    reloadProjects()
  }

  const handleDeleteProject = (id: string, title: string) => {
    if (!isAdmin) {
      toast.error('Only the owner can delete projects.')
      return
    }
    if (confirm(`Delete project "${title}"?`)) {
      projectsStorage.delete(id)
      toast.success('Project removed')
      reloadProjects()
    }
  }

  const handleToggleFeatured = (id: string) => {
    if (!isAdmin) return
    projectsStorage.toggleFeatured(id)
    reloadProjects()
  }

  const filteredProjects = projects.filter((p) => {
    const matchesQuery =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus

    return matchesQuery && matchesStatus
  })

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-12">
      {/* Top Header */}
      <div className="border-b border-[#E9EAF0] dark:border-[#262838] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-normal text-[#20212A] dark:text-[#F1F2F6] tracking-tight">
            Projects Showcase
          </h1>
          <p className="text-xs text-[#777B8A] dark:text-[#9497A8] mt-0.5">
            Curated repositories, production services, and system architectures with live GitHub links.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreateModal}
            className="btn-primary text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#B0B4C3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name or technology..."
            className="dev-input w-full pl-8 pr-3 py-1.5 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['ALL', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                selectedStatus === status
                  ? 'bg-[#6C5CE7] text-white font-medium'
                  : 'text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] hover:bg-[#F0EDFF] dark:hover:bg-[#1E202E]'
              }`}
            >
              {status === 'ALL' ? 'All Projects' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="dev-card p-4 flex flex-col justify-between overflow-hidden group space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={p.status === 'COMPLETED' ? 'easy' : 'default'} size="sm">
                    {p.status.replace('_', ' ')}
                  </Badge>

                  {isAdmin && (
                    <button
                      onClick={() => handleToggleFeatured(p.id)}
                      className="p-1 text-[#B0B4C3] hover:text-[#8C6422] transition-colors cursor-pointer"
                      title={p.featured ? 'Remove from featured' : 'Pin to featured'}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          p.featured ? 'fill-[#8C6422] text-[#8C6422]' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>

                <h3 className="font-serif text-base font-medium text-[#20212A] dark:text-[#F1F2F6] group-hover:text-[#6C5CE7] dark:group-hover:text-[#8C7CFF] transition-colors">
                  {p.title}
                </h3>

                <p className="text-xs text-[#777B8A] dark:text-[#9497A8] mt-1 line-clamp-3 leading-relaxed">
                  {p.description}
                </p>

                {p.tags && p.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mt-2.5">
                    {p.tags.map((tag) => (
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

              {/* Bottom links and edit */}
              <div className="pt-3 border-t border-[#E9EAF0] dark:border-[#262838] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {p.githubUrl && (
                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6C5CE7] dark:text-[#8C7CFF] hover:underline flex items-center gap-1 font-medium"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </a>
                  )}
                  {p.liveUrl && (
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6C5CE7] dark:text-[#8C7CFF] hover:underline flex items-center gap-1 font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live</span>
                    </a>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="p-1 text-[#777B8A] hover:text-[#20212A] transition-colors cursor-pointer"
                      title="Edit project"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(p.id, p.title)}
                      className="p-1 text-[#B0B4C3] hover:text-[#9E3939] transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="dev-card p-10 text-center space-y-2">
          <FolderGit2 className="w-8 h-8 text-[#B0B4C3] mx-auto opacity-60" />
          <h3 className="font-serif text-base text-[#20212A] dark:text-[#F1F2F6]">No projects found</h3>
          <p className="text-xs text-[#777B8A] max-w-sm mx-auto">
            Attach GitHub repositories, open-source work, and system design showcases.
          </p>
          {isAdmin && (
            <button
              onClick={handleOpenCreateModal}
              className="btn-primary mt-2 text-xs cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add First Project</span>
            </button>
          )}
        </div>
      )}

      {/* Modal: Add/Edit Project */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Attach Project'}
        subtitle="Record GitHub repositories and system blueprints"
      >
        <form onSubmit={handleSaveProject} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A]">Project Name *</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Distributed Task Scheduler with Kafka"
              required
              className="dev-input w-full px-3 py-1.5 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#777B8A]">Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="System architectural trade-offs, technologies used, and concurrency design..."
              rows={3}
              className="dev-input w-full p-2.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A]">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as ProjectStatus)}
                className="dev-input w-full px-2.5 py-1.5 text-xs cursor-pointer"
              >
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A]">Technologies / Tags</label>
              <input
                type="text"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="java, spring-boot, kafka, redis"
                className="dev-input w-full px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A]">GitHub Repository URL</label>
              <input
                type="text"
                value={formGithubUrl}
                onChange={(e) => setFormGithubUrl(e.target.value)}
                placeholder="https://github.com/user/repo"
                className="dev-input w-full px-3 py-1.5 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#777B8A]">Live Demo / Docs URL</label>
              <input
                type="text"
                value={formLiveUrl}
                onChange={(e) => setFormLiveUrl(e.target.value)}
                placeholder="https://app.demo.io"
                className="dev-input w-full px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="formFeatured"
              checked={formFeatured}
              onChange={(e) => setFormFeatured(e.target.checked)}
              className="rounded accent-[#6C5CE7]"
            />
            <label htmlFor="formFeatured" className="text-xs text-[#20212A] dark:text-[#F1F2F6] cursor-pointer">
              Pin to Featured Projects on Dashboard
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E9EAF0] dark:border-[#262838]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs">
              {editingProject ? 'Save Changes' : 'Attach Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
