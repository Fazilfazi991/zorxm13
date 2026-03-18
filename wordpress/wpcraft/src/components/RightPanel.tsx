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

  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai')
  const [prompt, setPrompt] = useState('')
  const [refining, setRefining] = useState(false)
  const [error, setError] = useState('')

  const handleRefine = async (textToRefine: string) => {
    if (!textToRefine.trim() || refining) return
    setRefining(true)
    setError('')
    try {
      await onRefine(textToRefine)
      if (textToRefine === prompt) {
        setPrompt('')
      }
    } catch (err: any) {
      setError(err.message || 'Refinement failed')
    } finally {
      setRefining(false)
    }
  }

  // Nothing selected
  if (!selection) {
    return (
      <div className="w-[300px] bg-[#141414] 
        border-l border-white/10 
        flex items-center justify-center 
        flex-shrink-0">
        <p className="text-xs text-white/30 
          text-center px-6 leading-relaxed">
          Click any section or element
          to open AI Assistant
        </p>
      </div>
    )
  }

  const isEl = selection.type === 'element'
  const typeLabel = isEl ? 'Element settings' : 'Section settings'
  const nameLabel = isEl ? selectedElement?.type : selectedSection?.type

  return (
    <div className="w-[300px] bg-[#141414] 
      border-l border-white/10 
      flex flex-col flex-shrink-0">
      
      {/* Header Context Bar */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 bg-white/[0.02]">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
        <span className="text-xs font-medium text-white/50">
          {typeLabel} — <span className="capitalize text-white/90">{nameLabel}</span>
        </span>
      </div>

      {/* Tabs */}
      <div className="p-3 border-b border-white/10 bg-black/20">
        <div className="flex bg-white/5 rounded-lg p-1 gap-1 border border-white/5">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'ai' 
                ? 'bg-[#2a2a2a] text-white shadow-sm border border-white/10' 
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            ✦ AI Assistant
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'manual' 
                ? 'bg-[#2a2a2a] text-white shadow-sm border border-white/10' 
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            Manual
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'ai' ? (
          <div className="p-4 flex flex-col gap-6">
            
            {/* Prompt Box */}
            <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-white/20 transition-all">
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Describe what you want... e.g. Add a wave divider at the bottom"
                className="w-full h-24 p-3 text-sm resize-none bg-transparent text-white focus:outline-none placeholder:text-white/30"
                disabled={refining}
              />
              <div className="p-2 pt-0 flex justify-end">
                <button
                  onClick={() => handleRefine(prompt)}
                  disabled={!prompt.trim() || refining}
                  className="px-4 py-1.5 bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white hover:bg-white/20 disabled:opacity-30 transition-all flex items-center gap-2"
                >
                  {refining ? 'Thinking...' : 'Refine →'}
                </button>
              </div>
            </div>
            
            {error && (
              <p className="text-[11px] text-red-400 mt-[-12px] px-1">{error}</p>
            )}

            {/* Quick Prompts */}
            <div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">
                Quick prompts
              </p>
              <div className="flex flex-col gap-2">
                {[
                  'Add a wave divider at the bottom',
                  'Make this section darker and more dramatic',
                  'Improve the heading typography',
                  'Add a CTA button below the subtitle'
                ].map((txt, i) => (
                  <button
                    key={i}
                    onClick={() => handleRefine(txt)}
                    disabled={refining}
                    className="text-left px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs hover:bg-white/10 transition-all text-white/70 hover:text-white disabled:opacity-30"
                  >
                    {txt}
                  </button>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="p-0">
            {isEl && selectedElement ? (
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
        )}
      </div>
    </div>
  )
}
