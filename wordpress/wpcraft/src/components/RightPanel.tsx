import { useState } from 'react'
import { Section, Element, Selection } from '../types/schema'
import ElementSettings from './ElementSettings'
import SectionSettings from './SectionSettings'

interface Props {
  selection: Selection | null
  selectedSection: Section | null
  selectedElement: Element | null
  onUpdateSection: (
    updates: Partial<Section>
  ) => void
  onUpdateElement: (
    updates: Partial<Element>
  ) => void
  onRefine: (prompt: string) => Promise<void>
}

export default function RightPanel({
  selection,
  selectedSection,
  selectedElement,
  onUpdateSection,
  onUpdateElement,
  onRefine
}: Props) {

  const [prompt, setPrompt] = useState('')
  const [refining, setRefining] = useState(false)
  const [error, setError] = useState('')

  const handleRefine = async () => {
    if (!prompt.trim() || refining) return
    setRefining(true)
    setError('')
    try {
      await onRefine(prompt)
      setPrompt('')
    } catch (err: any) {
      setError(err.message || 'Refinement failed')
    } finally {
      setRefining(false)
    }
  }

  // Nothing selected
  if (!selection) {
    return (
      <div className="w-64 bg-[#141414] 
        border-l border-white/10 
        flex items-center justify-center 
        flex-shrink-0">
        <p className="text-xs text-white/30 
          text-center px-6 leading-relaxed">
          Click any section or element
          to edit its settings
        </p>
      </div>
    )
  }

  return (
    <div className="w-64 bg-[#141414] 
      border-l border-white/10 
      flex flex-col flex-shrink-0">
      
      {/* Header */}
      <div className="px-3 py-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-white/30">
            {selection.type === 'element' ? '◈ Element' : '▭ Section'}
          </span>
          <span className="text-xs font-medium text-white/70 capitalize">
            {selection.type === 'element'
              ? selectedElement?.type || ''
              : selectedSection?.type || ''}
          </span>
        </div>

        {/* AI Assistant Input */}
        <div className="relative group">
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRefine()
            }}
            placeholder="✨ Modify with AI..."
            className="w-full bg-black/40 border border-white/5 
              rounded-lg pl-3 pr-8 py-2 text-xs text-white
              placeholder:text-white/20 focus:outline-none 
              focus:border-green-500/50 focus:bg-black/60
              transition-all"
            disabled={refining}
          />
          {refining ? (
            <div className="absolute right-2.5 top-2.5">
              <div className="w-3.5 h-3.5 border-2 border-green-500/30 
                border-t-green-500 rounded-full animate-spin"/>
            </div>
          ) : (
            <button
              onClick={handleRefine}
              disabled={!prompt.trim()}
              className="absolute right-2 top-1.5 p-1 
                text-green-500 hover:text-green-400
                disabled:opacity-20 disabled:hover:text-green-500
                transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          )}
        </div>
        {error && (
          <p className="text-[10px] text-red-400 mt-1.5 px-1">{error}</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {selection.type === 'element' && 
         selectedElement ? (
          <ElementSettings
            element={selectedElement}
            onUpdate={onUpdateElement}
          />
        ) : selectedSection ? (
          <SectionSettings
            section={selectedSection}
            onUpdate={onUpdateSection}
          />
        ) : null}
      </div>
    </div>
  )
}
