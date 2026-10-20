import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownViewerProps {
  content: string
  className?: string
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, className = '' }) => {
  if (!content) {
    return <p className="text-[#B0B4C3] dark:text-[#777B8A] italic text-xs">No content provided.</p>
  }

  return (
    <div className={`prose dark:prose-invert max-w-none text-[#20212A] dark:text-[#F1F2F6] text-[13.5px] leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1({ children }) {
            return <h1 className="font-serif text-2xl font-normal text-[#20212A] dark:text-[#F1F2F6] mt-6 mb-3 tracking-tight">{children}</h1>
          },
          h2({ children }) {
            return <h2 className="font-serif text-xl font-normal text-[#20212A] dark:text-[#F1F2F6] mt-5 mb-2.5 pb-1 border-b border-[#E9EAF0] dark:border-[#262838]">{children}</h2>
          },
          h3({ children }) {
            return <h3 className="font-serif text-base font-medium text-[#20212A] dark:text-[#F1F2F6] mt-4 mb-2">{children}</h3>
          },
          p({ children }) {
            return <p className="mb-3 text-[#20212A] dark:text-[#F1F2F6] leading-relaxed">{children}</p>
          },
          blockquote({ children }) {
            return (
              <blockquote className="my-3 pl-3.5 border-l-2 border-[#6C5CE7] dark:border-[#8C7CFF] italic text-[#777B8A] dark:text-[#9497A8]">
                {children}
              </blockquote>
            )
          },
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match && typeof children === 'string' && !children.includes('\n')
            return isInline ? (
              <code className="px-1.5 py-0.5 rounded bg-[#F0EDFF] dark:bg-[#1E202E] text-[#6C5CE7] dark:text-[#63E2A3] font-mono text-xs border border-[#E9EAF0] dark:border-[#262838]" {...props}>
                {children}
              </code>
            ) : (
              <pre className="p-3.5 my-3 rounded-md bg-[#F8F9FC] dark:bg-[#14151F] border border-[#E9EAF0] dark:border-[#262838] overflow-x-auto text-xs font-mono text-[#20212A] dark:text-[#F1F2F6]">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            )
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3">
                <table className="min-w-full divide-y divide-[#E9EAF0] dark:divide-[#262838] border border-[#E9EAF0] dark:border-[#262838] text-xs">
                  {children}
                </table>
              </div>
            )
          },
          th({ children }) {
            return <th className="px-3 py-2 bg-[#F8F9FC] dark:bg-[#14151F] text-left text-xs font-medium text-[#20212A] dark:text-[#F1F2F6] border-b border-[#E9EAF0] dark:border-[#262838]">{children}</th>
          },
          td({ children }) {
            return <td className="px-3 py-2 border-t border-[#E9EAF0] dark:border-[#262838] text-xs text-[#20212A] dark:text-[#F1F2F6]">{children}</td>
          },
          ul({ children }) {
            return <ul className="list-disc list-inside space-y-1 my-2 text-[#20212A] dark:text-[#F1F2F6]">{children}</ul>
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside space-y-1 my-2 text-[#20212A] dark:text-[#F1F2F6]">{children}</ol>
          },
          a({ href, children }) {
            const isSafe = href && /^(https?:|\/|#|mailto:)/i.test(href)
            const safeHref = isSafe ? href : '#'
            return (
              <a
                href={safeHref}
                target={isSafe && href?.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="text-[#6C5CE7] dark:text-[#8C7CFF] underline underline-offset-2 hover:opacity-80"
              >
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
