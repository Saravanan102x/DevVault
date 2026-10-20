import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'easy' | 'medium' | 'hard' | 'solved' | 'attempted' | 'revision' | 'purple' | 'cyan' | 'amber' | 'teal' | 'emerald' | 'blue' | 'olive'
  size?: 'sm' | 'md'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[11px] font-medium' : 'px-2 py-0.5 text-xs font-medium'

  // Version 3: Clean, crisp, modern pastel chips with high contrast
  const variantClasses: Record<string, string> = {
    default: 'bg-[#F2F3F7] dark:bg-[#202230] text-[#4E5162] dark:text-[#C5C8D8] border border-[#E3E5EE] dark:border-[#2D3043]',
    easy: 'bg-[#EDFDF5] dark:bg-[#0E281C] text-[#127C4B] dark:text-[#63E2A3] border border-[#C5F3DB] dark:border-[#184631]',
    medium: 'bg-[#FFF9EB] dark:bg-[#2D2109] text-[#A66E08] dark:text-[#F9C967] border border-[#FDE5B5] dark:border-[#4E390F]',
    hard: 'bg-[#FFF1F2] dark:bg-[#311116] text-[#C52B3C] dark:text-[#F8717F] border border-[#FED0D5] dark:border-[#551E26]',
    solved: 'bg-[#EDFDF5] dark:bg-[#0E281C] text-[#127C4B] dark:text-[#63E2A3] border border-[#C5F3DB] dark:border-[#184631]',
    attempted: 'bg-[#F2F3F7] dark:bg-[#202230] text-[#4E5162] dark:text-[#C5C8D8] border border-[#E3E5EE] dark:border-[#2D3043]',
    revision: 'bg-[#F0EDFF] dark:bg-[#231B3D] text-[#5A4BD1] dark:text-[#B8AFFF] border border-[#DDD6FE] dark:border-[#3F3169]',
    purple: 'bg-[#F0EDFF] dark:bg-[#231B3D] text-[#5A4BD1] dark:text-[#B8AFFF] border border-[#DDD6FE] dark:border-[#3F3169]',
    blue: 'bg-[#EFF6FF] dark:bg-[#132238] text-[#1D4ED8] dark:text-[#93C5FD] border border-[#BFDBFE] dark:border-[#1E3A66]',
    teal: 'bg-[#F0FDFA] dark:bg-[#0D2826] text-[#0D9488] dark:text-[#5EEAD4] border border-[#CCFBF1] dark:border-[#174A45]',
    cyan: 'bg-[#ECFEFF] dark:bg-[#0E2730] text-[#0891B2] dark:text-[#67E8F9] border border-[#CFFAFE] dark:border-[#164755]',
    emerald: 'bg-[#EDFDF5] dark:bg-[#0E281C] text-[#127C4B] dark:text-[#63E2A3] border border-[#C5F3DB] dark:border-[#184631]',
    amber: 'bg-[#FFF9EB] dark:bg-[#2D2109] text-[#A66E08] dark:text-[#F9C967] border border-[#FDE5B5] dark:border-[#4E390F]',
    olive: 'bg-[#F4F6F0] dark:bg-[#1F2519] text-[#495B30] dark:text-[#B5CA9D] border border-[#DCE4D2] dark:border-[#323D28]',
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-md tracking-tight ${sizeClasses} ${variantClasses[variant] || variantClasses.default} ${className}`}>
      {children}
    </span>
  )
}

export const DifficultyBadge: React.FC<{ difficulty?: string }> = ({ difficulty }) => {
  switch (difficulty?.toUpperCase()) {
    case 'EASY':
      return <Badge variant="easy">Easy</Badge>
    case 'MEDIUM':
      return <Badge variant="medium">Medium</Badge>
    case 'HARD':
      return <Badge variant="hard">Hard</Badge>
    default:
      return <Badge variant="default">General</Badge>
  }
}

export const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  switch (status?.toUpperCase()) {
    case 'SOLVED':
      return <Badge variant="solved">Solved</Badge>
    case 'ATTEMPTED':
      return <Badge variant="attempted">Attempted</Badge>
    case 'NEEDS_REVISION':
      return <Badge variant="revision">Needs Revision</Badge>
    case 'NOT_STARTED':
    default:
      return <Badge variant="default">Pending</Badge>
  }
}
