import React, { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, keymap } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { java } from '@codemirror/lang-java'
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language'
import { Copy, Check } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  minHeight?: string
  language?: string
}

// Version 3 Refined Dark Theme for CodeMirror
const darkTheme = EditorView.theme({
  '&': {
    color: '#F1F2F6',
    backgroundColor: '#14151F',
    fontSize: '13px',
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
  },
  '.cm-content': {
    caretColor: '#8C7CFF',
    padding: '12px 0',
  },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#8C7CFF', borderWidth: '2px' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'rgba(140, 124, 255, 0.25) !important',
  },
  '.cm-gutters': {
    backgroundColor: '#101118',
    color: '#5C6075',
    borderRight: '1px solid #262838',
    paddingRight: '8px',
  },
  '.cm-activeLine': { backgroundColor: 'rgba(255, 255, 255, 0.03)' },
  '.cm-activeLineGutter': { backgroundColor: '#1A1C29', color: '#8C7CFF' },
}, { dark: true })

// Version 3 Light Theme for CodeMirror (#FAFAFD background per spec)
const lightTheme = EditorView.theme({
  '&': {
    color: '#20212A',
    backgroundColor: '#FAFAFD',
    fontSize: '13px',
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
  },
  '.cm-content': {
    caretColor: '#6C5CE7',
    padding: '12px 0',
  },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#6C5CE7', borderWidth: '2px' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'rgba(108, 92, 231, 0.16) !important',
  },
  '.cm-gutters': {
    backgroundColor: '#F3F4F9',
    color: '#8C90A2',
    borderRight: '1px solid #E9EAF0',
    paddingRight: '8px',
  },
  '.cm-activeLine': { backgroundColor: 'rgba(108, 92, 231, 0.04)' },
  '.cm-activeLineGutter': { backgroundColor: '#EBEBFA', color: '#6C5CE7', fontWeight: '600' },
}, { dark: false })

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  minHeight = '240px',
}) => {
  const { theme } = useTheme()
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [copied, setCopied] = React.useState(false)

  useEffect(() => {
    if (!editorRef.current) return

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && onChange) {
        onChange(update.state.doc.toString())
      }
    })

    const activeThemeExtension = theme === 'dark' ? darkTheme : lightTheme

    const state = EditorState.create({
      doc: value || '',
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        bracketMatching(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        java(),
        activeThemeExtension,
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        updateListener,
        EditorView.editable.of(!readOnly),
        EditorState.readOnly.of(readOnly),
      ],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
    }
  }, [readOnly, theme])

  useEffect(() => {
    if (viewRef.current) {
      const currentDoc = viewRef.current.state.doc.toString()
      if (value !== currentDoc) {
        viewRef.current.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: value || '' },
        })
      }
    }
  }, [value])

  const copyCode = () => {
    navigator.clipboard.writeText(value || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative rounded-lg border border-[#E9EAF0] dark:border-[#262838] bg-[#FAFAFD] dark:bg-[#14151F] overflow-hidden shadow-2xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#F5F6FA] dark:bg-[#101118] border-b border-[#E9EAF0] dark:border-[#262838] text-xs text-[#777B8A] dark:text-[#9497A8]">
        <span className="font-mono text-[11px] text-[#6C5CE7] dark:text-[#8C7CFF] font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] dark:bg-[#8C7CFF]"></span>
          Java 21 Solution
        </span>
        <button
          onClick={copyCode}
          type="button"
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6] hover:bg-[#EAEBF2] dark:hover:bg-[#202230] transition-colors cursor-pointer text-[11px]"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#127C4B] dark:text-[#63E2A3]" />
              <span className="text-[#127C4B] dark:text-[#63E2A3] font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div
        ref={editorRef}
        style={{ minHeight }}
        className="w-full text-xs font-mono overflow-auto custom-scrollbar"
      />
    </div>
  )
}
