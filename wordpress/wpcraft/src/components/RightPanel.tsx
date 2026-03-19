import { useState, useEffect, useRef } from 'react'
import { Section, Element, Selection } from '../types/schema'
import ElementSettings from './ElementSettings'
import SectionSettings from './SectionSettings'

interface Props {
  selection: Selection | null
  selectedSection: Section | null
  selectedElement: Element | null
  onUpdateSection: (updates: Partial<Section>) => void
  onUpdateElement: (updates: Partial<Element>) => void
  onRefine: (prompt: string) => Promise<any>
  onPreviewChange: (hasPreview: boolean, pendingData?: any) => void
  onApplyAI: () => void
  onDiscardAI: () => void
}

export default function RightPanel({
  selection,
  selectedSection,
  selectedElement,
  onUpdateSection,
  onUpdateElement,
  onRefine,
  onPreviewChange,
  onApplyAI,
  onDiscardAI
}: Props) {

  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai')
  const [prompt, setPrompt] = useState('')
  const promptRef = useRef('')
  const [refining, setRefining] = useState(false)
  const [error, setError] = useState('')
  
  const [pendingResult, setPendingResult] = useState<any>(null)
  const [credits, setCredits] = useState<number | null>(null)

  const fetchCredits = async () => {
    try {
      const config = (window as any).WPCRAFT_CONFIG
      const res = await fetch(config.apiBase + 'credits', {
        headers: { 'X-WP-Nonce': config.nonce }
      })
      if (res.ok) {
        const data = await res.json()
        setCredits(data.credits)
      }
    } catch (e) {}
  }

  useEffect(() => {
    fetchCredits()
  }, [])

  const handleRefine = async (textToRefine: string) => {
    if (!textToRefine.trim() || refining) return
    setRefining(true)
    setError('')
    try {
      console.log('REFINE FLOW: starting onRefine with prompt:', textToRefine)
      const result = await onRefine(textToRefine)
      console.log('REFINE FLOW: raw result from onRefine:', result)
      
      if (result !== null && result !== undefined) {
        setPendingResult(result)
        console.log('REFINE FLOW: pendingResult set to:', result)
        onPreviewChange(true, result)
        if (textToRefine === prompt || textToRefine === promptRef.current) {
          setPrompt('')
          promptRef.current = ''
        }
      } else {
        console.log('REFINE FLOW: result was falsy:', result)
      }
    } catch (err: any) {
      console.error('REFINE FLOW: Error caught:', err)
      if (err.message === '402') {
        setError('No credits remaining. Upgrade at zorxm13.vercel.app/pricing')
      } else {
        setError(err.message || 'Connection error. Please try again.')
      }
    } finally {
      setRefining(false)
      fetchCredits()
    }
  }

  const getQuickPrompts = () => {
    if (selection?.type === 'element') {
      const elType = selectedElement?.type
      if (elType === 'heading') return [
        "Make this heading more impactful",
        "Shorten this to one punchy line",
        "Add a red accent word",
        "Change font weight to bold"
      ]
      if (elType === 'button') return [
        "Make this button more prominent",
        "Add an arrow icon after the text",
        "Change to outline style",
        "Make it full width"
      ]
      if (elType === 'text') return [
        "Make this more concise",
        "Make this sound more professional",
        "Break into bullet points",
        "Add more detail and expand this"
      ]
      return [
        "Improve this element's design",
        "Make this standout more",
        "Adjust the spacing",
        "Change the colors"
      ]
    }
    
    return [
      "Change the background color and overlay",
      "Add a new CTA button in the center",
      "Change all text colors in this section",
      "Restructure this section layout",
      "Make this section more visually impactful",
      "Add a divider at the bottom of this section"
    ]
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
            
            {pendingResult ? (
              <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4 flex flex-col gap-4">
                <p className="text-xs text-orange-200 leading-relaxed">
                  ✨ AI generated a new style. Check the canvas to preview the changes.
                </p>
                <div className="flex gap-2 mt-1">
                  <button 
                    onClick={() => {
                      onApplyAI()
                      setPendingResult(null)
                      onPreviewChange(false)
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold py-2 rounded-lg transition-colors border border-green-500"
                  >
                    Apply
                  </button>
                  <button 
                    onClick={() => {
                      onDiscardAI()
                      setPendingResult(null)
                      onPreviewChange(false)
                    }}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2 rounded-lg transition-colors border border-white/10"
                  >
                    Discard
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Prompt Box */}
                <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-white/20 transition-all">
                  <textarea
                    value={prompt}
                    onChange={e => {
                      setPrompt(e.target.value)
                      promptRef.current = e.target.value
                      if (error) setError('')
                    }}
                    placeholder="Describe what you want... e.g. Add a wave divider at the bottom"
                    className="w-full h-24 p-3 text-sm resize-none bg-transparent text-white focus:outline-none placeholder:text-white/30"
                    disabled={refining}
                  />
                  
                  <div className="p-2 pt-0 flex justify-between items-center bg-black/20">
                    <span className="text-[10px] text-white/40 pl-1">
                      {credits === null ? '' : 
                       credits === 0 ? (
                         <a href="https://zorxm13.vercel.app/pricing" target="_blank" rel="noreferrer" className="text-red-400 hover:text-red-300">
                           Upgrade → zorxm13.vercel.app/pricing
                         </a>
                       ) : (
                         `✦ ${credits} generations remaining`
                       )}
                    </span>
                    <button
                      onClick={() => handleRefine(promptRef.current)}
                      disabled={!prompt.trim() || refining}
                      className="px-4 py-1.5 bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white hover:bg-white/20 disabled:opacity-30 transition-all flex items-center gap-2"
                    >
                      {refining ? 'Thinking...' : 'Refine →'}
                    </button>
                  </div>
                </div>
                
                {error && (
                  <p className="text-[11px] text-red-400 mt-[-12px] px-1 bg-red-900/20 py-2 border-l border-red-500">{error}</p>
                )}

                {/* Quick Prompts */}
                <div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">
                    Quick prompts
                  </p>
                  <div className="flex flex-col gap-2">
                    {getQuickPrompts().map((txt, i) => (
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
              </>
            )}

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
