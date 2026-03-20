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
      <div className="w-[300px] bg-white 
        border-l border-[#E2E8F0] 
        flex items-center justify-center 
        flex-shrink-0">
        <p className="text-xs text-[#94A3B8] 
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
    <div className="w-[300px] bg-white 
      border-l border-[#E2E8F0] 
      flex flex-col flex-shrink-0">
      
      {/* Header Context Bar */}
      <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center gap-2 bg-[#F8F9FA]">
        <div className="w-1.5 h-1.5 rounded-full bg-[#166534]"></div>
        <span className="text-xs font-medium text-[#94A3B8]">
          {typeLabel} — <span className="capitalize text-[#1A1A1A]">{nameLabel}</span>
        </span>
      </div>

      {/* Tabs */}
      <div className="p-3 border-b border-[#E2E8F0] bg-[#F8F9FA]">
        <div className="flex bg-white rounded-lg p-1 gap-1 border border-[#E2E8F0]">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'ai' 
                ? 'bg-[#166534] text-white shadow-sm' 
                : 'text-[#64748B] hover:text-[#1A1A1A] hover:bg-[#F8F9FA]'
            }`}
          >
            ✦ AI Assistant
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'manual' 
                ? 'bg-[#166534] text-white shadow-sm' 
                : 'text-[#64748B] hover:text-[#1A1A1A] hover:bg-[#F8F9FA]'
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
              <div className="bg-[#FFFBEB] border border-[#FCD34D] rounded-xl p-4 flex flex-col gap-4">
                <p className="text-xs text-[#D97706] leading-relaxed">
                  ✨ AI generated a new style. Check the canvas to preview the changes.
                </p>
                <div className="flex gap-2 mt-1">
                  <button 
                    onClick={() => {
                      onApplyAI()
                      setPendingResult(null)
                      onPreviewChange(false)
                    }}
                    className="flex-1 bg-[#166534]-white text-xs font-semibold py-2 rounded-lg transition-colors border border-[#166534]"
                  >
                    Apply
                  </button>
                  <button 
                    onClick={() => {
                      onDiscardAI()
                      setPendingResult(null)
                      onPreviewChange(false)
                    }}
                    className="flex-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1A1A1A] text-xs font-semibold py-2 rounded-lg transition-colors border border-[#E2E8F0]"
                  >
                    Discard
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Prompt Box */}
                <div className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl overflow-hidden focus-within:border-[#166534] transition-all">
                  <textarea
                    value={prompt}
                    onChange={e => {
                      setPrompt(e.target.value)
                      promptRef.current = e.target.value
                      if (error) setError('')
                    }}
                    placeholder="Describe what you want... e.g. Add a wave divider at the bottom"
                    className="w-full h-24 p-3 text-sm resize-none bg-transparent text-[#1A1A1A] focus:outline-none placeholder:text-[#94A3B8]"
                    disabled={refining}
                  />
                  
                  <div className="p-2 pt-0 flex justify-between items-center bg-[#F8F9FA]">
                    <span className="text-[10px] text-[#94A3B8] pl-1">
                      {credits === null ? '' : 
                       credits === 0 ? (
                         <a href="https://zorxm13.vercel.app/pricing" target="_blank" rel="noreferrer" className="text-[#DC2626] hover:text-red-500">
                           Upgrade → zorxm13.vercel.app/pricing
                         </a>
                       ) : (
                         `✦ ${credits} generations remaining`
                       )}
                    </span>
                    <button
                      onClick={() => handleRefine(promptRef.current)}
                      disabled={!prompt.trim() || refining}
                      className="px-4 py-1.5 bg-[#166534]-white hover:bg-[#145228] disabled:opacity-30 transition-all flex items-center gap-2"
                    >
                      {refining ? 'Working...' : 'Refine ✦'}
                    </button>
                  </div>
                </div>
                
                {error && (
                  <p className="text-[11px] text-red-400 mt-[-12px] px-1 bg-red-900/20 py-2 border-l border-red-500">{error}</p>
                )}

                {/* Quick Prompts */}
                <div className="pt-2">
                  <p className="text-[10px] text-[#94A3B8]">Suggestions</p>
                  <div className="flex flex-col gap-1.5">
                    {getQuickPrompts().map((p, i) => (
                      <button
                        key={i}
                        onClick={() => handleRefine(p)}
                        className="text-left text-xs text-[#64748B] bg-[#F8F9FA] hover:bg-[#F0FDF4] hover:text-[#166534] px-3 py-2 rounded-lg border border-[#E2E8F0] transition-all truncate"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
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
